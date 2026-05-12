// Hooks & types for the workspace (project-scoped) AI chat.
// Each user has their own threads under a given project.
//
// Backend endpoints (all auto-injected with ?projectId=<currentProject>):
//   POST   /chat/workspace/sessions
//   GET    /chat/workspace/sessions
//   GET    /chat/workspace/sessions/:sessionId/history
//   PUT    /chat/workspace/sessions/:sessionId
//   DELETE /chat/workspace/sessions/:sessionId
//   POST   /chat/workspace/ai/chat              { message, sessionId }

import { useProjectGetBase, useProjectRequest } from "./projects";
import { ServerResult } from "./types";

export interface NpAiWorkspaceChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created: number;
  sessionId: string;
  projectId: string;
  sessionUid: string;
}

export interface NpAiWorkspaceChatSession {
  id: string;
  title: string;
  projectId: string;
  sessionUid: string;
  created: number;
  updated: number;
  messageCount: number;
  lastMessage?: string;
}

export interface NpAiWorkspaceChatResponse {
  message: string;
}

export const useCreateNpAiWorkspaceSession = () => {
  return useProjectRequest<{ title?: string }>({
    path: "chat/workspace/sessions",
    method: "post",
  });
};

export const useGetNpAiWorkspaceSessions = (props?: { enabled?: boolean }) => {
  return useProjectGetBase<NpAiWorkspaceChatSession[]>({
    path: "chat/workspace/sessions",
    enabled: props?.enabled,
  });
};

export const useGetNpAiWorkspaceSessionHistory = ({
  sessionId,
  enabled,
}: {
  sessionId: string;
  enabled?: boolean;
}) => {
  return useProjectGetBase<NpAiWorkspaceChatMessage[]>({
    path: `chat/workspace/sessions/${sessionId}/history`,
    enabled: enabled !== undefined ? enabled : !!sessionId,
  });
};

export const useUpdateNpAiWorkspaceSession = ({
  sessionId,
}: {
  sessionId: string;
}) => {
  return useProjectRequest<{ title?: string }>({
    path: `chat/workspace/sessions/${sessionId}`,
    method: "PATCH",
  });
};

export const useDeleteNpAiWorkspaceSession = ({
  sessionId,
}: {
  sessionId: string;
}) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/sessions/${sessionId}`,
    method: "delete",
  });
};

export const useNpAiWorkspaceChat = () => {
  return useProjectRequest<{ message: string; sessionId: string }>({
    path: "chat/workspace/ai/chat",
    method: "post",
  });
};

export type NpAiWorkspaceChatServerResponse = ServerResult<NpAiWorkspaceChatResponse>;
