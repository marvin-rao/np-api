import { useEffect, useState } from "react";
import { useGet, useRequest } from "../helper/ApiRequestsBase";
import { RequestMethod } from "../helper/fetchUtils";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { Creator, ProjectCompany, ServerResult, Workspace } from "./types";

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
    // Cache the workspace list and persist it across reloads.
    persist: true,
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
  params,
}: {
  path: string;
  enabled?: boolean;
  /**
   * Extra query parameters, appended after `projectId`. Entries that are
   * undefined or empty are dropped, so a caller can pass an optional value
   * straight through without building the string itself.
   */
  params?: Record<string, string | undefined>;
}) => {
  const { projectId } = useProjectId();
  const query = params ?? {};
  // `Object.keys` rather than `Object.entries`: this package targets an older
  // lib than es2017.
  const extra = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== "")
    .map(
      (key) =>
        `&${encodeURIComponent(key)}=${encodeURIComponent(
          query[key] as string
        )}`
    )
    .join("");
  return useGet<T>({
    path,
    options: { queryString: `?projectId=${projectId}${extra}` },
    // `extra` is part of the URL, so it has to be part of the cache key too —
    // otherwise two callers asking for different scopes of the same path would
    // share one entry and see each other's results.
    deps: [projectId, extra],
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

export interface AIModelUsageData {
  service: "AnalyzeCV";
  model: "gpt-5";
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  metadata?: {
    [key: string]: any;
  };
}

export type AiUsage = {
  projectId: string;
  created: number;
  creator: Creator;
} & AIModelUsageData;

export type StorageResult = {
  recruit: {
    applications: {
      totalSize: number;
      fileCount: number;
    };
  };
};

export type EmailUsage = {
  projectId: string;
  usage: {
    recipientEmail: string;
    templateAlias: string;
  };
  created: number;
  creator: Creator;
  app: "Recruit" | "Leave" | "WorkspaceManager" | "Calendar";
  service:
    | "NotifyPreviousApplicantOfNewJobPost"
    | "SubmitToClientEmail"
    | "JobApplicationStatusUpdate"
    | "JobApplicationReceivedEmail"
    | "NewJobApplicationEmailToAdmin"
    | "LeaveRequestEmail"
    | "LeaveApprovedEmail"
    | "WorkSpaceInvitationEmail"
    | "CalendarEventInvitationEmail";
};

export type ProjectUsageSummary = {
  ai: {
    summary: {
      totalCalls: number;
      totalInputTokens: number;
      totalOutputTokens: number;
      totalTokens: number;
      byService: Record<
        string,
        {
          calls: number;
          inputTokens: number;
          outputTokens: number;
          totalTokens: number;
        }
      >;
    };
    recentUsage: AiUsage[];
    limits: {
      workspaceChat: {
        monthlyTokenCap: number;
        monthlyTokensUsed: number;
        monthResetsAt: number;
      };
    };
  };
  storage: StorageResult;
  email: {
    totalEmailUsage: number;
    recentUsage: EmailUsage[];
  };
};

export const useProjectUsage = () => {
  return useProjectGetBase<ProjectUsageSummary>({
    path: "projects/usage",
  });
};
