import { useGet, usePost } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectGetBase, useProjectRequest } from "./projects";
import {
  JobApplication,
  JobPost,
  ObjectId,
  RecruitProfile,
  RecruitSkill,
  SkillCategory,
} from "./types";

// Users
export const useRecruitUsers = () => {
  return useProjectGetBase<RecruitProfile[]>({ path: "recruit/users" });
};

export const useRecruitSessionProfile = () => {
  return useProjectGetBase<RecruitProfile>({
    path: "recruit/users/session_profile",
  });
};

export const useUpdateRecruitProfile = () => {
  return useProjectRequest<RecruitProfile>({
    path: `recruit/users/session_profile`,
    method: "PATCH",
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

export const {
  useJobPosts,
  useDeleteJobPost,
  useUpdateJobPost,
  useAddJobPost,
} = generateEntityHooks<"jobPost", JobPost>({
  entityName: "jobPost",
  path: "recruit/job_posts",
});

export const { useJobBoardPosts } = generateEntityHooks<
  "jobBoardPost",
  JobPost
>({
  entityName: "jobBoardPost",
  path: "recruit/job_board/posts",
});

export const {
  useAddJobApplication,
  useDeleteJobApplication,
  useJobApplications,
  useUpdateJobApplication,
} = generateEntityHooks<"jobApplication", JobApplication>({
  entityName: "jobApplication",
  path: "recruit/job_applications",
});

export const useJobPost = (id: string) => {
  return useProjectGetBase<JobPost>({
    path: `recruit/job_posts/get_one/${id}`,
  });
};

// Public

export const usePublicJobPost = ({
  postId,
  projectId,
}: {
  postId: string;
  projectId: string;
}) => {
  return useGet<JobPost>({
    path: `recruit_public/job_posts/${projectId}/get_one/${postId}`,
    deps: [postId, projectId],
    options: {},
  });
};

export const usePublicJobPosts = ({ projectId }: { projectId: string }) => {
  return useGet<JobPost>({
    path: `recruit_public/job_posts/${projectId}`,
    deps: [projectId],
    options: {},
  });
};

export const useAddPublicJobApplication = ({
  projectId,
}: {
  projectId: string;
}) => {
  return usePost({
    path: `recruit_public/job_applications/${projectId}`,
    options: {},
  });
};

export const { useUserJobApplications } = generateEntityHooks<
  "userJobApplication",
  JobPost
>({
  entityName: "userJobApplication",
  path: "account_users/applications",
});
