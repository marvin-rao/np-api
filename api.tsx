import { useState } from "react";
import { apiRequest, useGet } from "./helper/ApiRequestsBase";
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
  const apiBaseUrl = "https://newpaper.app/api/";
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

    return apiRequest<{ refresh_token: string }, SuccessResult>({
      url: "https://newpaper.app/api/account/refresh_token",
      onSuccess: (data) => onSuccess?.(data),
      body: { refresh_token },
      onError: setError,
      onLoadingChange: setLoading,
      method: "post",
      headers: {
        Authorization: `Bearer ${getBToken()}`,
        "Content-Type": "application/json",
      },
    });
  };

  return { submit, error, loading };
};
