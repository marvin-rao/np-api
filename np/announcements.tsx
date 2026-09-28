import { useProjectGetBase, useProjectRequest } from "./projects";
import { ObjectId } from "./types";

/**
 * Indaba: company announcements. Workspace admins publish official posts;
 * every member sees the ones sent to them, marks them read and acknowledges
 * them ("I have read and understood"). The acknowledgements are evidence, so
 * the server alone writes them.
 *
 * Backend: /api/announcements (backend/functions/src/announcements). Times are
 * epoch milliseconds; people are project user ids.
 */

export type AnnouncementPriority = "normal" | "important" | "urgent";
export type AnnouncementStatus = "draft" | "scheduled" | "published" | "expired" | "archived";

/** Who a post is for. Keys combine; all are optional. */
export type AnnouncementAudience = {
  /** Every active workspace member. */
  all?: boolean;
  /** A manager's team via `reportsTo`: direct reports, or everyone under them. */
  managers?: { userId: string; scope: "direct" | "all" }[];
  /** People rostered on these shift templates (Shifts app). */
  shiftTypeIds?: string[];
  /** Named people. */
  userIds?: string[];
};

export type AnnouncementAttachment = {
  /** SpaceDrive file id. */
  fileId?: string;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
};

export type Announcement = {
  id: string;
  projectId: string;
  title: string;
  /** Rich text HTML, the same format Notes stores. */
  body: string;
  coverImageUrl?: string;
  attachments?: AnnouncementAttachment[];
  category: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  requiresAck: boolean;
  ackDueAt?: number;
  allowComments: boolean;
  allowReactions: boolean;
  status: AnnouncementStatus;
  publishAt?: number;
  publishedAt?: number;
  pinned: boolean;
  pinnedUntil?: number;
  expiresAt?: number;
  archivedAt?: number;
  version: number;
  /** Acknowledgements of this version or later count. */
  ackVersion: number;
  createdBy: string;
  createdAt: number;
  updatedBy: string;
  updatedAt: number;
};

export type AnnouncementPerson = { id: string; name: string; avatar: string };

export type AnnouncementReceipt = {
  userId: string;
  deliveredAt: number;
  readAt?: number;
  acknowledgedAt?: number;
  acknowledgedVersion?: number;
  lastRemindedAt?: number;
};

export type AnnouncementReactions = { [emoji: string]: { count: number; mine: boolean } };

export type AnnouncementStats = {
  audience: number;
  read: number;
  acknowledged: number;
  readPct: number;
  ackPct: number;
};

/** A post as the signed-in reader sees it. */
export type FeedAnnouncement = Announcement & {
  publisher?: AnnouncementPerson;
  receipt: AnnouncementReceipt | null;
  unread: boolean;
  needsAck: boolean;
  pinnedNow: boolean;
  reactions: AnnouncementReactions;
  /** Present for admins. */
  stats?: AnnouncementStats;
};

/** A post in the publisher's list (the body is a plain-text preview). */
export type ManagedAnnouncement = Announcement & {
  publisher?: AnnouncementPerson;
  pinnedNow: boolean;
  stats: AnnouncementStats;
};

export type AnnouncementReportRow = {
  userId: string;
  name: string;
  email: string;
  jobTitle: string;
  managerId: string;
  managerName: string;
  shiftTypeIds: string[];
  deliveredAt: number;
  readAt?: number;
  acknowledgedAt?: number;
  acknowledgedVersion?: number;
  acknowledged: boolean;
  lastRemindedAt?: number;
};

export type AnnouncementEvidenceCheck =
  | { ok: true; length: number; head: string }
  | { ok: false; brokenAt: number; reason: string };

export type AnnouncementReport = {
  announcement: Announcement & { publisher?: AnnouncementPerson };
  stats: AnnouncementStats;
  rows: AnnouncementReportRow[];
  evidence: AnnouncementEvidenceCheck;
};

export type AnnouncementVersion = {
  version: number;
  title: string;
  body: string;
  attachments?: AnnouncementAttachment[];
  contentHash: string;
  editedBy: string;
  editedAt: number;
  editor?: AnnouncementPerson;
};

export type AnnouncementComment = {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
  author?: AnnouncementPerson;
  mine: boolean;
};

export type AnnouncementSettings = {
  categories: string[];
  emailNotifications: boolean;
  reminders: { after24h: boolean; after72h: boolean; onDueDate: boolean };
  timezone: string;
};

/** Fields a publisher sets. `null` clears an optional date. */
export type AnnouncementDraft = Partial<{
  title: string;
  body: string;
  coverImageUrl: string;
  attachments: AnnouncementAttachment[];
  category: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  requiresAck: boolean;
  ackDueAt: number | null;
  allowComments: boolean;
  allowReactions: boolean;
  pinned: boolean;
  pinnedUntil: number | null;
  expiresAt: number | null;
  publishAt: number | null;
}>;

export type AnnouncementAction = "publish" | "schedule" | "unschedule" | "archive" | "unarchive";

export type AnnouncementExport = { filename: string; mimeType: string; base64: string };

/** A Shifts template ("Night shift"), used to target rostered people. */
export type ShiftTemplate = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

export const ANNOUNCEMENT_REACTIONS = ["👍", "❤️", "🎉", "👏", "😮", "🙏"];

// ── Reads ────────────────────────────────────────────────────────────────────

export type AnnouncementListQuery = {
  /** feed (default): live posts for me · archive: searchable history. */
  view?: "feed" | "archive";
  category?: string;
  unread?: boolean;
  needsAck?: boolean;
  q?: string;
  from?: number;
  to?: number;
  publisher?: string;
  enabled?: boolean;
};

const flag = (b?: boolean) => (b ? "true" : undefined);
const num = (n?: number) => (n ? String(n) : undefined);

export const useAnnouncements = (query: AnnouncementListQuery = {}) =>
  useProjectGetBase<FeedAnnouncement[]>({
    path: "announcements",
    enabled: query.enabled,
    params: {
      view: query.view,
      category: query.category,
      unread: flag(query.unread),
      needsAck: flag(query.needsAck),
      q: query.q,
      from: num(query.from),
      to: num(query.to),
      publisher: query.publisher,
    },
  });

/** Every post in every state, with stats. Workspace admins only. */
export const useManagedAnnouncements = (options?: { enabled?: boolean }) =>
  useProjectGetBase<ManagedAnnouncement[]>({
    path: "announcements",
    enabled: options?.enabled,
    params: { view: "manage" },
  });

export const useAnnouncement = (id?: string) =>
  useProjectGetBase<FeedAnnouncement>({
    path: `announcements/get_one/${id ?? ""}`,
    enabled: !!id,
  });

/** Who I am in this workspace and whether I can publish (admins today). */
export const useAnnouncementAccess = () =>
  useProjectGetBase<{ userId: string; name: string; canPublish: boolean }>({
    path: "announcements/access",
  });

/** { unread, needsAck } for badges. */
export const useAnnouncementCounts = (options?: { enabled?: boolean }) =>
  useProjectGetBase<{ unread: number; needsAck: number }>({
    path: "announcements/unread",
    enabled: options?.enabled,
  });

export const useAnnouncementComments = (announcementId?: string, options?: { enabled?: boolean }) =>
  useProjectGetBase<AnnouncementComment[]>({
    path: "announcements/comments",
    enabled: !!announcementId && options?.enabled !== false,
    params: { announcementId },
  });

/** Read and acknowledgement report. Workspace admins only. */
export const useAnnouncementReport = (announcementId?: string) =>
  useProjectGetBase<AnnouncementReport>({
    path: "announcements/receipts",
    enabled: !!announcementId,
    params: { announcementId },
  });

export const useAnnouncementVersions = (announcementId?: string) =>
  useProjectGetBase<AnnouncementVersion[]>({
    path: "announcements/versions",
    enabled: !!announcementId,
    params: { announcementId },
  });

export const useAnnouncementSettings = () =>
  useProjectGetBase<AnnouncementSettings>({ path: "announcements/settings" });

/** Shift templates from the Shifts app. */
export const useShiftTemplates = (options?: { enabled?: boolean }) =>
  useProjectGetBase<ShiftTemplate[]>({ path: "shifts/types", enabled: options?.enabled });

// ── Writes ───────────────────────────────────────────────────────────────────
//
// All writes are `useProjectRequest` hooks, like the rest of the package:
// `submit(body, ({ message, data }) => …)`, with `loading` and `error`. Callers
// refetch the reads they show after a successful submit.

/** Create a draft. Workspace admins only. `data` is the new Announcement. */
export const useAddAnnouncement = () =>
  useProjectRequest<AnnouncementDraft>({ path: "announcements", method: "post" });

/**
 * Save fields and/or move the post along with `action`. With
 * `resetAcknowledgements`, a material edit makes everyone acknowledge again.
 * `data` is `{ announcement, reached? }`.
 */
export const useUpdateAnnouncement = () =>
  useProjectRequest<
    AnnouncementDraft & { id: string; action?: AnnouncementAction; resetAcknowledgements?: boolean }
  >({ path: "announcements", method: "PATCH" });

/** Drafts only; published posts are archived instead. */
export const useDeleteAnnouncement = () =>
  useProjectRequest<ObjectId>({ path: "announcements", method: "delete" });

/** How many people an audience reaches: `data` is `{ count, sample }`. */
export const usePreviewAnnouncementAudience = () =>
  useProjectRequest<{ audience: AnnouncementAudience }>({ path: "announcements/audience_preview", method: "post" });

export const useMarkAnnouncementRead = () =>
  useProjectRequest<{ announcementId: string }>({ path: "announcements/read", method: "post" });

/** "I have read and understood" for the version the reader saw. */
export const useAcknowledgeAnnouncement = () =>
  useProjectRequest<{ announcementId: string; version: number }>({ path: "announcements/acknowledge", method: "post" });

/** Toggle my reaction: `data` is the post's AnnouncementReactions. */
export const useReactToAnnouncement = () =>
  useProjectRequest<{ announcementId: string; emoji: string }>({ path: "announcements/react", method: "post" });

export const useAddAnnouncementComment = () =>
  useProjectRequest<{ announcementId: string; text: string }>({ path: "announcements/comments", method: "post" });

export const useDeleteAnnouncementComment = () =>
  useProjectRequest<{ announcementId: string; commentId: string }>({ path: "announcements/comments", method: "delete" });

/** Re-notify everyone who hasn't acknowledged (or read): `data` is `{ nudged }`. */
export const useNudgeAnnouncement = () =>
  useProjectRequest<{ announcementId: string }>({ path: "announcements/nudge", method: "post" });

export const useUpdateAnnouncementSettings = () =>
  useProjectRequest<Partial<AnnouncementSettings>>({ path: "announcements/settings", method: "PATCH" });

/** The evidence pack: `data` is an AnnouncementExport (base64 CSV or PDF). */
export const useExportAnnouncement = () =>
  useProjectRequest<{ announcementId: string; format: "csv" | "pdf" }>({ path: "announcements/export", method: "post" });
