import { useState, useCallback, useEffect } from "react";
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
  const url =
    joinUrl(apiBaseUrl, path) + (projectId ? `?projectId=${projectId}` : "");

  const token = getBToken();
  const hasValidToken = token && !isTokenExpired(token);

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
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP ${response.status}`);
  }

  return response.json();
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
const useBaseQuery = <T,>(
  path: string,
  projectId?: string,
  deps: any[] = []
): QueryResult<T> => {
  const { apiBaseUrl } = useAuthData();
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isRefetchingByUser, setIsRefetchingByUser] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(
    async (isUserTriggered = false) => {
      if (isUserTriggered) {
        setIsRefetchingByUser(true);
      } else {
        setLoading(true);
      }
      setIsRefetching(true);
      setError("");

      try {
        const response = await apiRequest<T>(
          "get",
          path,
          apiBaseUrl,
          undefined,
          projectId
        );
        setResult(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
        setIsRefetching(false);
        setIsRefetchingByUser(false);
      }
    },
    [path, projectId, apiBaseUrl, ...deps]
  );

  const refetch = useCallback(() => fetchData(false), [fetchData]);
  const refetchByUser = useCallback(() => fetchData(true), [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return {
    result,
    loading,
    error,
    refetch,
    refetchByUser,
    isRefetching,
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
  if (!file.url && !file.id.startsWith("temp_")) {
    return { passed: false, message: "File URL is required" };
  }
  return { passed: true, message: "" };
};

export const useFileAppFiles = (projectId?: string) => {
  return useBaseQuery<AppFile[]>("files_app", projectId);
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
      setError("");

      // basic validation
      if (!data?.id) {
        setError("File ID is required");
        return;
      }

      setLoading(true);

      const deletePath = `files_app`;
      const bodyWithProj = { id: data.id, projectId };
      apiRequest<ResultData>(
        "delete",
        deletePath,
        apiBaseUrl,
        bodyWithProj,
        projectId ?? undefined
      )
        .then((result) => {
          setLoading(false);
          if (onComplete) {
            onComplete(result.message, result.data);
          }
        })
        .catch((err) => {
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
