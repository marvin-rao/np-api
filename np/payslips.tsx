import { useProjectGetBase } from "./projects";

/**
 * Payslips, for the signed-in member, in brief: no file links. Payslips are
 * opened in the Payslips app. Backend: /api/payslips/mine
 * (backend/functions/src/payslips/mine.ts).
 */
export type MyPayslipSummary = {
  id: string;
  /** Pay period, YYYY-MM-DD. */
  from: string;
  to: string;
  gross: number;
  netPay: number;
  tax: number;
  deductions: number;
  created: number;
};

export type MyPayslipList = {
  usesPayslips: boolean;
  /** Newest first. */
  payslips: MyPayslipSummary[];
};

export const useMyPayslipList = (options?: { enabled?: boolean }) =>
  useProjectGetBase<MyPayslipList>({ path: "payslips/mine", enabled: options?.enabled });
