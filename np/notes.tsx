import { useProjectId, useProjectRequest } from "../api";
import { useGet } from "../helper/ApiRequestsBase";
import { Note } from "./types";

export const useNotes = () => {
  const { projectId } = useProjectId();
  return useGet<Note[]>({
    path: "notes",
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useAddNote = () => {
  return useProjectRequest<Note>({ path: "notes", method: "post" });
};

export const useUpdateNote = () => {
  return useProjectRequest<Note>({ path: "notes", method: "patch" });
};

export const useDeleteNote = () => {
  return useProjectRequest<{ id: string }>({ path: "notes", method: "delete" });
};
