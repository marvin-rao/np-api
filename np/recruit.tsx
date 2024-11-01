import { useProjectId, useProjectRequest } from "../api";
import { useGet } from "../helper/ApiRequestsBase";
import { RecruitSkill } from "./types";

export const useRecruitUsers = () => {
  const { projectId } = useProjectId();
  return useGet<RecruitSkill[]>({
    path: "recruit/users",
    options: { queryString: `?projectId=${projectId}` },
  });
};

const path = "recruit/skills";

export const useRecruitSkills = () => {
  const { projectId } = useProjectId();
  return useGet<RecruitSkill[]>({
    path,
    options: { queryString: `?projectId=${projectId}` },
  });
};

export const useDeleteSkill = () => {
  return useProjectRequest<{ id: string }>({ path, method: "delete" });
};

export const useAddSkill = () => {
  return useProjectRequest<RecruitSkill>({ path, method: "post" });
};

export const useUpdateSkill = () => {
  return useProjectRequest<RecruitSkill>({ path, method: "patch" });
};
