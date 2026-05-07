import { generateEntityHooks } from "./hooks/generateEntityHooks";
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
