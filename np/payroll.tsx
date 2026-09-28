import { useProjectGetBase, useProjectRequest } from "./projects";
import { ObjectId } from "./types";

/**
 * Payroll: South African monthly payroll. Workspace admins set up the
 * company, add people, run and approve each month, make the bank file and
 * record SARS filings; every member reads their own payslips once released.
 * People are workspace members: Payroll reads and writes their details on
 * the member record and keeps no copy.
 *
 * Backend: /api/payroll (backend/functions/src/payroll). Money is in cents;
 * dates are YYYY-MM-DD; periods are YYYY-MM. Personal data is encrypted on
 * the server and only admins can read it.
 */

export type PayrollEarningKind =
  | "salary"
  | "overtime"
  | "commission"
  | "allowance"
  | "travel"
  | "fringe"
  | "bonus"
  | "leave_payout";

export type PayrollEarning = { kind: PayrollEarningKind; label: string; amount: number };

export type PayrollDeduction = {
  label: string;
  amount: number;
  /** Loss or damage — BCEA s34 caps these at 25% of net pay. */
  damageOrLoss?: boolean;
  /** When the employee consented in writing (required for recurring deductions). */
  consentOn?: string;
};

export type PayrollRetirementFund = "pension" | "provident" | "retirement_annuity";

export type PayrollBankAccount = {
  bankId: string;
  branchCode: string;
  accountNumber: string;
  /** 1 current/cheque, 2 savings, 3 transmission. */
  accountType: "1" | "2" | "3";
  holder: string;
};

/** An address structured the way SARS needs it on tax certificates. */
export type PayrollAddress = {
  unitNumber?: string;
  complex?: string;
  streetNumber?: string;
  street: string;
  suburb?: string;
  city?: string;
  /** 4 digits in South Africa. */
  postalCode: string;
  /** 2-letter country code (ZA). */
  country: string;
};

export type PayrollEmployer = {
  legalName: string;
  tradingName?: string;
  registrationNumber?: string;
  address: string;
  payeReference: string;
  sdlReference?: string;
  uifReference: string;
  coidaReference?: string;
  sdlExempt: boolean;
  payDay: number;
  contactPhone?: string;
  contactEmail?: string;
  /** Street address for SARS certificates (the company record). */
  physicalAddress?: PayrollAddress;
  /** Who SARS contacts about reconciliations. */
  payrollContact?: { firstName: string; surname: string; position?: string; phone: string };
  /** SIC7 industry code, 5 digits. */
  sic7?: string;
  diplomaticIndemnity?: boolean;
};

export type PayrollPerson = { id: string; name: string; avatar: string; email: string };

export type PayrollLine = { code: string; label: string; amount: number };

export type PayrollWarning = { code: string; message: string };

/** One person's calculated month. */
export type PayrollResult = {
  taxYear: number;
  period: string;
  age: number;
  earnings: PayrollLine[];
  grossPay: number;
  taxableRemuneration: number;
  deductions: PayrollLine[];
  totalDeductions: number;
  netPay: number;
  paye: number;
  payeOnIrregular: number;
  medicalTaxCredit: number;
  uifEmployee: number;
  uifEmployer: number;
  sdl: number;
  eti: number;
  employerContributions: PayrollLine[];
  costToCompany: number;
  /** Figures by SARS IRP5 source code. */
  codes: Record<string, number>;
  /** How PAYE was worked out, step by step. */
  workings: { label: string; amount: number; note?: string }[];
  warnings: PayrollWarning[];
};

export type PayrollAccess = {
  userId: string;
  name: string;
  canManage: boolean;
  companyName: string;
  configured: boolean;
  /** True once the server's encryption key is set up; until then records are stored unencrypted. */
  encryptionReady: boolean;
  payslipCount: number;
  taxYears: number[];
};

/**
 * Employer details, read from the workspace's company record (the same one
 * Recruit and sharing use). Saving updates that record.
 */
export type PayrollSettings = {
  employer: PayrollEmployer;
  bank: (PayrollBankAccount & { bankName: string }) | null;
  /** Registered name, address, PAYE and UIF references are all there. */
  ready: boolean;
};

/** The paying account, as saved. */
export type PayrollBankInput = { bankName: string; branchCode: string; accountNumber: string; accountType: "1" | "2" | "3"; holder: string };

/**
 * A person's payroll details, read from their workspace member record — the
 * only place a person's details live. Money in cents.
 */
export type PayrollPersonDetails = {
  userId: string;
  name: string;
  employeeNumber: string;
  jobTitle: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  endReason?: string;
  idNumber?: string;
  passportNumber?: string;
  /** 3-letter code of the passport's country. */
  passportCountry?: string;
  /** From the SA ID when there is one. */
  dateOfBirth?: string;
  taxNumber?: string;
  address?: string;
  /** Home address, structured for SARS. */
  residential?: PayrollAddress;
  /** Work or cell number SARS can use. */
  workPhone?: string;
  email?: string;
  bank?: PayrollBankAccount & { bankName: string; holderRelationship: "own" | "joint" | "third_party" };
  pay: { basis: "monthly" | "hourly"; amount: number; hoursPerMonth: number };
  recurringEarnings: PayrollEarning[];
  recurringDeductions: (PayrollDeduction & { percentage?: number })[];
  retirement: { fund: PayrollRetirementFund; employee: number; employer: number }[];
  medical?: { members: number; employee: number; employer: number };
  travelMostlyBusiness?: boolean;
  uifExempt?: boolean;
  uifExemptReason?: string;
  etiFirstMonth?: string;
};

export type PayrollPersonView = {
  user: PayrollPerson;
  person: PayrollPersonDetails;
  status: "active" | "left" | "not_on_payroll";
  /** What's still needed before this person can be paid. */
  missing: string[];
};

/** Saved onto the member record. Money in cents. */
export type PayrollPersonInput = {
  userId: string;
  employeeNumber: string;
  jobTitle: string;
  department?: string;
  startDate: string;
  idNumber?: string;
  passportNumber?: string;
  passportCountry?: string;
  dateOfBirth?: string;
  taxNumber?: string;
  address?: string;
  residential?: PayrollAddress;
  workPhone?: string;
  bank?: { bankName: string; branchCode: string; accountNumber: string; accountType: "1" | "2" | "3"; holder: string; holderRelationship?: "own" | "joint" | "third_party" };
  pay: { basis: "monthly" | "hourly"; amount: number; hoursPerMonth: number };
  recurringEarnings: PayrollEarning[];
  /** Each needs the date the employee consented (BCEA s34). */
  recurringDeductions: (PayrollDeduction & { percentage?: number; consentOn: string })[];
  retirement: { fund: PayrollRetirementFund; employee: number; employer: number }[];
  medical?: { members: number; employee: number; employer: number };
  travelMostlyBusiness?: boolean;
  uifExempt?: boolean;
  uifExemptReason?: string;
  etiFirstMonth?: string;
};

export type PayRunStatus = "draft" | "approved" | "paid" | "filed";

export type PayRunTotals = {
  employees: number;
  gross: number;
  net: number;
  paye: number;
  uifEmployee: number;
  uifEmployer: number;
  sdl: number;
  eti: number;
  costToCompany: number;
  /** PAYE − ETI + UIF (both) + SDL. */
  emp201: number;
  warnings: number;
};

export type PayRun = {
  id: string;
  period: string;
  taxYear: number;
  payDate: string;
  status: PayRunStatus;
  totals: PayRunTotals;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  approvedAt?: number;
  approvedBy?: string;
  approvedHash?: string;
  paidAt?: number;
  paidBy?: string;
  paymentReference?: string;
  filedAt?: number;
  filedBy?: string;
  emp201Reference?: string;
  bankFile?: { sha256: string; generatedAt: number; generatedBy: string; count: number; issue: number; format?: string };
  emp201Due: string;
};

export type PayRunAdjustments = {
  earnings: PayrollEarning[];
  deductions: PayrollDeduction[];
  hours?: number;
  unpaidDays?: number;
  note?: string;
};

export type PayRunLine = {
  userId: string;
  name: string;
  avatar: string;
  employeeNumber: string;
  jobTitle: string;
  excluded: boolean;
  result: PayrollResult;
  adjustments: PayRunAdjustments;
  hasBank: boolean;
  /** Problems that stop approval. */
  blocking: PayrollWarning[];
};

/** A bank file this company can make, chosen from the bank it pays from. */
export type PayrollBankFileFormat = {
  id: "fnb_csv" | "fnb_acb" | "payment_list";
  label: string;
  description: string;
};

export type PayRunDetail = {
  run: PayRun;
  /** Files for the paying bank first; the payment list is always last. */
  bankFormats: PayrollBankFileFormat[];
  payingBank: string | null;
  people: { approvedBy: PayrollPerson | null; paidBy: PayrollPerson | null; filedBy: PayrollPerson | null };
  lines: PayRunLine[];
};

export type PayrollDeadline = {
  id: string;
  title: string;
  detail: string;
  opens?: string;
  due: string;
  period?: string;
  runStatus?: PayRunStatus | null;
  done?: boolean;
  overdue?: boolean;
};

export type PayrollAlert = { level: "error" | "warning" | "info"; message: string; action?: string };

export type PayrollOverview = {
  setup: { employer: boolean; bank: boolean; people: number; members: number; incomplete: number };
  currentRun: PayRun | null;
  history: { period: string; status: PayRunStatus; totals: PayRunTotals }[];
  upcoming: PayrollDeadline[];
  alerts: PayrollAlert[];
  today: string;
  taxYear: number;
  /** Income below which an under-65 pays no tax this year (cents). */
  threshold: number;
};

export type PayrollEmp201 = {
  period: string;
  status: PayRunStatus;
  due: string;
  references: { paye: string; sdl: string; uif: string };
  paye: number;
  eti: number;
  payeAfterEti: number;
  sdl: number;
  uif: number;
  total: number;
  employees: number;
  emp201Reference: string | null;
};

export type PayrollCalendar = {
  taxYear: number;
  today: string;
  holidays: Record<string, string>;
  deadlines: PayrollDeadline[];
};

export type PayrollReconciliation = {
  taxYear: number;
  interim: boolean;
  runs: number;
  people: {
    userId: string;
    name: string;
    employeeNumber: string;
    taxNumber?: string;
    idNumber?: string;
    months: number;
    codes: Record<string, number>;
  }[];
  totals: Record<string, number>;
};

export type PayrollAuditEntry = {
  seq: number;
  at: number;
  by: PayrollPerson;
  action: string;
  subject: { type: "settings" | "profile" | "run"; id: string };
  summary: string;
  hash: string;
  changes?: { before: Record<string, unknown>; after: Record<string, unknown> } | null;
};

export type PayrollAudit = {
  check: { ok: true; length: number; head: string } | { ok: false; brokenAt: number; reason: string };
  entries: PayrollAuditEntry[];
};

export type PayrollPayslip = {
  employer: { name: string; address: string; payeReference: string };
  employee: {
    name: string;
    number: string;
    jobTitle: string;
    idMasked?: string;
    taxNumber?: string;
    startDate: string;
    bankHint?: string;
  };
  period: string;
  payDate: string;
  rate?: { basis: "monthly" | "hourly"; amount: number; hours: number };
  result: PayrollResult;
  ytd?: { taxable: number; paye: number; uif: number };
  reference: string;
};

export type MyPayslip = { runId: string; period: string; payDate: string; releasedAt: number; payslip: PayrollPayslip };

/** A generated file: base64 contents with a name and type. */
export type PayrollFile = { filename: string; mimeType: string; base64: string; sha256?: string; issue?: number; certificates?: number };

// ── Reads ────────────────────────────────────────────────────────────────────

export const usePayrollAccess = () => useProjectGetBase<PayrollAccess>({ path: "payroll/access" });

/** Your own released payslips (every member). */
export const useMyPayslips = (options?: { enabled?: boolean }) =>
  useProjectGetBase<MyPayslip[]>({ path: "payroll/my_payslips", enabled: options?.enabled });

// Workspace admins only below.

export const usePayrollOverview = (options?: { enabled?: boolean }) =>
  useProjectGetBase<PayrollOverview>({ path: "payroll/overview", enabled: options?.enabled });

export const usePayrollSettings = (options?: { enabled?: boolean }) =>
  useProjectGetBase<PayrollSettings>({ path: "payroll/settings", enabled: options?.enabled });

/** Every workspace member, read for payroll, with who's on it and what's missing. */
export const usePayrollPeople = (options?: { enabled?: boolean }) =>
  useProjectGetBase<PayrollPersonView[]>({ path: "payroll/people", enabled: options?.enabled });

export const usePayrollPerson = (userId?: string) =>
  useProjectGetBase<PayrollPersonView>({ path: `payroll/people/get_one/${userId ?? ""}`, enabled: !!userId });

export const usePayRuns = (options?: { enabled?: boolean }) =>
  useProjectGetBase<PayRun[]>({ path: "payroll/runs", enabled: options?.enabled });

export const usePayRun = (runId?: string) =>
  useProjectGetBase<PayRunDetail>({ path: `payroll/runs/get_one/${runId ?? ""}`, enabled: !!runId });

export const usePayrollEmp201 = (runId?: string) =>
  useProjectGetBase<PayrollEmp201>({ path: `payroll/emp201/${runId ?? ""}`, enabled: !!runId });

export const usePayrollCalendar = (taxYear?: number) =>
  useProjectGetBase<PayrollCalendar>({
    path: "payroll/calendar",
    params: { taxYear: taxYear ? String(taxYear) : undefined },
  });

export const usePayrollReconciliation = (taxYear?: number, interim?: boolean) =>
  useProjectGetBase<PayrollReconciliation>({
    path: "payroll/reconciliation",
    params: { taxYear: taxYear ? String(taxYear) : undefined, interim: interim ? "true" : undefined },
  });

export const usePayrollAudit = (options?: { subjectId?: string; withChanges?: boolean; enabled?: boolean }) =>
  useProjectGetBase<PayrollAudit>({
    path: "payroll/audit",
    enabled: options?.enabled,
    params: { subjectId: options?.subjectId, withChanges: options?.withChanges ? "true" : undefined },
  });

// ── Writes ───────────────────────────────────────────────────────────────────
//
// `submit(body, ({ message, data }) => …)`, with `loading` and `error`, like
// every useProjectRequest hook. Refetch the reads you show after a submit.

/** Save employer details onto the company record. `data` is `{ saved, ready }`. */
export const useUpdatePayrollSettings = () =>
  useProjectRequest<{ employer?: PayrollEmployer; bank?: PayrollBankInput }>({ path: "payroll/settings", method: "PATCH" });

/** Save someone's payroll details onto their member record. `data` is `{ missing }`. */
export const useSavePayrollPerson = () =>
  useProjectRequest<PayrollPersonInput>({ path: "payroll/people", method: "post" });

/** Record the last day of employment (and why) on the member record. */
export const useEndEmployment = () =>
  useProjectRequest<{ userId: string; endDate: string; reason: string }>({ path: "payroll/people/terminate", method: "post" });

/** Start a month's draft run. `data` is `{ id }`. */
export const useCreatePayRun = () =>
  useProjectRequest<{ period: string }>({ path: "payroll/runs", method: "post" });

/** Drafts only. */
export const useDeletePayRun = () => useProjectRequest<ObjectId>({ path: "payroll/runs", method: "delete" });

/** Re-read everyone's profile into a draft; adjustments are kept. */
export const useRecalculatePayRun = () =>
  useProjectRequest<{ runId: string }>({ path: "payroll/runs/recalculate", method: "post" });

/** Change one person's month (once-offs, hours, unpaid days) or leave them out. `data` is `{ result, totals }`. */
export const useAdjustPayRunLine = () =>
  useProjectRequest<{ runId: string; userId: string; adjustments?: PayRunAdjustments; excluded?: boolean }>({
    path: "payroll/runs/line",
    method: "PATCH",
  });

/** Lock the run. Fails with a list of problems to fix first. */
export const useApprovePayRun = () =>
  useProjectRequest<{ runId: string }>({ path: "payroll/runs/approve", method: "post" });

/** Back to draft — only before a bank file is made. */
export const useReopenPayRun = () =>
  useProjectRequest<{ runId: string; reason: string }>({ path: "payroll/runs/reopen", method: "post" });

/** A bank file (or the payment list) for an approved run. `data` is a PayrollFile. */
export const usePayRunBankFile = () =>
  useProjectRequest<{ runId: string; format?: PayrollBankFileFormat["id"] }>({ path: "payroll/runs/bank_file", method: "post" });

/** Record that salaries went out; releases everyone's payslips. */
export const useMarkPayRunPaid = () =>
  useProjectRequest<{ runId: string; reference?: string }>({ path: "payroll/runs/paid", method: "post" });

/** Record the EMP201 as submitted, with the eFiling payment reference (PRN). */
export const useMarkPayRunFiled = () =>
  useProjectRequest<{ runId: string; reference: string }>({ path: "payroll/runs/filed", method: "post" });

/** A payslip PDF before release. `data` is a PayrollFile. */
export const usePreviewPayslip = () =>
  useProjectRequest<{ runId: string; userId: string }>({ path: "payroll/runs/payslip_preview", method: "post" });

/** A released payslip as PDF — your own, or anyone's for admins. `data` is a PayrollFile. */
export const usePayslipPdf = () =>
  useProjectRequest<{ runId: string; userId?: string }>({ path: "payroll/payslip_pdf", method: "post" });

/**
 * Exports. "reconciliation": IRP5 code totals as CSV. "easyfile": SARS's
 * e@syFile Employer import file (IRP5/IT3(a) certificates). `data` is a
 * PayrollFile, or `{ problems }` listing what SARS needs that's missing.
 */
export const useExportPayroll = () =>
  useProjectRequest<{ type: "reconciliation" | "easyfile"; taxYear: number; interim?: boolean; test?: boolean }>({ path: "payroll/export", method: "post" });

export type PayrollSarsLists = {
  source: string;
  sic7: { code: string; label: string; eti: boolean }[];
  countries: { name: string; code2: string; code3: string }[];
};

/** SARS's SIC7 industry codes and country codes, for pickers. */
export const usePayrollSarsLists = (options?: { enabled?: boolean }) =>
  useProjectGetBase<PayrollSarsLists>({ path: "payroll/sars/lists", enabled: options?.enabled });

/** Try numbers without saving anything. `data` is a PayrollResult. */
export const useCalculatePay = () =>
  useProjectRequest<{
    period: string;
    input: {
      dateOfBirth?: string;
      earnings: PayrollEarning[];
      retirement?: { fund: PayrollRetirementFund; employee: number; employer: number }[];
      medical?: { members: number; employee: number; employer: number };
      travelMostlyBusiness?: boolean;
      sdlExempt?: boolean;
    };
    /** Monthly deductions; `percentage` is a share of cash pay, like in a pay run. */
    deductions?: { label: string; amount: number; percentage?: number; damageOrLoss?: boolean }[];
  }>({ path: "payroll/calculate", method: "post" });
