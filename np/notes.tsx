import { useRequest } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectGetBase, useProjectId, useProjectRequest } from "./projects";
import { Note, NotesFolder, NoteVersion, ObjectId, ServerResult } from "./types";

/**
 * Which product's records a listing should return.
 *
 * Notes and Canvas (the board app) share one collection — a board is a note
 * record — so an app that wants only its own work says which it is. The server
 * tells them apart by the `originId` each app writes; that encoding stays on
 * the server, so callers only ever name the app.
 *
 * Omit it and you get everything, which is what every existing caller does.
 */
export type NoteApp = "notes" | "canvas";

type NotesQuery = { enabled?: boolean; app?: NoteApp };

const {
  useNotes: useNotesBase,
  useAddNote,
  useUpdateNote,
  useDeleteNote,
} = generateEntityHooks<"note", Note>({
  entityName: "note",
  path: "notes",
});

export { useAddNote, useUpdateNote, useDeleteNote };

export const useNotes = (options?: NotesQuery) =>
  useNotesBase({ enabled: options?.enabled, params: { app: options?.app } });

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

/**
 * Fetch the version history for a note (newest-first). Versions are
 * snapshotted by the backend on every write — see `useRestoreNoteVersion`
 * to roll a note back to one of them.
 *
 * Backend: GET /notes/versions/:id?projectId=<id>
 */
export const useNoteVersions = (noteId: string | undefined) =>
  useProjectGetBase<{ versions: NoteVersion[] }>({
    path: `notes/versions/${noteId ?? ""}`,
    enabled: !!noteId,
  });

/**
 * Roll a note back to the state captured by `versionId`. The current
 * state is snapshotted first so the restore is itself reversible.
 *
 * Backend: POST /notes/versions/restore?projectId=<id>
 *   body: { id, versionId }
 */
export const useRestoreNoteVersion = () =>
  useProjectRequest<{ id: string; versionId: string }>({
    path: "notes/versions/restore",
    method: "post",
  });

const {
  useNotesFolders: useNotesFoldersBase,
  useAddNotesFolder,
  useUpdateNotesFolder,
  useDeleteNotesFolder,
} = generateEntityHooks<"notesFolder", NotesFolder>({
  entityName: "notesFolder",
  path: "notes/folders",
});

export { useAddNotesFolder, useUpdateNotesFolder, useDeleteNotesFolder };

/** Scoped the same way as `useNotes`. The default folder is always included. */
export const useNotesFolders = (options?: NotesQuery) =>
  useNotesFoldersBase({
    enabled: options?.enabled,
    params: { app: options?.app },
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
