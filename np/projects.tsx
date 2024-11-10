import { RequestMethod, useGet, useRequest } from "../helper/ApiRequestsBase";
import { getBToken } from "../helper/utils";
import { ServerResult, Workspace } from "./types";
import { useEffect, useState } from "react";

export const useProjectId = () => {
  const extractProjectIdFromPath = (): string | null => {
    // Match the pattern /projects/:projectId in the pathname
    const match = window.location.pathname.match(/^\/projects\/([^/]+)$/);
    return match ? match[1] : null;
  };

  const [projectId, setProjectId] = useState<string | null>(
    extractProjectIdFromPath()
  );

  useEffect(() => {
    const handlePopState = () => {
      setProjectId(extractProjectIdFromPath());
    };

    // Listen for popstate event to detect URL changes
    window.addEventListener("popstate", handlePopState);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return {
    projectId,
  };
};

export const useProjects = () => {
  const token = getBToken();
  return useGet<Workspace[]>({
    path: "projects/list",
    options: {},
    enabled: !!token,
  });
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
    enabled: !!projectId,
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
