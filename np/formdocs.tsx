import { useGet, useRequest } from "../helper/ApiRequestsBase";
import { generateEntityHooks } from "./hooks/generateEntityHooks";
import { useProjectId } from "./projects";
import { Creator, ServerResult } from "./types";

export type FormDocQuestionType =
  | "short"
  | "long"
  | "multipleChoice"
  | "checkboxes"
  | "dropdown"
  | "date"
  | "number";

export type FormDocOption = {
  id: string;
  label: string;
};

export type FormDocQuestion = {
  id: string;
  type: FormDocQuestionType;
  title: string;
  description?: string;
  required?: boolean;
  options?: FormDocOption[];
};

export type FormDoc = {
  id: string;
  creator: Creator;
  created: number;
  updated?: number;
  title: string;
  description?: string;
  questions: FormDocQuestion[];
  /** Soft-delete timestamp. Set on delete, hidden from list endpoint. */
  deleted?: number;
  fromServer?: boolean;
};

export type FormDocResponseAnswer = {
  questionId: string;
  value: string | string[];
};

export type FormDocResponse = {
  id: string;
  formId: string;
  created: number;
  creator?: Creator;
  answers: FormDocResponseAnswer[];
  fromServer?: boolean;
};

/**
 * CRUD hooks for the Google-Forms-style "FormDoc" objects backing the
 * np-forms app. Backed by `formdocs` controller on the backend.
 */
export const { useFormDocs, useAddFormDoc, useUpdateFormDoc, useDeleteFormDoc } =
  generateEntityHooks<"formDoc", FormDoc>({
    entityName: "formDoc",
    path: "formdocs",
  });

/**
 * Fetch all responses for a given form. Only the form owner / project admin
 * can view them.
 */
export const useFormDocResponses = (formId?: string) => {
  const { projectId } = useProjectId();
  return useGet<FormDocResponse[]>({
    path: `formdocs/responses/${formId ?? ""}`,
    options: { queryString: `?projectId=${projectId}` },
    deps: [projectId, formId],
    enabled: !!projectId && !!formId,
  });
};

/**
 * Submit a single response to a form. Body must include `formId` and
 * `answers`.
 */
export const useSubmitFormDocResponse = () => {
  const { projectId } = useProjectId();
  return useRequest<FormDocResponse, ServerResult<FormDocResponse>>({
    path: "formdocs/responses",
    method: "post",
    options: { queryString: `?projectId=${projectId}` },
    enabled: !!projectId,
  });
};

/**
 * PUBLIC \u2014 fetch a form by its id without requiring the caller to belong to
 * the owning workspace. Use this on the share-link / public fill page.
 *
 * Returns `null` when the form is missing or has been soft-deleted so the
 * UI can show a graceful "form unavailable" state.
 */
export const usePublicFormDoc = (formId?: string) => {
  return useGet<FormDoc | null>({
    path: "formdocs/public",
    options: { queryString: `?formId=${formId ?? ""}` },
    deps: [formId],
    enabled: !!formId,
  });
};

/**
 * PUBLIC \u2014 submit a response to a form anonymously. No project / workspace
 * membership required; the server resolves the owning project via the public
 * form lookup.
 */
export const useSubmitPublicFormDocResponse = () => {
  return useRequest<FormDocResponse, ServerResult<FormDocResponse>>({
    path: "formdocs/public",
    method: "post",
  });
};
