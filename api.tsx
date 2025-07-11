import { useGet } from "./helper/ApiRequestsBase";
import { useProjectGetBase } from "./np/projects";

type Avatar = {
  original?: string;
};

export interface ProjectUser {
  name: string;
  firstname: string;
  lastname: string;
  avatar?: Avatar;
  id: string;
  accountId?: string;
  role?: "admin" | "user";
}

export const useUsers = () => {
  return useProjectGetBase<ProjectUser[]>({ path: "users" });
};

export const useAccountProfile = () => {
  return useGet<{ name: string; avatar: Avatar; email: string }>({
    path: "account/profile",
    options: {},
  });
};
