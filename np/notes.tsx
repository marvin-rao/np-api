import { useRequest } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectId, useProjectRequest } from "./projects";
import { Note, NotesFolder, ObjectId, ServerResult } from "./types";

export const { useNotes, useAddNote, useUpdateNote, useDeleteNote } =
  generateEntityHooks<"note", Note>({
    entityName: "note",
    path: "notes",
  });

/**
 * Move a note to the Trash (soft-delete). The note is hidden from normal
 * listings but still stored on the server until either restored via
 * `useRestoreNote` or permanently removed via `useDeleteNote`.
 *
 * Backend: POST /notes/trash?projectId=<id>  body: { id }
 */
export const useTrashNote = () =>
  useProjectRequest<ObjectId>({ path: "notes/trash", method: "post" });

/**
 * Restore a previously trashed note. The note is moved back to its original
 * folder (or to the default folder if that folder no longer exists).
 *
 * Backend: POST /notes/restore?projectId=<id>  body: { id }
 */
export const useRestoreNote = () =>
  useProjectRequest<ObjectId>({ path: "notes/restore", method: "post" });

export const {
  useNotesFolders,
  useAddNotesFolder,
  useUpdateNotesFolder,
  useDeleteNotesFolder,
} = generateEntityHooks<"notesFolder", NotesFolder>({
  entityName: "notesFolder",
  path: "notes/folders",
});

/**
 * Generate a note draft from a natural-language prompt.
 * The backend proxies the call to the LLM provider so the API key never
 * leaves the server.
 *
 * Backend contract:
 *   POST /notes/generate?projectId=<id>
 *   Body: { prompt: string, model?: string }
 *   Response: ServerResult<{ title: string, contentHtml: string }>
 */
export interface GenerateNoteRequest {
  prompt: string;
  model?: string;
}

export interface GeneratedNotePayload {
  title: string;
  contentHtml: string;
}

export const useGenerateNote = () => {
  const { projectId } = useProjectId();
  return useRequest<GenerateNoteRequest, ServerResult<GeneratedNotePayload>>({
    path: "notes/generate",
    method: "post",
    options: { queryString: `?projectId=${projectId}` },
    enabled: !!projectId,
  });
};
