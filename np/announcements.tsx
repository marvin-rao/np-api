import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { appFetch, RequestMethod } from "../helper/fetchUtils";
import { useAuthData } from "../helper/provider";
import { useProjectGetBase, useProjectId } from "./projects";

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

/**
 * An awaitable request: resolves with the response's data, rejects with the
 * server's message ("Choose who this is for"), and refreshes every cached
 * announcements query afterwards so lists and badges stay current.
 */
const useAnnouncementsRequest = <Body, Result>(
  path: string,
  method: RequestMethod,
  /** Writes refresh cached lists; read-only calls (a preview, an export) don't. */
  { invalidates = method !== "GET" }: { invalidates?: boolean } = {}
) => {
  const { apiBaseUrl, onSessionExpired } = useAuthData();
  const { projectId } = useProjectId();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (body?: Body, params?: Record<string, string>): Promise<Result> => {
      if (!projectId) throw new Error("No workspace selected");
      setLoading(true);
      setError(null);
      try {
        const extra = Object.keys(params ?? {})
          .map((k) => `&${encodeURIComponent(k)}=${encodeURIComponent((params as Record<string, string>)[k])}`)
          .join("");
        const response = await appFetch({
          method,
          url: `${apiBaseUrl}${path}?projectId=${encodeURIComponent(projectId)}${extra}`,
          body,
        });
        const json = await response.json().catch(() => ({}));
        if (response.status === 403 && JSON.stringify(json).includes("Provide bearer or cookie")) {
          onSessionExpired();
        }
        if (!response.ok) {
          throw new Error(json?.message || `Request failed (${response.status})`);
        }
        if (invalidates) {
          await queryClient.invalidateQueries({
            predicate: (q) => {
              const key = q.queryKey?.[0];
              return typeof key === "string" && key.startsWith("announcements");
            },
          });
        }
        return json?.data as Result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl, invalidates, method, onSessionExpired, path, projectId, queryClient]
  );

  return { run, loading, error };
};

/** Create a draft. Workspace admins only. */
export const useAddAnnouncement = () =>
  useAnnouncementsRequest<AnnouncementDraft, Announcement>("announcements", "post");

/**
 * Save fields and/or move the post along with `action`. With
 * `resetAcknowledgements`, a material edit makes everyone acknowledge again.
 */
export const useUpdateAnnouncement = () =>
  useAnnouncementsRequest<
    AnnouncementDraft & { id: string; action?: AnnouncementAction; resetAcknowledgements?: boolean },
    { announcement: Announcement; reached?: number }
  >("announcements", "PATCH");

/** Drafts only; published posts are archived instead. */
export const useDeleteAnnouncement = () =>
  useAnnouncementsRequest<{ id: string }, { id: string }>("announcements", "delete");

/** How many people an audience reaches right now, for "Reaches N people". */
export const usePreviewAnnouncementAudience = () =>
  useAnnouncementsRequest<
    { audience: AnnouncementAudience },
    { count: number; sample: AnnouncementPerson[] }
  >("announcements/audience_preview", "post", { invalidates: false });

export const useMarkAnnouncementRead = () =>
  useAnnouncementsRequest<{ announcementId: string }, AnnouncementReceipt>("announcements/read", "post");

/** "I have read and understood" for the version the reader saw. */
export const useAcknowledgeAnnouncement = () =>
  useAnnouncementsRequest<{ announcementId: string; version: number }, AnnouncementReceipt>(
    "announcements/acknowledge",
    "post"
  );

export const useReactToAnnouncement = () =>
  useAnnouncementsRequest<{ announcementId: string; emoji: string }, AnnouncementReactions>(
    "announcements/react",
    "post"
  );

export const useAddAnnouncementComment = () =>
  useAnnouncementsRequest<{ announcementId: string; text: string }, AnnouncementComment>(
    "announcements/comments",
    "post"
  );

export const useDeleteAnnouncementComment = () =>
  useAnnouncementsRequest<{ announcementId: string; commentId: string }, { id: string }>(
    "announcements/comments",
    "delete"
  );

/** Re-notify everyone who hasn't acknowledged (or read). */
export const useNudgeAnnouncement = () =>
  useAnnouncementsRequest<{ announcementId: string }, { nudged: number }>("announcements/nudge", "post");

export const useUpdateAnnouncementSettings = () =>
  useAnnouncementsRequest<Partial<AnnouncementSettings>, AnnouncementSettings>(
    "announcements/settings",
    "PATCH"
  );

/** The evidence pack as CSV or PDF, saved straight to the user's downloads. */
export const useExportAnnouncement = () => {
  const request = useAnnouncementsRequest<undefined, AnnouncementExport>("announcements/export", "GET");
  const download = useCallback(
    async (announcementId: string, format: "csv" | "pdf") => {
      const file = await request.run(undefined, { announcementId, format });
      const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: file.mimeType }));
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return file;
    },
    [request]
  );
  return { download, loading: request.loading, error: request.error };
};
