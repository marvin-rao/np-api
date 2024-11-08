// @ts-ignore
import { useEffect, useState } from "react";
import { useAuthData } from "./provider";
import { useHeaders } from "./utils";

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
};

export const useGet = <T,>({
  path,
  options = {},
  deps,
}: UseFetchWithTokenProps) => {
  const { apiBaseUrl } = useAuthData();
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const intDeps = deps ?? [];
  const { getHeaders } = useHeaders();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        apiBaseUrl + path + (options?.queryString ?? ""),
        {
          method: options.method || "GET",
          headers: await getHeaders(),
          body: JSON.stringify(options.body),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result?.data ?? undefined);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [path]);

  return { data, loading, error, refetch: fetchData };
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
};

export const apiRequest = async <ObjectType, SuccessResult>(
  props: RequestProps<ObjectType, SuccessResult>
): Promise<SuccessResult | undefined> => {
  const { onLoadingChange, onError, onSuccess, body, method, headers, url } =
    props;
  if (!url) {
    alert("Dev:Provide url in Auth Context");
    return;
  }
  onLoadingChange(true);
  onError(null);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result: SuccessResult = await response.json();
    console.log("result", result);
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
}: UsePostProps & {
  method: RequestMethod;
  options?: FetchOptions;
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
      },
      url: apiBaseUrl + path + (options?.queryString ?? ""),
      body,
      onError: setError,
      onLoadingChange: setLoading,
      method,
      headers: await getHeaders(),
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
