import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectRequest } from "./projects";
import { Note, NotesFolder } from "./types";

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
 *   Response: { title: string, contentHtml: string }
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
  return useProjectRequest<GenerateNoteRequest>({
    path: "notes/generate",
    method: "post",
  });
};
