//

import { useProjectId, useProjectRequest } from "../api";
import { useGet } from "../helper/ApiRequestsBase";

// Recruit
export const useRecruitUsers = () => {
  const { projectId } = useProjectId();
  return useGet<any[]>({
    path: "recruit/users",
    options: { queryString: `?projectId=${projectId}` },
  });
};

const path = "recruit/skills";

export const useRecruitSkills = () => {
  const { projectId } = useProjectId();
  return useGet<any[]>({
    path,
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useDeleteSkill = () => {
  return useProjectRequest({ path, method: "delete" });
};

export const useAddSkill = () => {
  return useProjectRequest({ path, method: "post" });
};

export const useUpdateSkill = () => {
  return useProjectRequest({ path, method: "patch" });
};
