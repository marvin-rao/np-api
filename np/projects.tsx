import { useEffect, useState } from "react";
import { useGet, useRequest } from "../helper/ApiRequestsBase";
import { RequestMethod } from "../helper/fetchUtils";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { ProjectCompany, ServerResult, Workspace } from "./types";

function getWorkspaceIdFromUrl(): string | null {
  const match = window.location.pathname.match(/\/workspace\/([^/]+)/);
  return match ? match[1] : null;
}

export function getProjectIdFromQuery(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("projectId");
}

export function getCaptiveModeFromQuery(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("captiveMode");
}

function getProjectId(): string | null {
  // First try to get from URL path
  const fromPath = getWorkspaceIdFromUrl();
  if (fromPath) {
    return fromPath;
  }

  // If not found in path, try query string
  return getProjectIdFromQuery();
}

export const useProjectId = () => {
  const [projectId, setProjectId] = useState<string | null>(getProjectId());

  useEffect(() => {
    const handlePopState = () => {
      setProjectId(getProjectId());
    };

    const handleLocationChange = () => {
      setProjectId(getProjectId());
    };

    // Listen for popstate event to detect URL changes
    window.addEventListener("popstate", handlePopState);

    // Listen for hashchange to catch query parameter changes
    window.addEventListener("hashchange", handleLocationChange);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  return {
    projectId,
  };
};

export const useProjects = () => {
  return useGet<Workspace[]>({
    path: "projects/list",
    options: {},
  });
};

export const useCreateWorkspace = () => {
  return useRequest<Workspace, ServerResult<Workspace>>({
    path: "projects",
    method: "post",
    options: {},
  });
};

export const useWorkspace = ({ projectId }: { projectId: string }) => {
  return useProjectGetBase<Workspace>({ path: `project/${projectId}/meta` });
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

export const useProjectGetBase = <T,>({
  path,
  enabled,
}: {
  path: string;
  enabled?: boolean;
}) => {
  const { projectId } = useProjectId();
  return useGet<T>({
    path,
    options: { queryString: `?projectId=${projectId}` },
    deps: [projectId],
    enabled,
  });
};

export const { useUpdateProjectCompany } = generateEntityHooks<
  "projectCompany",
  ProjectCompany
>({
  entityName: "projectCompany",
  path: "project/company",
});

export const useProjectCompany = () => {
  return useProjectGetBase<ProjectCompany>({ path: "project/company" });
};
