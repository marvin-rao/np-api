import { RequestMethod, useGet, useRequest } from "./helper/ApiRequestsBase";
import { ServerResult } from "./np/types";

export interface ProjectUser {
  name: string;
  firstname: string;
  lastname: string;
  avatar?: {
    original?: string;
  };
  id: string;
}

export const useProjectId = () => {
  return {
    projectId: "-NMhDe6D2TVZqwDwdpTb",
  };
};

export const useProjectRequest = <ObjectType,>({
  method,
  path,
}: {
  path: string;
  method: RequestMethod;
}) => {
  const { projectId } = useProjectId();
  return useRequest<ObjectType, ServerResult>({
    path,
    method,
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useProjects = () => {
  return useGet({ path: "projects/list", options: {} });
};

// Users

export const useUsers = ({ projectId }: { projectId: string }) => {
  return useGet<ProjectUser[]>({
    path: "users",
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useAccountProfile = () => {
  return useGet({ path: "account/profile", options: {} });
};
