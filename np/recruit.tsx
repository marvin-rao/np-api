import { useProjectGetBase, useProjectRequest } from "./projects";
import { ObjectId, RecruitProfile, RecruitSkill, SkillCategory } from "./types";

// Users
export const useRecruitUsers = () => {
  return useProjectGetBase<RecruitProfile[]>({ path: "recruit/users" });
};

export const useRecruitSessionProfile = () => {
  return useProjectGetBase<RecruitProfile>({
    path: "recruit/users/session_profile",
  });
};

export const useRecruitProfile = ({ userId }: { userId: string }) => {
  return useProjectGetBase<RecruitProfile>({
    path: `recruit/users/profile/${userId}`,
  });
};

// Skills
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
  return useProjectGetBase<RecruitSkill>({ path: c_path });
};

export const useAddSkillCategory = () => {
  return useProjectRequest<SkillCategory>({ path: c_path, method: "post" });
};

export const useUpdateSkillCategory = () => {
  return useProjectRequest<SkillCategory>({ path: c_path, method: "PATCH" });
};

export const useDeleteSkillCategory = () => {
  return useProjectRequest<ObjectId>({ path: c_path, method: "delete" });
};
