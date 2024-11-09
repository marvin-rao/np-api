import { useProjectGetBase, useProjectRequest } from "./projects";
import { ObjectId, RecruitProfile, RecruitSkill, SkillCategory } from "./types";

export const useRecruitUsers = () => {
  return useProjectGetBase<RecruitProfile[]>({ path: "recruit/users" });
};

const path = "recruit/skills";

export const useRecruitSkills = () => {
  return useProjectGetBase<RecruitSkill[]>({ path });
};

export const useDeleteSkill = () => {
  return useProjectRequest<ObjectId>({ path, method: "delete" });
};

export const useAddSkill = () => {
  return useProjectRequest<RecruitSkill>({ path, method: "post" });
};

export const useUpdateSkill = () => {
  return useProjectRequest<RecruitSkill>({ path, method: "PATCH" });
};

// Category

const c_path = path + "/category";

export const useRecruitSkillsCategories = () => {
  return useProjectGetBase<RecruitSkill[]>({ path: c_path });
};

// SS

export const useAddSkillCategory = () => {
  return useProjectRequest<SkillCategory>({ path: c_path, method: "post" });
};

export const useUpdateSkillCategory = () => {
  return useProjectRequest<SkillCategory>({ path: c_path, method: "PATCH" });
};

export const useDeleteSkillCategory = () => {
  return useProjectRequest<ObjectId>({ path: c_path, method: "delete" });
};
