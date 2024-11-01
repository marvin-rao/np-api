import {
  useDelete,
  useGet,
  usePatch,
  usePost,
} from "../helper/ApiRequestsBase";

const path = "developer/apps";

export const useDeveloperApps = () => {
  return useGet({ path, options: {} });
};

export const useAddDeveloperApp = () => {
  return usePost({ path });
};

export const useUpdateDeveloperApp = () => {
  return usePatch({ path });
};

export const useDeleteDeveloperApp = () => {
  return useDelete({ path });
};
