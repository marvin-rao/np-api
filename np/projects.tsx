import { useEffect, useState } from "react";
import { RequestMethod, useGet, useRequest } from "../helper/ApiRequestsBase";
import { getBToken } from "../helper/utils";
import { ServerResult, Workspace } from "./types";

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
