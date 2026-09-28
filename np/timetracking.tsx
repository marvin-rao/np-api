import { useProjectGetBase } from "./projects";

/**
 * Time tracking, for the signed-in member, in brief. Read only: time is
 * logged in the Time tracking app. Backend: /api/time-tracking/mine
 * (backend/functions/src/time-tracking/mine.ts).
 */
export type MyHours = {
  /** False when the workspace has never logged time. */
  usesTimeTracking: boolean;
  /** Logged work and shift hours today and this week (Monday to Sunday). */
  todayHours: number;
  weekHours: number;
};

export const useMyHours = (options?: { enabled?: boolean }) =>
  useProjectGetBase<MyHours>({ path: "time-tracking/mine", enabled: options?.enabled });
