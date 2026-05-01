import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectGetBase, useProjectRequest } from "./projects";
import {
  AppFile,
  CreateFileShareLinkInput,
  FileShareLink,
} from "./types";

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

// Share Links

export const useFilesAppShareLinks = (options?: {
  enabled?: boolean;
  fileId?: string;
  folderId?: string;
}) => {
  const params: string[] = [];
  if (options?.fileId) params.push(`fileId=${encodeURIComponent(options.fileId)}`);
  if (options?.folderId) params.push(`folderId=${encodeURIComponent(options.folderId)}`);
  const path = params.length
    ? `files_app/share_links?${params.join("&")}`
    : "files_app/share_links";
  return useProjectGetBase<FileShareLink[]>({
    path,
    enabled: options?.enabled,
  });
};

export const useCreateFilesAppShareLink = () => {
  return useProjectRequest<CreateFileShareLinkInput>({
    path: "files_app/share_links",
    method: "post",
  });
};

export const useRevokeFilesAppShareLink = () => {
  return useProjectRequest<{ token: string }>({
    path: "files_app/share_links",
    method: "delete",
  });
};

