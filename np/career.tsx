import { useDelete, usePost } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { JobPost, ServerResult } from "./types";

export const { useSavedJobPosts } = generateEntityHooks<
  "savedJobPost",
  JobPost
>({
  entityName: "savedJobPost",
  path: "career/jobs/saves",
});

export type SaveJobProps = {
  jobPostId: string;
  projectId: string;
};

export const useAddSavedJobPost = () => {
  return usePost<SaveJobProps, ServerResult>({
    path: `career/jobs/saves`,
    options: {},
  });
};

export const useDeleteSavedJobPost = () => {
  return useDelete<SaveJobProps, ServerResult>({
    path: `career/jobs/saves`,
    options: {},
  });
};

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
