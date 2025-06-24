// @ts-ignore
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthData } from "./provider";
import { getBToken, isTokenExpired, useHeaders } from "./utils";

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  queryString?: string;
};

type UseFetchWithTokenProps = {
  path: string;
  options: FetchOptions;
  deps?: Array<string | undefined | null>;
  enabled?: boolean;
};

export const useGet = <T,>({
  path,
  options = {},
  deps = [],
  enabled,
}: UseFetchWithTokenProps) => {
  const { apiBaseUrl } = useAuthData();

  const fetchData = async (): Promise<T | undefined> => {
    const url = apiBaseUrl + path + (options?.queryString ?? "");
    console.log("Making request to:", url);

    // Only add Authorization header if we have a token
    const token = getBToken();
    const headers: Record<string, string> = {};
    const hasValidToken = token && !isTokenExpired(token);
    if (hasValidToken) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Adding Authorization header");
    } else {
      console.log(
        "No valid token, making request without Authorization header"
      );
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      ...(Object.keys(headers).length > 0 && { headers }),
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: hasValidToken ? "omit" : "include",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result?.data ?? undefined;
  };

  const { refetch, data, error, isLoading } = useQuery({
    queryKey: [path, deps],
    queryFn: fetchData,
    enabled,
  });

  return {
    data: data,
    error: error,
    loading: isLoading,
    refetch,
  };
};

type UsePostProps = {
  path: string;
  options?: FetchOptions;
};

// PATCH, because in fetch patch doesn't normalize to PATCH
// https://github.com/nodejs/node/issues/51336
export type RequestMethod = "post" | "PATCH" | "delete";

export type RequestDeps = Array<string | undefined>;

type RequestProps<ObjectType, SuccessResult> = {
  body: ObjectType;
  method: RequestMethod;
  onSuccess: (data: SuccessResult) => void;
  onError: (error: Error | null) => void;
  onLoadingChange: (loading: boolean) => void;
  headers: any;
  url: string;
  enabled?: boolean;
};

export const apiRequest = async <ObjectType, SuccessResult>(
  props: RequestProps<ObjectType, SuccessResult>
): Promise<SuccessResult | undefined> => {
  const { onLoadingChange, onError, onSuccess, body, method, headers, url } =
    props;
  const { enabled = true } = props;

  if (!enabled) {
    console.log("Not enabled");
    return;
  }

  if (!url) {
    alert("Dev:Provide url in Auth Context");
    return;
  }
  onLoadingChange(true);
  onError(null);

  const token = getBToken();
  const hasValidToken = token && !isTokenExpired(token);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
      credentials: hasValidToken ? "omit" : "include",
    });

    if (!response.ok) {
      const result = await response.json();
      console.log("error:result?.data", result);
      onError(result);
      return;
    }

    const result: SuccessResult = await response.json();
    if (onSuccess) {
      onSuccess(result);
    }
    return result;
  } catch (err) {
    onError(err as Error);
    onLoadingChange(false);
    return undefined;
  }
};

export const useRequest = <ObjectType, SuccessResult>({
  path,
  method,
  options = {},
  enabled = true,
}: UsePostProps & {
  method: RequestMethod;
  options?: FetchOptions;
  enabled?: boolean;
}) => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { getHeaders } = useHeaders();

  const submit = async (
    body: ObjectType,
    onSuccess?: (data: SuccessResult) => void
  ): Promise<SuccessResult | undefined> => {
    if (!apiBaseUrl) {
      alert("Dev:Provide apiBaseUrl in Auth Context");
      return;
    }

    apiRequest<ObjectType, SuccessResult>({
      onSuccess: (data) => {
        onSuccess?.(data);
        setLoading(false);
      },
      url: apiBaseUrl + path + (options?.queryString ?? ""),
      body,
      onError: (error) => {
        setError(error);
        console.log("GotError", error);
        setLoading(false);
      },
      onLoadingChange: setLoading,
      method,
      headers: await getHeaders(),
      enabled,
    });
  };

  return { loading, error, submit };
};

export const usePost = <ObjectType, SuccessResult>({
  path,
  options,
}: UsePostProps) => {
  return useRequest<ObjectType, SuccessResult>({
    path,
    method: "post",
    options,
  });
};

export const useDelete = <ObjectType, SuccessResult>({
  path,
  options,
}: UsePostProps) => {
  return useRequest<ObjectType, SuccessResult>({
    path,
    method: "delete",
    options,
  });
};

export const usePatch = <ObjectType, SuccessResult>({
  path,
  options,
}: UsePostProps) => {
  return useRequest<ObjectType, SuccessResult>({
    path,
    method: "PATCH",
    options,
  });
};
