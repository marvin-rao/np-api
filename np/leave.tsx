import { useProjectGetBase } from "./projects";

/**
 * Leave, for the signed-in member. Backend: /api/leave
 * (backend/functions/src/leave). Dates are YYYY-MM-DD in the workspace's
 * time zone; people are project user ids.
 */

export type LeaveTypeDef = {
  id: string;
  name: string;
  /** Accrues `days` per month since the person's start date. */
  formula?: { frequency: "monthly"; days: number };
};

export type LeaveBalance = LeaveTypeDef & {
  /** Days earned or granted. */
  total: number;
  /** Paid days booked, pending and approved. */
  taken: number;
  /** total - taken. */
  value: number;
};

export type LeaveStatus = "pending" | "approved";

export type MyLeaveItem = {
  id: string;
  type: { id: string; name: string };
  status: LeaveStatus;
  from: string;
  to: string;
  days: number;
  paid: boolean;
  submitted?: number;
};

export type MyLeave = {
  types: LeaveTypeDef[];
  balances: LeaveBalance[];
  /** Waiting for approval, soonest first. */
  pending: MyLeaveItem[];
  /** Approved and not over yet, soonest first. */
  upcoming: MyLeaveItem[];
};

export type TeamAbsence = {
  userId: string;
  name: string;
  avatar?: string;
  from: string;
  to: string;
  status: LeaveStatus;
};

/** What a manager sees of their direct reports; never the leave type or reason. */
export type MyTeamLeave = {
  size: number;
  today: TeamAbsence[];
  thisWeek: TeamAbsence[];
  awaitingApproval: (TeamAbsence & { id: string; days: number; submitted?: number })[];
};

export const useMyLeave = (options?: { enabled?: boolean }) =>
  useProjectGetBase<MyLeave>({ path: "leave/mine", enabled: options?.enabled });

export const useMyTeamLeave = (options?: { enabled?: boolean }) =>
  useProjectGetBase<MyTeamLeave>({ path: "leave/team", enabled: options?.enabled });
