import { useState } from "react";
import { useGet } from "./helper/ApiRequestsBase";
import { useAuthData } from "./helper/provider";
import { getBToken } from "./helper/utils";
import { RefreshTokenResult } from "./np/types";

export interface ProjectUser {
  name: string;
  firstname: string;
  lastname: string;
  avatar?: {
    original?: string;
  };
  id: string;
}

export const useUsers = ({ projectId }: { projectId: string }) => {
  return useGet<ProjectUser[]>({
    path: "users",
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useAccountProfile = () => {
  return useGet({ path: "account/profile", options: {} });
};

type SuccessResult = {
  data: RefreshTokenResult;
  message: string;
};

export const useRefreshToken = () => {
  const { apiBaseUrl } = useAuthData();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async (
    { refresh_token }: { refresh_token: string },
    onSuccess?: (data: SuccessResult) => void
  ): Promise<SuccessResult | undefined> => {
    if (!apiBaseUrl) {
      alert("Dev:Provide apiBaseUrl in Auth Context");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiBaseUrl + "account/refresh_token", {
        method: "post",
        headers: {
          Authorization: `Bearer ${getBToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token }),
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
      setError(err as Error);
      return undefined;
    } finally {
      setLoading(false);
      return undefined;
    }
  };

  return { submit };
};
