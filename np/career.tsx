import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { JobPost } from "./types";

export const { useDeleteSavedJobPost, useAddSavedJobPost } =
  generateEntityHooks<"savedJobPost", JobPost>({
    entityName: "savedJobPost",
    path: "career/jobs/saves",
  });
