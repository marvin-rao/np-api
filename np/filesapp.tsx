import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectRequest, useProjectId } from "./projects";
import { useGet } from "../helper/ApiRequestsBase";
import {
  AppFile,
  CreateFileShareLinkInput,
  CreateSavedSignatureInput,
  FileShareLink,
  ResolvedFileShareLink,
  SavedSignature,
  UpdateSavedSignatureInput,
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
  const { projectId } = useProjectId();
  const params: string[] = [];
  if (projectId) params.push(`projectId=${encodeURIComponent(projectId)}`);
  if (options?.fileId) params.push(`fileId=${encodeURIComponent(options.fileId)}`);
  if (options?.folderId) params.push(`folderId=${encodeURIComponent(options.folderId)}`);
  return useGet<FileShareLink[]>({
    path: "files_app/share_links",
    options: { queryString: params.length ? `?${params.join("&")}` : "" },
    deps: [projectId, options?.fileId, options?.folderId],
    enabled: options?.enabled !== false && !!projectId,
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

// Public — resolve a share link by token. No auth required; the token is
// the credential. Used by the sharing landing page in the SPA to render
// the shared file/folder for an unauthenticated visitor.
export const useResolveFilesAppShareLink = ({
  projectId,
  token,
  enabled = true,
}: {
  projectId: string;
  token: string;
  enabled?: boolean;
}) => {
  return useGet<ResolvedFileShareLink>({
    path: `sharing/files/${projectId}/${token}/info`,
    options: {},
    deps: [projectId, token],
    enabled: enabled && !!projectId && !!token,
  });
};

// Saved Signatures — personal, per-user reusable signatures the user can
// pick from the PDF signer instead of drawing/typing one every time.

export const useSavedSignatures = (options?: { enabled?: boolean }) => {
  const { projectId } = useProjectId();
  const params: string[] = [];
  if (projectId) params.push(`projectId=${encodeURIComponent(projectId)}`);
  return useGet<SavedSignature[]>({
    path: "files_app/saved_signatures",
    options: { queryString: params.length ? `?${params.join("&")}` : "" },
    deps: [projectId],
    enabled: options?.enabled !== false && !!projectId,
  });
};

export const useCreateSavedSignature = () => {
  return useProjectRequest<CreateSavedSignatureInput>({
    path: "files_app/saved_signatures",
    method: "post",
  });
};

export const useUpdateSavedSignature = () => {
  return useProjectRequest<UpdateSavedSignatureInput>({
    path: "files_app/saved_signatures",
    method: "PATCH",
  });
};

export const useDeleteSavedSignature = () => {
  return useProjectRequest<{ id: string }>({
    path: "files_app/saved_signatures",
    method: "delete",
  });
};

