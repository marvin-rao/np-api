import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthData } from "../helper/provider";
import { getBToken, isTokenExpired } from "../helper/utils";

// ============================================================================
// TYPES (standalone versions of what's in common repo)
// ============================================================================

export type Creator = {
  projectUid: string;
  sessionUid: string;
  name: string;
  created: number;
};

export type AppFile = {
  id: string;
  url: string;
  size: number;
  creator: Creator;
  created: number;
  updated?: number;
  mimeType: string;
  name?: string;
  type?: "file" | "folder";
  folderId?: string;
  sharedWith?: string[];
};

export type ApiValidatorResult = {
  passed: boolean;
  message: string;
  path?: string;
};

export type MutationResult<T> = {
  submit: <ResultData>(
    data: T,
    onComplete?: (message: string, data?: ResultData) => void
  ) => void;
  loading: boolean;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

export type QueryResult<T> = {
  result: T | null;
  loading: boolean;
  error: string;
  refetch: () => void;
  refetchByUser: () => void;
  isRefetching: boolean;
  isRefetchingByUser: boolean;
};

// HTTP methods
export type ApiVerb = "get" | "post" | "patch" | "delete";

// Helper to safely join base URL and path without duplicate slashes
const joinUrl = (base: string, path: string) => {
  if (!base) return path;
  const sanitizedBase = base.replace(/\/+$/, ""); // remove trailing slashes
  const sanitizedPath = path.replace(/^\/+/, ""); // remove leading slashes
  return `${sanitizedBase}/${sanitizedPath}`;
};

// Generic API request function
const apiRequest = async <T,>(
  method: ApiVerb,
  path: string,
  apiBaseUrl: string,
  data?: any,
  projectId?: string
): Promise<{ data: T; message: string }> => {
  console.log("🌐 [API_REQUEST] Starting request", {
    method: method.toUpperCase(),
    path,
    apiBaseUrl,
    data,
    projectId,
    timestamp: new Date().toISOString(),
  });

  const url =
    joinUrl(apiBaseUrl, path) + (projectId ? `?projectId=${projectId}` : "");

  const token = getBToken();
  const hasValidToken = token && !isTokenExpired(token);

  console.log("🔐 [API_REQUEST] Token info", {
    hasToken: !!token,
    hasValidToken,
    tokenLength: token?.length,
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (hasValidToken) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method: method.toUpperCase(),
    headers,
    credentials: hasValidToken ? "omit" : "include",
  };

  if (data && method !== "get") {
    options.body = JSON.stringify(data);
    console.log("📦 [API_REQUEST] Request body", {
      rawData: data,
      stringifiedBody: JSON.stringify(data),
    });
  }

  console.log("🔗 [API_REQUEST] Final request details", {
    url,
    method: options.method,
    headers: { ...headers },
    body: options.body,
    credentials: options.credentials,
  });

  try {
    const response = await fetch(url, options);

    console.log("📡 [API_REQUEST] Response received", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Array.from(response.headers.entries()),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ [API_REQUEST] Error response", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url,
      });
      throw new Error(errorData || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ [API_REQUEST] Success response", {
      result,
      url,
    });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("💥 [API_REQUEST] Network or parsing error", {
      error,
      message: errorMessage,
      stack: errorStack,
      url,
    });
    throw error;
  }
};

const useBaseMutation = <T,>(
  path: string,
  method: ApiVerb,
  validator: (data: T) => ApiValidatorResult,
  projectId?: string
): MutationResult<T> => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = useCallback(
    <ResultData,>(
      data: T,
      onComplete?: (message: string, data?: ResultData) => void
    ) => {
      setError("");

      // Validate data first
      const { passed, message } = validator(data);
      if (!passed) {
        setError(message);
        return;
      }

      setLoading(true);

      apiRequest<ResultData>(method, path, apiBaseUrl, data, projectId)
        .then((result) => {
          setLoading(false);
          if (onComplete) {
            onComplete(result.message, result.data);
          }
        })
        .catch((err) => {
          setLoading(false);
          setError(err.message || "An error occurred");
        });
    },
    [path, method, validator, projectId, apiBaseUrl]
  );

  return { submit, loading, error, setError };
};

// Base query hook
//
// Backed by react-query so consumers automatically get:
//   - request de-dupe across components
//   - background refetch on window focus / reconnect
//   - shared cache (a sibling component sees the same data instantly)
//   - opt-in offline persistence via `options.persist`
//
// The return shape is preserved 1:1 with the previous useState-based
// implementation so existing callers don't need to change.
type BaseQueryOptions = {
  /**
   * When true, this query's successful results are written to IndexedDB by
   * the persister set up in `AuthProvider`. On next load (including offline)
   * the cached value renders immediately while a background refetch runs.
   *
   * Default: false (in-memory only). Opt in at the call site for stable
   * data; leave off for anything time-sensitive (signed URLs, share links
   * with expiry, anything containing PII you don't want on disk).
   */
  persist?: boolean;
};

export type { BaseQueryOptions };

const useBaseQuery = <T,>(
  path: string,
  projectId?: string,
  deps: any[] = [],
  options: BaseQueryOptions = {}
): QueryResult<T> => {
  const { apiBaseUrl } = useAuthData();
  const { persist = false } = options;

  // Track user-initiated refetches separately from background ones so
  // callers can show a different spinner for "pull to refresh" vs silent
  // revalidation.
  const [isRefetchingByUser, setIsRefetchingByUser] = useState(false);

  const meta = useMemo(
    () => (persist ? { persist: true } : undefined),
    [persist]
  );

  // TEMP debug — verify meta wiring.
  console.log("[useBaseQuery]", { path, projectId, persist, meta });

  const query = useQuery<T>({
    queryKey: [path, projectId, ...deps],
    queryFn: async () => {
      const response = await apiRequest<T>(
        "get",
        path,
        apiBaseUrl,
        undefined,
        projectId
      );
      return response.data;
    },
    enabled: !!apiBaseUrl,
    meta,
  });

  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  const refetchByUser = useCallback(async () => {
    setIsRefetchingByUser(true);
    try {
      await query.refetch();
    } finally {
      setIsRefetchingByUser(false);
    }
  }, [query]);

  return {
    result: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "" : "",
    refetch,
    refetchByUser,
    isRefetching: query.isFetching,
    isRefetchingByUser,
  };
};

// ============================================================================
// FILE-SPECIFIC VALIDATORS
// ============================================================================

const validateAppFile = (file: AppFile): ApiValidatorResult => {
  if (!file) {
    return { passed: false, message: "File data is required" };
  }
  if (!file.name) {
    return { passed: false, message: "File name is required" };
  }
  const isFolder = file.type === "folder";
  if (!isFolder && !file.url && !file.id.startsWith("temp_")) {
    return { passed: false, message: "File URL is required" };
  }
  return { passed: true, message: "" };
};

export const useFileAppFiles = (
  projectId?: string,
  options?: BaseQueryOptions
) => {
  return useBaseQuery<AppFile[]>("files_app", projectId, [], options);
};

export const useAddFilesAppFile = (projectId?: string) => {
  return useBaseMutation<AppFile>(
    "files_app",
    "post",
    validateAppFile,
    projectId
  );
};

export const useUpdateFilesAppFile = (projectId?: string) => {
  return useBaseMutation<AppFile>(
    "files_app",
    "patch",
    validateAppFile,
    projectId
  );
};

export const useDeleteFilesAppFile = (projectId?: string) => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = useCallback(
    <ResultData,>(
      data: { id: string },
      onComplete?: (message: string, data?: ResultData) => void
    ) => {
      console.log("🗑️ [DELETE] Starting delete operation", {
        fileId: data?.id,
        projectId,
        apiBaseUrl,
        timestamp: new Date().toISOString(),
      });

      setError("");

      // basic validation
      if (!data?.id) {
        const errorMsg = "File ID is required";
        console.error("🗑️ [DELETE] Validation failed:", errorMsg);
        setError(errorMsg);
        return;
      }

      setLoading(true);
      console.log("🗑️ [DELETE] Setting loading state to true");

      const deletePath = `files_app`;
      const bodyWithProj = { id: data.id, projectId };

      console.log("🗑️ [DELETE] Request details:", {
        method: "DELETE",
        path: deletePath,
        body: bodyWithProj,
        fullUrl: `${apiBaseUrl}/${deletePath}`,
      });

      apiRequest<ResultData>(
        "delete",
        deletePath,
        apiBaseUrl,
        bodyWithProj,
        projectId ?? undefined
      )
        .then((result) => {
          console.log("🗑️ [DELETE] Success response:", {
            result,
            message: result.message,
            data: result.data,
          });
          setLoading(false);
          if (onComplete) {
            console.log("🗑️ [DELETE] Calling onComplete callback");
            onComplete(result.message, result.data);
          }
        })
        .catch((err) => {
          console.error("🗑️ [DELETE] Error occurred:", {
            error: err,
            message: err.message,
            status: err.status,
            statusText: err.statusText,
            response: err.response,
            stack: err.stack,
          });
          setLoading(false);
          setError(err.message || "Delete failed");
        });
    },
    [apiBaseUrl, projectId]
  );

  return { submit, loading, error, setError } as MutationResult<{ id: string }>;
};

export type DownloadKeys = { [key: string]: boolean };

export const useWebFileUpload = () => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState<DownloadKeys>({});

  const uploadFile = async <T,>(
    id: string,
    file: File,
    onComplete: (result: T) => void,
    uploadPath: string
  ) => {
    if (!file) {
      throw new Error("File is required");
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading((prev) => ({ ...prev, [id]: true }));

    const token = getBToken();
    const hasValidToken = token && !isTokenExpired(token);

    const headers: HeadersInit = {};
    if (hasValidToken) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const fullUrl = joinUrl(apiBaseUrl, uploadPath);
      console.log("[uploadFile] Starting upload", {
        id,
        fullUrl,
        fileName: file.name,
        fileSize: file.size,
        hasValidToken,
      });

      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData,
        headers,
        credentials: hasValidToken ? "omit" : "include",
      });

      if (!response.ok) {
        console.error(
          "[uploadFile] Upload failed",
          response.status,
          response.statusText
        );
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("[uploadFile] Upload success", { id, result });
      onComplete(result.data);
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setLoading((prev) => {
        const newLoading = { ...prev };
        delete newLoading[id];
        return newLoading;
      });
      console.log("[uploadFile] Upload finished", { id });
    }
  };

  const uploadFileFromBlob = (
    id: string,
    blob: Blob,
    filename: string,
    uploadPath: string
  ): Promise<AppFile> => {
    return new Promise((resolve, reject) => {
      const file = new File([blob], filename, { type: blob.type });
      uploadFile<AppFile>(id, file, resolve, uploadPath).catch(reject);
    });
  };

  return {
    loading,
    uploadFile,
    uploadFileFromBlob,
    performUpload: uploadFile,
  };
};

export const useWebNativeFileUpload = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { uploadFile, loading } = useWebFileUpload();

  const uploadFileFromUri = async ({
    id,
    uri,
  }: {
    id: string;
    uri: string;
  }): Promise<AppFile> => {
    // For web, uri might be a blob URL or base64
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      uploadFile<AppFile>(
        id,
        new File([blob], "uploaded_file", { type: blob.type }),
        resolve,
        `files/upload_any?projectId=${projectId}`
      ).catch(reject);
    });
  };

  const uploadImageFromFile = async (file: File): Promise<AppFile> => {
    const id = Date.now().toString();
    return new Promise((resolve, reject) => {
      uploadFile<AppFile>(
        id,
        file,
        resolve,
        `images?projectId=${projectId}`
      ).catch(reject);
    });
  };

  return {
    loading,
    uploadFileFromUri,
    uploadImageFromFile,
  };
};
