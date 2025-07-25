import { useGet, usePatch, usePost } from "../helper/ApiRequestsBase";
import { CareerProfile, TalentUser } from "./career_types";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectGetBase, useProjectId, useProjectRequest } from "./projects";
import {
  JobApplication,
  JobPost,
  ObjectId,
  ProjectCompany,
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
  return useProjectGetBase<RecruitSkill[]>({ path: c_path });
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

export const { useDeleteJobPost, useUpdateJobPost, useAddJobPost } =
  generateEntityHooks<"jobPost", JobPost>({
    entityName: "jobPost",
    path: "recruit/job_posts",
  });

export type JobPostNotification = {
  jobPostId: string;
  // Id of the job post, yes.
  id: string;
  recipients: {
    sessionUid?: string;
    email: string;
    name: string;
    id: string;
  }[];
};

export const { useAddJobPostNotification } = generateEntityHooks<
  "jobPostNotification",
  JobPostNotification
>({
  entityName: "jobPostNotification",
  path: "recruit/job_posts/notify",
});

export const useJobPosts = ({ folder }: { folder: "primary" | "trash" }) => {
  const { projectId } = useProjectId();
  return useGet<JobPost[]>({
    path: `recruit/job_posts`,
    options: {
      queryString: "?projectId=" + projectId + "&folder=" + folder,
    },
    deps: [projectId, folder],
  });
};

export const useGenerateAIPostDetails = () => {
  return useProjectRequest<{ jobTitle: string }>({
    path: "recruit/job_posts/ai/generate_post_details",
    method: "post",
  });
};

export const useGenerateRebrandedCV = () => {
  return useProjectRequest<{ applicationId: string }>({
    path: "recruit/tools/rebrand_cv",
    method: "post",
  });
};

export const { useJobBoardPosts } = generateEntityHooks<
  "jobBoardPost",
  JobPost
>({
  entityName: "jobBoardPost",
  path: "recruit/job_board/posts",
});

// Applications

export const {
  useDeleteJobApplication,
  useJobApplications,
  useUpdateJobApplication,
} = generateEntityHooks<"jobApplication", JobApplication>({
  entityName: "jobApplication",
  path: "recruit/job_applications",
});

export const {
  useTalentUsers,
  useAddTalentUser,
  useUpdateTalentUser,
  useDeleteTalentUser,
} = generateEntityHooks<"talentUser", TalentUser>({
  entityName: "talentUser",
  path: "recruit/talent/users",
});

export const useJobApplication = (id: string) => {
  return useProjectGetBase<JobApplication>({
    path: `recruit/job_applications/get_one/${id}`,
  });
};

// End Application

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

export const usePublicCompany = ({ projectId }: { projectId: string }) => {
  return useGet<ProjectCompany>({
    path: `recruit_public/company/${projectId}`,
    deps: [projectId],
    options: {},
  });
};

export const useAddJobApplication = ({ projectId }: { projectId: string }) => {
  return usePost({
    path: `recruit/job_applications`,
    options: {
      queryString: "?projectId=" + projectId,
    },
  });
};

export const { useUserJobApplications } = generateEntityHooks<
  "userJobApplication",
  JobPost
>({
  entityName: "userJobApplication",
  path: "recruit/account_users/applications",
});

export type ProfileSectionPayload =
  | {
      section: "personalInfo";
      data: CareerProfile["personalInfo"];
    }
  | {
      section: "experiences";
      data: CareerProfile["experiences"];
    }
  | {
      section: "education";
      data: CareerProfile["education"];
    }
  | {
      section: "skills";
      data: CareerProfile["skills"];
    }
  | {
      section: "languages";
      data: CareerProfile["languages"];
    }
  | {
      section: "certifications";
      data: CareerProfile["certifications"];
    }
  | {
      section: "references";
      data: CareerProfile["references"];
    };

type ApiResult = {
  data: any;
  message: string;
};

export const useUpdateCareerProfile = () => {
  return usePatch<ProfileSectionPayload, ApiResult>({
    path: "recruit/account_users/profile",
  });
};

export const useAccountCareerProfile = () => {
  return useGet<CareerProfile>({
    path: "recruit/account_users/profile",
    deps: [],
    options: {},
  });
};

export const usePublicCareerProfile = ({ userId }: { userId: string }) => {
  return useGet<CareerProfile>({
    path: "recruit/account_users/public/profile/" + userId,
    deps: [userId],
    options: {},
  });
};

export type SearchResult =
  | {
      type: "user";
      objectId: string;
      objectData: CareerProfile;
    }
  | {
      type: "job_post";
      objectId: string;
      objectData: JobPost;
    }
  | {
      type: "company";
      objectId: string;
      objectData: ProjectCompany;
    };

export const useRecruitSearchResults = (props: {
  query: string;
  type: "user" | "job_post" | "company" | "all";
}) => {
  const { query, type } = props;
  return useGet<SearchResult[]>({
    path: `recruit/search/${type}/${query}`,
    deps: [query, type],
    options: {},
  });
};

// Settings

export type RecruitSettings = {
  operatingMode: "agency" | "inHouse";
  billingPlan: "standard" | "enterprise" | "trial" | "free";
  trialStartDate?: number;
  updated?: number | undefined;
  permissions?: {
    canCreateJobPosts?: {
      projectUserId: string;
    }[];
  };
  brand?: {
    theme?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
};

export const useRecruitSettings = () => {
  return useProjectGetBase<RecruitSettings>({ path: "recruit/settings" });
};

export const useUpdateRecruitSettings = () => {
  return useProjectRequest<RecruitSettings>({
    path: "recruit/settings",
    method: "PATCH",
  });
};
