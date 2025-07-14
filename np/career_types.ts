import { z } from 'zod';
import { ApiValidatorResult, processValidation } from './types';

// Experience Schema
export const ExperienceSchema = z.object({
  id: z.string().min(1, { message: "Experience ID is required" }).max(100, { message: "Experience ID is too long" }),
  title: z.string().min(1, { message: "Job title is required" }).max(200, { message: "Job title is too long" }),
  company: z.string().min(1, { message: "Company name is required" }).max(200, { message: "Company name is too long" }),
  location: z.string().min(1, { message: "Location is required" }).max(200, { message: "Location is too long" }),
  startDate: z.string().min(1, { message: "Start date is required" }).max(50, { message: "Start date format is invalid" }),
  endDate: z.string().min(1, { message: "End date is required" }).max(50, { message: "End date format is invalid" }),
  current: z.boolean(),
  description: z.string().min(1, { message: "Job description is required" }).max(2000, { message: "Job description is too long (max 2000 characters)" }),
});

export type Experience = z.infer<typeof ExperienceSchema>;

export const validateExperience = (
  data: Experience
): ApiValidatorResult => {
  return processValidation(
    data,
    ExperienceSchema
  );
};

export const validateExperiences = (
  data: Experience[]
): ApiValidatorResult => {
  return processValidation(
    data,
    z.array(ExperienceSchema)
  );
};

// Education Schema
export const EducationSchema = z.object({
  id: z.string().min(1, { message: "Education ID is required" }).max(100, { message: "Education ID is too long" }),
  degree: z.string().min(1, { message: "Degree is required" }).max(200, { message: "Degree name is too long" }),
  institution: z.string().min(1, { message: "Institution name is required" }).max(200, { message: "Institution name is too long" }),
  location: z.string().min(1, { message: "Location is required" }).max(200, { message: "Location is too long" }),
  startDate: z.string().min(1, { message: "Start date is required" }).max(50, { message: "Start date format is invalid" }),
  endDate: z.string().min(1, { message: "End date is required" }).max(50, { message: "End date format is invalid" }),
  current: z.boolean(),
  grade: z.string().max(50, { message: "Grade is too long" }).optional(),
  description: z.string().max(1000, { message: "Description is too long (max 1000 characters)" }).optional(),
});

export type Education = z.infer<typeof EducationSchema>;

export const validateEducation = (
  data: Education
): ApiValidatorResult => {
  return processValidation(
    data,
    EducationSchema
  );
};

export const validateEducations = (
  data: Education[]
): ApiValidatorResult => {
  return processValidation(
    data,
    z.array(EducationSchema)
  );
};

// Skill Schema
export const SkillSchema = z.object({
  id: z.string().min(1, { message: "Skill ID is required" }).max(100, { message: "Skill ID is too long" }),
  name: z.string().min(1, { message: "Skill name is required" }).max(100, { message: "Skill name is too long" }),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  category: z.string().min(1, { message: "Skill category is required" }).max(100, { message: "Skill category is too long" }),
});

export type Skill = z.infer<typeof SkillSchema>;

export const validateSkill = (
  data: Skill
): ApiValidatorResult => {
  return processValidation(
    data,
    SkillSchema
  );
};

export const validateSkills = (
  data: Skill[]
): ApiValidatorResult => {
  return processValidation(
    data,
    z.array(SkillSchema)
  );
};

// CV Schema
export const CVSchema = z.object({
  id: z.string().min(1, { message: "CV ID is required" }).max(100, { message: "CV ID is too long" }),
  name: z.string().min(1, { message: "CV name is required" }).max(200, { message: "CV name is too long" }),
  template: z.string().min(1, { message: "CV template is required" }).max(100, { message: "CV template name is too long" }),
  lastModified: z.number(),
  size: z.string().min(1, { message: "CV size is required" }).max(50, { message: "CV size format is invalid" }),
  isDefault: z.boolean(),
});

export type CV = z.infer<typeof CVSchema>;

export const validateCV = (
  data: CV
): ApiValidatorResult => {
  return processValidation(
    data,
    CVSchema
  );
};

export const validateCVs = (
  data: CV[]
): ApiValidatorResult => {
  return processValidation(
    data,
    z.array(CVSchema)
  );
};

// Language Schema
export const LanguageSchema = z.object({
  id: z.string().min(1, { message: "Language ID is required" }).max(100, { message: "Language ID is too long" }),
  language: z.string().min(1, { message: "Language name is required" }).max(100, { message: "Language name is too long" }),
  proficiency: z.enum(["basic", "intermediate", "fluent", "native"]),
});

export type Language = z.infer<typeof LanguageSchema>;

export const validateLanguage = (
  data: Language
): ApiValidatorResult => {
  return processValidation(
    data,
    LanguageSchema
  );
};

export const validateLanguages = (
  data: Language[]
): ApiValidatorResult => {
  return processValidation(
    data,
    z.array(LanguageSchema)
  );
};

// Certification Schema
export const CertificationSchema = z.object({
  id: z.string().min(1, { message: "Certification ID is required" }).max(100, { message: "Certification ID is too long" }),
  name: z.string().min(1, { message: "Certification name is required" }).max(200, { message: "Certification name is too long" }),
  issuer: z.string().min(1, { message: "Issuer name is required" }).max(200, { message: "Issuer name is too long" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }).max(50, { message: "Issue date format is invalid" }),
  expiryDate: z.string().max(50, { message: "Expiry date format is invalid" }).optional(),
  credentialId: z.string().max(200, { message: "Credential ID is too long" }).optional(),
});

export type Certification = z.infer<typeof CertificationSchema>;

export const validateCertification = (
  data: Certification
): ApiValidatorResult => {
  return processValidation(
    data,
    CertificationSchema
  );
};

export const validateCertifications = (
  data: Certification[]
): ApiValidatorResult => {
  return processValidation(
    data,
    z.array(CertificationSchema)
  );
};

// Reference Schema
export const ReferenceSchema = z.object({
  id: z.string().min(1, { message: "Reference ID is required" }).max(100, { message: "Reference ID is too long" }),
  name: z.string().min(1, { message: "Reference name is required" }).max(200, { message: "Reference name is too long" }),
  title: z.string().min(1, { message: "Reference title is required" }).max(200, { message: "Reference title is too long" }),
  company: z.string().min(1, { message: "Reference company is required" }).max(200, { message: "Reference company name is too long" }),
  email: z.string().min(1, { message: "Reference email is required" }).max(255, { message: "Reference email is too long" }),
  phone: z.string().min(1, { message: "Reference phone is required" }).max(50, { message: "Reference phone number is too long" }),
  relationship: z.string().min(1, { message: "Relationship description is required" }).max(200, { message: "Relationship description is too long" }),
});

export type Reference = z.infer<typeof ReferenceSchema>;

export const validateReference = (
  data: Reference
): ApiValidatorResult => {
  return processValidation(
    data,
    ReferenceSchema
  );
};

export const validateReferences = (
  data: Reference[]
): ApiValidatorResult => {
  return processValidation(
    data,
    z.array(ReferenceSchema)
  );
};

// Personal Info Schema
export const PersonalInfoSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }).max(100, { message: "First name is too long" }),
  lastName: z.string().min(1, { message: "Last name is required" }).max(100, { message: "Last name is too long" }),
  email: z.string().min(1, { message: "Email is required" }).max(255, { message: "Email is too long" }),
  phone: z.string().min(1, { message: "Phone number is required" }).max(50, { message: "Phone number is too long" }),
  location: z.string().min(1, { message: "Location is required" }).max(200, { message: "Location is too long" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }).max(50, { message: "Date of birth format is invalid" }),
  nationality: z.string().min(1, { message: "Nationality is required" }).max(100, { message: "Nationality is too long" }),
  summary: z.string().min(1, { message: "Professional summary is required" }).max(1000, { message: "Professional summary is too long (max 1000 characters)" }),
  linkedinUrl: z.string().max(500, { message: "LinkedIn URL is too long" }).optional(),
  portfolioUrl: z.string().max(500, { message: "Portfolio URL is too long" }).optional(),
  githubUrl: z.string().max(500, { message: "GitHub URL is too long" }).optional(),
  avatar: z.object({
    original: z.string().url({ message: "Avatar URL must be a valid URL" }).optional(),
  }).optional(),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

export const validatePersonalInfo = (
  data: PersonalInfo
): ApiValidatorResult => {
  return processValidation(
    data,
    PersonalInfoSchema
  );
};

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
