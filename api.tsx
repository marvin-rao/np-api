import { useDelete, useGet, usePatch, usePost } from "./AuthHelper";

// NP, will remove this to NP, an extension of this.

const path = "developer/apps";

export const useDeveloperApps = () => {
  return useGet({ path, options: {} });
};

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

export const useProjects = () => {
  return useGet({ path: "projects/list", options: {} });
};

export const useAddDeveloperApp = () => {
  return usePost({ path });
};

export const useUpdateDeveloperApp = () => {
  return usePatch({ path });
};

export const useDeleteDeveloperApp = () => {
  return useDelete({ path });
};
