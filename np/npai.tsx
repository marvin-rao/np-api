// Hooks & types for the general-purpose AI chat app (np-ai).
// Kept separate from `np/chat.tsx` (which is scoped to the existing
// career chat) to avoid touching that surface.
//
// Backend endpoints used here:
//   POST   /chat/personal/general/sessions
//   GET    /chat/personal/general/sessions
//   GET    /chat/personal/general/sessions/:sessionId/history
//   DELETE /chat/personal/general/sessions/:sessionId
//   POST   /general/ai/chat                 { message, sessionId }

import { useDelete, useGet, usePost } from "../helper/ApiRequestsBase";
import { ServerResult } from "./types";

export type NpAiAppType = "general";

export interface NpAiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created: number;
  sessionId: string;
  appType: NpAiAppType;
}

export interface NpAiChatSession {
  id: string;
  title: string;
  appType: NpAiAppType;
  created: number;
  updated: number;
  messageCount: number;
  lastMessage?: string;
}

export interface NpAiChatResponse {
  message: string;
}

const APP_TYPE: NpAiAppType = "general";

export const useCreateNpAiSession = () => {
  return usePost<
    { title?: string; metadata?: { [key: string]: any } },
    ServerResult
  >({
    path: `chat/personal/${APP_TYPE}/sessions`,
    options: {},
  });
};

export const useGetNpAiSessions = () => {
  return useGet<NpAiChatSession[]>({
    path: `chat/personal/${APP_TYPE}/sessions`,
    options: {},
  });
};

export const useGetNpAiSessionHistory = ({
  sessionId,
}: {
  sessionId: string;
}) => {
  return useGet<NpAiChatMessage[]>({
    path: `chat/personal/${APP_TYPE}/sessions/${sessionId}/history`,
    options: {},
    enabled: !!sessionId,
    deps: [sessionId],
  });
};

export const useDeleteNpAiSession = ({
  sessionId,
}: {
  sessionId: string;
}) => {
  return useDelete<undefined, ServerResult>({
    path: `chat/personal/${APP_TYPE}/sessions/${sessionId}`,
    options: {},
  });
};

export const useNpAiChat = () => {
  return usePost<
    { message: string; sessionId: string },
    ServerResult<NpAiChatResponse>
  >({
    path: `general/ai/chat`,
    options: {},
  });
};
