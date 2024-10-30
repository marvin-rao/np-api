import {
  RequestMethod,
  useDelete,
  useGet,
  usePatch,
  usePost,
  useRequest,
} from "./helper/ApiRequestsBase";

const path = "developer/apps";

export const useDeveloperApps = () => {
  return useGet({ path, options: {} });
};

export interface ProjectUser {
  name: string;
  firstname: string;
  lastname: string;
  avatar?: {
    original?: string;
  };
  id: string;
}

export const useProjectId = () => {
  return {
    projectId: "-NMhDe6D2TVZqwDwdpTb",
  };
};

export const useProjectRequest = ({
  method,
  path,
}: {
  path: string;
  method: RequestMethod;
}) => {
  const { projectId } = useProjectId();
  return useRequest({
    path,
    method,
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useProjects = () => {
  return useGet({ path: "projects/list", options: {} });
};

// Developer

export const useAddDeveloperApp = () => {
  return usePost({ path });
};

export const useUpdateDeveloperApp = () => {
  return usePatch({ path });
};

export const useDeleteDeveloperApp = () => {
  return useDelete({ path });
};

export const useAccountProfile = () => {
  return useGet({ path: "account/profile", options: {} });
};

// Users

export const useUsers = ({ projectId }: { projectId: string }) => {
  return useGet<ProjectUser[]>({
    path: "users",
    options: { queryString: `?projectId=${projectId}` },
  });
};

// Notes

export const useNotes = () => {
  const { projectId } = useProjectId();
  return useGet<any[]>({
    path: "notes",
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useAddNote = () => {
  return useProjectRequest({ path: "notes", method: "post" });
};

export const useUpdateNote = () => {
  return useProjectRequest({ path: "notes", method: "patch" });
};

export const useDeleteNote = () => {
  return useProjectRequest({ path: "notes", method: "delete" });
};
