import { useGet, usePost } from "../helper/ApiRequestsBase";
import { ServerResult } from "./types";

export type ChatSessionProps = {
  jobPostId: string;
  projectId: string;
};

export interface CareerAiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PersonalChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created: number;
  sessionId: string;
  appType: "career";
}

export type PersonalChatAppType = "career";

export interface PersonalChatSession {
  id: string;
  title: string;
  appType: PersonalChatAppType;
  created: number;
  updated: number;
  messageCount: number;
  lastMessage?: string;
}

export const useCreatePersonalChatSession = ({
  appType,
}: {
  appType: "career";
}) => {
  return usePost<
    { title?: string; metadata?: { [key: string]: any } },
    ServerResult
  >({
    path: `chat/personal/${appType}/sessions`,
    options: {},
  });
};

export const useGetPersonalChatSessions = ({
  appType,
}: {
  appType: "career";
}) => {
  return useGet<PersonalChatSession[]>({
    path: `chat/personal/${appType}/sessions`,
    options: {},
  });
};

export const useGetPersonalChatSessionHistory = ({
  appType,
  sessionId,
}: {
  appType: "career";
  sessionId: string;
}) => {
  return useGet<PersonalChatMessage[]>({
    path: `chat/personal/${appType}/sessions/${sessionId}/history`,
    options: {},
  });
};

export const useCareerAiChat = () => {
  return usePost<{ message: string; sessionId: string }, ServerResult>({
    path: `career/ai/chat`,
    options: {},
  });
};
