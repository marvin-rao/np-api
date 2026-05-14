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

export interface NpAiWorkspaceChatMessageAttachment {
  id: string;
  name: string;
  mime: string;
  kind: "file" | "image";
  url?: string;
  size?: number;
}

export interface NpAiWorkspaceChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created: number;
  sessionId: string;
  projectId: string;
  sessionUid: string;
  /** Inline cards the AI attached to this message (e.g. a memory it just saved). */
  cards?: NpAiWorkspaceChatCard[];
  /** Files/images that were attached to this turn (user messages only). */
  attachments?: NpAiWorkspaceChatMessageAttachment[];
}

/**
 * Discriminated union of cards the AI can render inline in a chat message.
 * Add new variants here as more tools are introduced.
 */
export type NpAiWorkspaceChatCard =
  | {
      kind: "memory";
      memoryId: string;
      content: string;
    }
  | {
      kind: "info";
      eyebrow?: string;
      title: string;
      subtitle?: string;
      items?: { label: string; value?: string }[];
      links?: { label: string; url: string }[];
      accent?: "neutral" | "blue" | "purple" | "green" | "amber" | "pink";
    }
  | {
      kind: "link";
      url: string;
      title: string;
      description?: string;
      imageUrl?: string;
      source?: string;
    }
  | {
      kind: "image";
      imageUrl: string;
      alt?: string;
      title?: string;
      caption?: string;
      url?: string;
    }
  | {
      kind: "gallery";
      title?: string;
      images: { imageUrl: string; alt?: string; caption?: string; url?: string }[];
    }
  | {
      /** Downloadable file (PDF, doc, zip, audio, video, etc.). */
      kind: "file";
      url: string;
      name: string;
      /** Mime type, e.g. "application/pdf". Used to pick an icon. */
      mime?: string;
      /** Size in bytes (for display). */
      size?: number;
      description?: string;
    }
  | {
      /** A note the AI created in the user's notes app. */
      kind: "note";
      noteId: string;
      folderId: string;
      folderName: string;
      projectId: string;
      title: string;
      /** Plain text excerpt for the collapsed preview (~280 chars). */
      excerpt: string;
      /** Full HTML content for the in-card expand view. */
      contentHtml: string;
    }
  | {
      /** An email the AI sent on behalf of the user (to themself). */
      kind: "email";
      /** Address the email was delivered to. */
      to: string;
      subject: string;
      /** Plain-text excerpt of the body (≈280 chars) for the collapsed preview. */
      excerpt: string;
      /** Full HTML body for the in-card expand view. */
      bodyHtml: string;
      /** When the send completed (ms). */
      sentAt: number;
    };

export interface NpAiWorkspaceChatSession {
  id: string;
  title: string;
  projectId: string;
  sessionUid: string;
  created: number;
  updated: number;
  messageCount: number;
  lastMessage?: string;
  aiProjectId?: string;
}

export interface NpAiWorkspaceChatResponse {
  message: string;
}

export const useCreateNpAiWorkspaceSession = () => {
  return useProjectRequest<{ title?: string; aiProjectId?: string }>({
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

export interface NpAiWorkspaceChatProgress {
  stage:
    | "starting"
    | "thinking"
    | "tool_running"
    | "tool_done"
    | "tool_error"
    | "saving"
    | "done"
    | "error";
  message: string;
  round?: number;
  tool?: string;
  updated: number;
}

/**
 * Live progress of an in-flight chat round (server writes "Thinking…",
 * "Creating note…", etc to RTDB; this fetches the current value). Returns
 * null when nothing is in flight. Poll from the consumer via `refetch`.
 */
export const useGetNpAiWorkspaceSessionProgress = ({
  sessionId,
  enabled,
}: {
  sessionId: string;
  enabled?: boolean;
}) => {
  return useProjectGetBase<NpAiWorkspaceChatProgress | null>({
    path: `chat/workspace/sessions/${sessionId}/progress`,
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
  /** "file" (default) when uploaded; "url" when added as a web link. */
  sourceType?: "file" | "url";
  /** Original URL for sourceType === "url". */
  sourceUrl?: string;
  /** Last successful crawl timestamp for sourceType === "url". */
  lastCrawled?: number;
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

// ---------- AI Projects (per-user) ----------
//
// Backend endpoints (all auto-injected with ?projectId=<currentProject>):
//   GET    /chat/workspace/aiProjects
//   POST   /chat/workspace/aiProjects                                 { title?, summary?, instructions? }
//   GET    /chat/workspace/aiProjects/:aiProjectId
//   PATCH  /chat/workspace/aiProjects/:aiProjectId                    { title?, summary?, instructions? }
//   DELETE /chat/workspace/aiProjects/:aiProjectId
//
//   GET    /chat/workspace/aiProjects/:aiProjectId/knowledge/meta
//   PATCH  /chat/workspace/aiProjects/:aiProjectId/knowledge/meta     { instructions }
//   GET    /chat/workspace/aiProjects/:aiProjectId/knowledge/documents
//   POST   /chat/workspace/aiProjects/:aiProjectId/knowledge/documents  multipart "file"
//   PATCH  /chat/workspace/aiProjects/:aiProjectId/knowledge/documents/:docId  { name }
//   DELETE /chat/workspace/aiProjects/:aiProjectId/knowledge/documents/:docId

export interface NpAiWorkspaceAiProject {
  id: string;
  title: string;
  summary: string;
  instructions: string;
  color?: string;
  projectId: string;
  sessionUid: string;
  created: number;
  updated: number;
}

export const useGetNpAiWorkspaceAiProjects = (props?: { enabled?: boolean }) => {
  return useProjectGetBase<NpAiWorkspaceAiProject[]>({
    path: "chat/workspace/aiProjects",
    enabled: props?.enabled,
  });
};

export const useGetNpAiWorkspaceAiProject = ({
  aiProjectId,
  enabled,
}: {
  aiProjectId: string;
  enabled?: boolean;
}) => {
  return useProjectGetBase<NpAiWorkspaceAiProject>({
    path: `chat/workspace/aiProjects/${aiProjectId}`,
    enabled: enabled !== undefined ? enabled : !!aiProjectId,
  });
};

export const useCreateNpAiWorkspaceAiProject = () => {
  return useProjectRequest<{
    title?: string;
    summary?: string;
    instructions?: string;
    color?: string;
  }>({
    path: "chat/workspace/aiProjects",
    method: "post",
  });
};

export const useUpdateNpAiWorkspaceAiProject = ({
  aiProjectId,
}: {
  aiProjectId: string;
}) => {
  return useProjectRequest<{
    title?: string;
    summary?: string;
    instructions?: string;
    color?: string;
  }>({
    path: `chat/workspace/aiProjects/${aiProjectId}`,
    method: "PATCH",
  });
};

export const useDeleteNpAiWorkspaceAiProject = ({
  aiProjectId,
}: {
  aiProjectId: string;
}) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/aiProjects/${aiProjectId}`,
    method: "delete",
  });
};

// Per-project knowledge: identical shape to workspace knowledge, scoped to one AI project.

export const useGetNpAiWorkspaceAiProjectKnowledgeMeta = ({
  aiProjectId,
  enabled,
}: {
  aiProjectId: string;
  enabled?: boolean;
}) => {
  return useProjectGetBase<NpAiWorkspaceKnowledgeMeta>({
    path: `chat/workspace/aiProjects/${aiProjectId}/knowledge/meta`,
    enabled: enabled !== undefined ? enabled : !!aiProjectId,
  });
};

export const useUpdateNpAiWorkspaceAiProjectKnowledgeMeta = ({
  aiProjectId,
}: {
  aiProjectId: string;
}) => {
  return useProjectRequest<{ instructions: string }>({
    path: `chat/workspace/aiProjects/${aiProjectId}/knowledge/meta`,
    method: "PATCH",
  });
};

export const useGetNpAiWorkspaceAiProjectKnowledgeDocuments = ({
  aiProjectId,
  enabled,
}: {
  aiProjectId: string;
  enabled?: boolean;
}) => {
  return useProjectGetBase<NpAiWorkspaceKnowledgeDocument[]>({
    path: `chat/workspace/aiProjects/${aiProjectId}/knowledge/documents`,
    enabled: enabled !== undefined ? enabled : !!aiProjectId,
  });
};

export const useUpdateNpAiWorkspaceAiProjectKnowledgeDocument = ({
  aiProjectId,
  docId,
}: {
  aiProjectId: string;
  docId: string;
}) => {
  return useProjectRequest<{ name?: string }>({
    path: `chat/workspace/aiProjects/${aiProjectId}/knowledge/documents/${docId}`,
    method: "PATCH",
  });
};

export const useDeleteNpAiWorkspaceAiProjectKnowledgeDocument = ({
  aiProjectId,
  docId,
}: {
  aiProjectId: string;
  docId: string;
}) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/aiProjects/${aiProjectId}/knowledge/documents/${docId}`,
    method: "delete",
  });
};

export const useUploadNpAiWorkspaceAiProjectKnowledgeDocument = ({
  aiProjectId,
}: {
  aiProjectId: string;
}) => {
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
    if (!aiProjectId) {
      setError("No AI project selected");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const token = getBToken();
      const res = await axios.post(
        `${apiBaseUrl}chat/workspace/aiProjects/${aiProjectId}/knowledge/documents?projectId=${projectId}`,
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

// ---------- Knowledge URL (crawl & re-crawl) ----------

export const useAddNpAiWorkspaceKnowledgeUrl = () => {
  return useProjectRequest<{ url: string }>({
    path: "chat/workspace/knowledge/urls",
    method: "post",
  });
};

export const useRecrawlNpAiWorkspaceKnowledgeUrl = ({ docId }: { docId: string }) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/knowledge/documents/${docId}/recrawl`,
    method: "post",
  });
};

export const useAddNpAiWorkspaceAiProjectKnowledgeUrl = ({
  aiProjectId,
}: {
  aiProjectId: string;
}) => {
  return useProjectRequest<{ url: string }>({
    path: `chat/workspace/aiProjects/${aiProjectId}/knowledge/urls`,
    method: "post",
  });
};

export const useRecrawlNpAiWorkspaceAiProjectKnowledgeUrl = ({
  aiProjectId,
  docId,
}: {
  aiProjectId: string;
  docId: string;
}) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/aiProjects/${aiProjectId}/knowledge/documents/${docId}/recrawl`,
    method: "post",
  });
};

// ---------- Session attachments (per-chat) ----------

export type NpAiWorkspaceSessionAttachmentKind = "file" | "image";
export type NpAiWorkspaceSessionAttachmentStatus = "ingesting" | "ready" | "failed";

export interface NpAiWorkspaceSessionAttachment {
  id: string;
  sessionId: string;
  name: string;
  mime: string;
  size: number;
  kind: NpAiWorkspaceSessionAttachmentKind;
  storagePath: string;
  url: string;
  tokenCount?: number;
  status: NpAiWorkspaceSessionAttachmentStatus;
  error?: string;
  created: number;
  updated: number;
}

export const useGetNpAiWorkspaceSessionAttachments = ({
  sessionId,
  enabled,
}: {
  sessionId: string;
  enabled?: boolean;
}) => {
  return useProjectGetBase<NpAiWorkspaceSessionAttachment[]>({
    path: `chat/workspace/sessions/${sessionId}/attachments`,
    enabled: enabled !== undefined ? enabled : !!sessionId,
  });
};

export const useDeleteNpAiWorkspaceSessionAttachment = ({
  sessionId,
  attachmentId,
}: {
  sessionId: string;
  attachmentId: string;
}) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/sessions/${sessionId}/attachments/${attachmentId}`,
    method: "delete",
  });
};

export const useUploadNpAiWorkspaceSessionAttachment = ({
  sessionId,
}: {
  sessionId: string;
}) => {
  const { apiBaseUrl } = useAuthData();
  const { projectId } = useProjectId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    file: File,
    onSuccess?: (result: ServerResult<NpAiWorkspaceSessionAttachment>) => void
  ) => {
    if (!projectId) {
      setError("No project selected");
      return;
    }
    if (!sessionId) {
      setError("No session selected");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const token = getBToken();
      const res = await axios.post(
        `${apiBaseUrl}chat/workspace/sessions/${sessionId}/attachments?projectId=${projectId}`,
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
      return res.data as ServerResult<NpAiWorkspaceSessionAttachment>;
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, error };
};

// ---------- Memories ----------
//
// Per-user, durable facts the AI has remembered (or the user added) for
// this workspace. Sent in the system prompt of every chat in the workspace.
//
// Backend endpoints (all auto-injected with ?projectId=<currentProject>):
//   GET    /chat/workspace/memories
//   POST   /chat/workspace/memories                { content }
//   PATCH  /chat/workspace/memories/:memoryId      { content }
//   DELETE /chat/workspace/memories/:memoryId

export type NpAiWorkspaceMemorySource = "ai" | "user";

export interface NpAiWorkspaceMemory {
  id: string;
  content: string;
  source: NpAiWorkspaceMemorySource;
  projectId: string;
  sessionUid: string;
  sessionId?: string;
  created: number;
  updated: number;
}

export const useGetNpAiWorkspaceMemories = (props?: { enabled?: boolean }) => {
  return useProjectGetBase<NpAiWorkspaceMemory[]>({
    path: "chat/workspace/memories",
    enabled: props?.enabled,
  });
};

export const useCreateNpAiWorkspaceMemory = () => {
  return useProjectRequest<{ content: string }>({
    path: "chat/workspace/memories",
    method: "post",
  });
};

export const useUpdateNpAiWorkspaceMemory = ({
  memoryId,
}: {
  memoryId: string;
}) => {
  return useProjectRequest<{ content: string }>({
    path: `chat/workspace/memories/${memoryId}`,
    method: "PATCH",
  });
};

export const useDeleteNpAiWorkspaceMemory = ({
  memoryId,
}: {
  memoryId: string;
}) => {
  return useProjectRequest<undefined>({
    path: `chat/workspace/memories/${memoryId}`,
    method: "delete",
  });
};
