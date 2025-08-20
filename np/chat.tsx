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
  metadata?: {
    [key: string]: any; // For app-specific metadata like user profile context
  };
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

export const useGetPersonalChatSession = ({
  appType,
}: {
  appType: "career";
}) => {
  return useGet<ServerResult[]>({
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
    path: `chat/personal/${appType}/sessions/history/${sessionId}`,
    options: {},
  });
};

export const useCareerAiChat = () => {
  return usePost<{ message: string; sessionId: string }, ServerResult>({
    path: `career/ai/chat`,
    options: {},
  });
};
