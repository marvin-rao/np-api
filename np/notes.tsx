import { useRequest } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectId } from "./projects";
import { Note, NotesFolder, ServerResult } from "./types";

export const { useNotes, useAddNote, useUpdateNote, useDeleteNote } =
  generateEntityHooks<"note", Note>({
    entityName: "note",
    path: "notes",
  });

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
