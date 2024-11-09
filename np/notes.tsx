import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { Note } from "./types";

export const { useNotes, useAddNote, useUpdateNote, useDeleteNote } =
  generateEntityHooks<"note", Note>({
    entityName: "note",
    path: "notes",
  });
