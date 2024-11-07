import { useGet, usePost } from "./helper/ApiRequestsBase";
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

export const useRefreshToken = () => {
  return usePost<{ refresh_token: string }, RefreshTokenResult>({
    path: "account/refresh_token",
    options: {},
  });
};
