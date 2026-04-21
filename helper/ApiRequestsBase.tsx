// @ts-ignore
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { appFetch, RequestMethod } from "./fetchUtils";
import { useAuthData } from "./provider";

type FetchOptions = {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
  queryString?: string;
};

type UsePostProps = {
  path: string;
  options?: FetchOptions;
};

export type RequestDeps = Array<string | undefined>;

type RequestProps<ObjectType, SuccessResult> = {
  body: ObjectType;
  method: RequestMethod;
  onSuccess: (data: SuccessResult) => void;
  onError: (error: Error | null) => void;
  onLoadingChange: (loading: boolean) => void;
  url: string;
  enabled?: boolean;
};

export const apiRequest = async <ObjectType, SuccessResult>(
  props: RequestProps<ObjectType, SuccessResult>
): Promise<SuccessResult | undefined> => {
  const { onLoadingChange, onError, onSuccess, body, method, url } = props;
  const { enabled = true } = props;

  if (!enabled) {
    console.log("Not enabled");
    return;
  }

  if (!url) {
    alert("Dev:Provide url in Auth Context");
    return;
  }
  onError(null);
  onLoadingChange(true);

  try {
    const response = await appFetch({ method, url, body });

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

export const useRequest = <ObjectType, SuccessResult>(
  props: UsePostProps & {
    method: RequestMethod;
    options?: FetchOptions;
    enabled?: boolean;
  }
) => {
  const { path, method, options = {}, enabled = true } = props;
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async (
    body: ObjectType,
    onSuccess?: (data: SuccessResult) => void
  ): Promise<SuccessResult | undefined> => {
    if (!apiBaseUrl) {
      alert("Dev:Provide apiBaseUrl in Auth Context");
      return;
    }

    console.log("Starting load");
    setLoading(true);

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
      enabled,
    });
  };

  return { loading, error, submit };
};

// Hooks

type UseFetchWithTokenProps = {
  path: string;
  options: FetchOptions;
  deps?: Array<string | undefined | null>;
  enabled?: boolean;
};

export const useGet = <T,>(props: UseFetchWithTokenProps) => {
  const { apiBaseUrl, onSessionExpired } = useAuthData();
  const { path, options = {}, deps = [], enabled } = props;

  const fetchData = async (): Promise<T | undefined> => {
    const response = await appFetch({
      method: options.method || "GET",
      url: apiBaseUrl + path + (options?.queryString ?? ""),
      body: options.body,
    });

    if (
      response.status === 403 &&
      (await response?.text
        ?.toString()
        .includes("Unauthorized : Provide bearer or cookie"))
    ) {
      onSessionExpired();
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return (await response.json())?.data ?? undefined;
  };

  const { refetch, data, error, isLoading } = useQuery({
    queryKey: [path, deps],
    queryFn: fetchData,
    enabled,
  });

  return { data: data, error: error, loading: isLoading, refetch };
};

export const usePost = <ObjectType, SuccessResult>(props: UsePostProps) => {
  return useRequest<ObjectType, SuccessResult>({
    path: props.path,
    method: "post",
    options: props.options || {},
  });
};

export const useDelete = <ObjectType, SuccessResult>(props: UsePostProps) => {
  return useRequest<ObjectType, SuccessResult>({
    path: props.path,
    method: "delete",
    options: props.options || {},
  });
};

export const usePatch = <ObjectType, SuccessResult>(props: UsePostProps) => {
  return useRequest<ObjectType, SuccessResult>({
    path: props.path,
    method: "PATCH",
    options: props.options,
  });
};
