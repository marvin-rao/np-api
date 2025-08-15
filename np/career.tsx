import { usePost } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { JobPost } from "./types";

export const { useDeleteSavedJobPost, useAddSavedJobPost } =
  generateEntityHooks<"savedJobPost", JobPost>({
    entityName: "savedJobPost",
    path: "career/jobs/saves",
  });

export const useCareerAiChat = () => {
  return usePost({ path: `career/ai/chat`, options: {} });
};
