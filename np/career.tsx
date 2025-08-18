import { usePost } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { JobPost } from "./types";

export const { useDeleteSavedJobPost, useAddSavedJobPost, useSavedJobPosts } =
  generateEntityHooks<"savedJobPost", JobPost>({
    entityName: "savedJobPost",
    path: "career/jobs/saves",
  });

export interface CareerAiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const useCareerAiChat = () => {
  return usePost<{ messages: CareerAiChatMessage[] }, any>({
    path: `career/ai/chat`,
    options: {},
  });
};
