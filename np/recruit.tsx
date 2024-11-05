import { useGet } from "../helper/ApiRequestsBase";
import { useProjectId, useProjectRequest } from "./projects";
import { RecruitSkill } from "./types";

export const useRecruitUsers = () => {
  const { projectId } = useProjectId();
  return useGet<RecruitSkill[]>({
    path: "recruit/users",
    options: { queryString: `?projectId=${projectId}` },
    deps: [projectId],
  });
};

const path = "recruit/skills";

export const useRecruitSkills = () => {
  const { projectId } = useProjectId();
  return useGet<RecruitSkill[]>({
    path,
    options: { queryString: `?projectId=${projectId}` },
    deps: [projectId],
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
