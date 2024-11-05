// @ts-ignore
import React, { useEffect, useState } from "react";
import { useAuthData } from "./provider";
import { getHeaders } from "./utils";

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        apiBaseUrl + path + (options?.queryString ?? ""),
        {
          method: options.method || "GET",
          headers: getHeaders(),
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
  }, [path, intDeps]);

  return { data, loading, error, refetch: fetchData };
};

type UsePostProps = {
  path: string;
  options?: FetchOptions;
};

export type RequestMethod = "post" | "patch" | "delete";

export type RequestDeps = Array<string | undefined>;

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

  const submit = async (
    body: ObjectType,
    onSuccess: (data: SuccessResult) => void
  ) => {
    if (!apiBaseUrl) {
      alert("Dev:Provide apiBaseUrl in Auth Context");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        apiBaseUrl + path + (options?.queryString ?? ""),
        {
          method,
          headers: getHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      console.log("result", result);
      onSuccess(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
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
    method: "patch",
    options,
  });
};
