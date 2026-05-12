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

import axios from "axios";
import { useState } from "react";
import { useAuthData } from "../helper/provider";
import { getBToken } from "../helper/utils";
import { useProjectGetBase, useProjectId, useProjectRequest } from "./projects";
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

// ---------- Knowledge ----------
//
// Backend endpoints (all auto-injected with ?projectId=<currentProject>):
//   GET    /chat/workspace/knowledge/meta
//   PATCH  /chat/workspace/knowledge/meta              { instructions }
//   GET    /chat/workspace/knowledge/documents
//   POST   /chat/workspace/knowledge/documents         multipart "file"
//   PATCH  /chat/workspace/knowledge/documents/:docId  { name }
//   DELETE /chat/workspace/knowledge/documents/:docId

export interface NpAiWorkspaceKnowledgeMeta {
  instructions: string;
  updated: number;
  updatedBy: string;
}

export type NpAiWorkspaceKnowledgeDocStatus = "ingesting" | "ready" | "failed";

export interface NpAiWorkspaceKnowledgeDocument {
  id: string;
  name: string;
  mime: string;
  size: number;
  storagePath: string;
  url: string;
  tokenCount: number;
  status: NpAiWorkspaceKnowledgeDocStatus;
  error?: string;
  uploadedBy: string;
  created: number;
  updated: number;
}

export const useGetNpAiWorkspaceKnowledgeMeta = (props?: { enabled?: boolean }) => {
  return useProjectGetBase<NpAiWorkspaceKnowledgeMeta>({
    path: "chat/workspace/knowledge/meta",
    enabled: props?.enabled,
  });
};

export const useUpdateNpAiWorkspaceKnowledgeMeta = () => {
  return useProjectRequest<{ instructions: string }>({
    path: "chat/workspace/knowledge/meta",
    method: "PATCH",
  });
};

export const useGetNpAiWorkspaceKnowledgeDocuments = (props?: { enabled?: boolean }) => {
  return useProjectGetBase<NpAiWorkspaceKnowledgeDocument[]>({
    path: "chat/workspace/knowledge/documents",
    enabled: props?.enabled,
  });
};

export const useUpdateNpAiWorkspaceKnowledgeDocument = ({ docId }: { docId: string }) => {
  return useProjectRequest<{ name?: string }>({
    path: `chat/workspace/knowledge/documents/${docId}`,
    method: "PATCH",
  });
};

export const useDeleteNpAiWorkspaceKnowledgeDocument = ({ docId }: { docId: string }) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/knowledge/documents/${docId}`,
    method: "delete",
  });
};

export const useUploadNpAiWorkspaceKnowledgeDocument = () => {
  const { apiBaseUrl } = useAuthData();
  const { projectId } = useProjectId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    file: File,
    onSuccess?: (result: ServerResult<NpAiWorkspaceKnowledgeDocument>) => void
  ) => {
    if (!projectId) {
      setError("No project selected");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const token = getBToken();
      const res = await axios.post(
        `${apiBaseUrl}chat/workspace/knowledge/documents?projectId=${projectId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      onSuccess?.(res.data);
      return res.data as ServerResult<NpAiWorkspaceKnowledgeDocument>;
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, error };
};
