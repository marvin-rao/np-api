import { RequestMethod, useGet, useRequest } from "../helper/ApiRequestsBase";
import { ServerResult, Workspace } from "./types";

export const useProjectId = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const projectId = searchParams.get("projectId");

  return {
    projectId,
  };
};

export const useProjects = () => {
  return useGet<Workspace[]>({ path: "projects/list", options: {} });
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

export const useProjectGetBase = <T,>({ path }: { path: string }) => {
  const { projectId } = useProjectId();
  return useGet<T>({
    path,
    options: { queryString: `?projectId=${projectId}` },
    deps: [projectId],
  });
};
