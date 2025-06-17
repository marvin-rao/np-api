import { z } from 'zod';
import { ApiValidatorResult, processValidation } from './types';

// Experience Schema
export const ExperienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  description: z.string(),
});

export type Experience = z.infer<typeof ExperienceSchema>;

// Education Schema
export const EducationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  grade: z.string().optional(),
  description: z.string().optional(),
});

export type Education = z.infer<typeof EducationSchema>;

// Skill Schema
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  category: z.string(),
});

export type Skill = z.infer<typeof SkillSchema>;

// CV Schema
export const CVSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.string(),
  lastModified: z.number(),
  size: z.string(),
  isDefault: z.boolean(),
});

export type CV = z.infer<typeof CVSchema>;

// Language Schema
export const LanguageSchema = z.object({
  id: z.string(),
  language: z.string(),
  proficiency: z.enum(["basic", "intermediate", "fluent", "native"]),
});

export type Language = z.infer<typeof LanguageSchema>;

// Certification Schema
export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
});

export type Certification = z.infer<typeof CertificationSchema>;

// Reference Schema
export const ReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  company: z.string(),
  email: z.string(),
  phone: z.string(),
  relationship: z.string(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

// Personal Info Schema
export const PersonalInfoSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  dateOfBirth: z.string(),
  nationality: z.string(),
  summary: z.string(),
  linkedinUrl: z.string(),
  portfolioUrl: z.string(),
  githubUrl: z.string(),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// Profile Data Schema
export const ProfileDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experiences: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  languages: z.array(LanguageSchema),
  certifications: z.array(CertificationSchema),
  references: z.array(ReferenceSchema),
});

export type CareerProfile = z.infer<typeof ProfileDataSchema>;

export const validateCareerProfile = (
  jobApplication: CareerProfile
): ApiValidatorResult => {
  return processValidation(
    jobApplication,
    ProfileDataSchema
  );
};
