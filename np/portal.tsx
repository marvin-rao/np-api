import type { MyLeave, MyTeamLeave } from "./leave";
import type { MyPayslipList } from "./payslips";
import type { MyHours } from "./timetracking";
import { useProjectGetBase, useProjectRequest } from "./projects";

/**
 * Employee Portal: one personal home screen for every workspace member. The
 * home screen is one call; each tile is read from the app that owns it (its
 * "mine" query), always for the signed-in member, and fails on its own.
 * Backend: /api/portal (backend/functions/src/portal).
 */

export const PORTAL_TILES = [
  "shift",
  "time",
  "leave",
  "payslips",
  "announcements",
  "todo",
  "documents",
  "companyInfo",
  "team",
] as const;

export type PortalTileKey = (typeof PORTAL_TILES)[number];

export type PortalTile<T> = {
  status: "ok" | "error" | "hidden";
  data?: T;
  /** The full app. */
  link?: string;
  error?: string;
};

export type PortalShift = {
  id: string;
  name: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  startTime: string;
  endTime: string;
  status: "pending" | "approved";
  templateId?: string;
};

export type PortalShifts = { usesShifts: boolean; upcoming: PortalShift[] };

export type PortalAnnouncement = {
  id: string;
  title: string;
  priority: "normal" | "important" | "urgent";
  category: string;
  publishedAt?: number;
  ackDueAt?: number;
  unread: boolean;
  needsAck: boolean;
  /** The post in Indaba. */
  link: string;
};

export type PortalAnnouncements = {
  usesAnnouncements: boolean;
  unread: number;
  needsAck: number;
  awaitingAck: PortalAnnouncement[];
  latest: PortalAnnouncement[];
};

export type PortalTask = {
  id: string;
  name: string;
  number: number;
  boardId: string;
  columnName?: string;
  dueDate: string;
  overdue: boolean;
  priority: 1 | 2 | 3 | 4 | 5;
  link: string;
};

export type PortalSignRequest = {
  id: string;
  fileId: string;
  fileName: string;
  message?: string;
  from: string;
  created: number;
  expiresAt?: number;
  link: string;
};

export type PortalTodo = {
  tasks: PortalTask[];
  toSign: PortalSignRequest[];
  /** Set when one of the two sources didn't answer. */
  errors: string[];
};

export type PortalDocument = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  updated: number;
  sharedBy: string;
};

export type PortalDocuments = { sharedWithMe: PortalDocument[]; total: number };

export type PortalCompanyLink = { id: string; label: string; url: string; icon?: string };

export type PortalAttentionItem = {
  type: "acknowledge" | "sign" | "payslip" | "task" | "leave_approval";
  sourceApp: "indaba" | "spacedrive" | "payslips" | "tasks" | "leave";
  id: string;
  title: string;
  detail?: string;
  /** Epoch ms or YYYY-MM-DD. */
  dueAt?: number | string;
  overdue?: boolean;
  /** Absolute URL, or a portal route starting with `#/`. */
  link: string;
};

export type PortalUser = {
  id: string;
  name: string;
  firstName: string;
  avatar?: string;
  jobTitle?: string;
  isAdmin: boolean;
  isManager: boolean;
};

export type PortalTiles = {
  shift: PortalTile<PortalShifts>;
  time: PortalTile<MyHours>;
  leave: PortalTile<MyLeave>;
  payslips: PortalTile<MyPayslipList>;
  announcements: PortalTile<PortalAnnouncements>;
  todo: PortalTile<PortalTodo>;
  documents: PortalTile<PortalDocuments>;
  companyInfo: PortalTile<{ links: PortalCompanyLink[] }>;
  team: PortalTile<MyTeamLeave>;
};

export type PortalHome = {
  user: PortalUser;
  /** Tiles to show, in the admin's order. */
  order: PortalTileKey[];
  needsAttention: PortalAttentionItem[];
  tiles: Partial<PortalTiles>;
  generatedAt: number;
};

export type PortalSettings = {
  projectId: string;
  enabledTiles: PortalTileKey[];
  tileOrder: PortalTileKey[];
  companyLinks: PortalCompanyLink[];
  /** Members who aren't admins land on the portal after signing in. */
  landingForNonAdmins: boolean;
  updatedBy?: string;
  updatedAt?: number;
};

export type PortalSettingsInput = Pick<
  PortalSettings,
  "enabledTiles" | "tileOrder" | "companyLinks" | "landingForNonAdmins"
>;

/**
 * The home screen. Pass `tiles` to load only those (a tile's retry); the
 * result then carries only those tiles and their attention items.
 */
export const usePortalHome = (options?: { tiles?: PortalTileKey[]; enabled?: boolean }) =>
  useProjectGetBase<PortalHome>({
    path: "portal/home",
    enabled: options?.enabled,
    params: { tiles: options?.tiles?.join(",") },
  });

export const usePortalSettings = (options?: { enabled?: boolean }) =>
  useProjectGetBase<PortalSettings>({ path: "portal/settings", enabled: options?.enabled });

/** Workspace admins. `data` is the saved PortalSettings. */
export const useUpdatePortalSettings = () =>
  useProjectRequest<PortalSettingsInput>({ path: "portal/settings", method: "PATCH" });
