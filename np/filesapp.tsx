import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { AppFile } from "./types";

export const {
  useFilesAppFiles,
  useAddFilesAppFile,
  useUpdateFilesAppFile,
  useDeleteFilesAppFile,
} = generateEntityHooks<"filesAppFile", AppFile>({
  entityName: "filesAppFile",
  path: "files_app",
});

export const {
  useFilesFolders,
  useAddFilesFolder,
  useUpdateFilesFolder,
  useDeleteFilesFolder,
} = generateEntityHooks<"filesFolder", AppFile>({
  entityName: "filesFolder",
  path: "files_app/folders",
});
