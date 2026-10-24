import { useGet, useRequest } from "../helper/ApiRequestsBase";
import { ServerResult } from "./types";

/**
 * The NewPaper developer platform, for our own apps (the developer site):
 * a signed-in NewPaper account managing the OAuth apps it owns, the
 * "Allow this app?" screen, and connected apps. Backend:
 * /api/platform (backend/functions/src/platform).
 *
 * Outside apps never use these hooks; they call https://api.newpaper.app/v1
 * with OAuth access tokens (see developer.newpaper.app/docs).
 */

export type PlatformScope = "workspaces.read" | "projects.read" | "tasks.read";

export type PlatformScopeInfo = { id: PlatformScope; title: string; description: string };

/** web: has a server that keeps the client secret. spa: runs in a browser; uses PKCE, no secret. */
export type PlatformAppType = "web" | "spa";

export type PlatformAppSecret = {
  id: string;
  /** Last 4 characters. */
  hint: string;
  description?: string;
  created: number;
  expiresAt?: number;
};

export type PlatformApp = {
  /** The client ID. */
  id: string;
  name: string;
  description?: string;
  homepageUrl?: string;
  logoUrl?: string;
  type: PlatformAppType;
  /** development: only workspaces the owner belongs to can connect it. verified: any workspace. */
  status: "development" | "verified";
  redirectUris: string[];
  scopes: PlatformScope[];
  ownerUid: string;
  secrets: PlatformAppSecret[];
  created: number;
  updated: number;
};

export type PlatformAppInput = {
  name: string;
  description?: string;
  homepageUrl?: string;
  logoUrl?: string;
  type: PlatformAppType;
  redirectUris: string[];
  scopes: PlatformScope[];
};

/** What an app sends to the "Allow this app?" screen (standard OAuth parameters). */
export type PlatformAuthorizeRequest = {
  client_id?: string;
  redirect_uri?: string;
  response_type?: string;
  scope?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
};

export type PlatformAuthorizePreview = {
  app: { id: string; name: string; description: string; logoUrl: string; homepageUrl: string; verified: boolean };
  scopes: PlatformScopeInfo[];
  workspaces: { id: string; name: string; role: "admin" | "member" }[];
};

/** Why a request can't be allowed; `redirectTo` is set when it's safe to send the person back to the app. */
export type PlatformAuthorizeProblem = { code: string; message: string; redirectTo?: string };

/** Either what to show on the screen, or why the app's request can't be allowed. */
export type PlatformAuthorizeCheck = { preview?: PlatformAuthorizePreview; problem?: PlatformAuthorizeProblem };

export type PlatformConnection = {
  id: string;
  app: { id: string; name: string; logoUrl: string; verified: boolean };
  workspace: { id: string; name: string };
  person: { name: string; isYou: boolean };
  scopes: { id: string; title: string }[];
  created: number;
  lastUsedAt: number | null;
};

const qs = (params: Record<string, string | undefined>) => {
  const keys = Object.keys(params).filter((k) => params[k]);
  return keys.length ? `?${keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k] as string)}`).join("&")}` : "";
};

// ── Reads ────────────────────────────────────────────────────────────────────

export const usePlatformScopes = () =>
  useGet<PlatformScopeInfo[]>({ path: "platform/scopes", options: {}, staleTime: 60 * 60 * 1000 });

export const usePlatformApps = (options?: { enabled?: boolean }) =>
  useGet<PlatformApp[]>({ path: "platform/apps", options: {}, enabled: options?.enabled });

export const usePlatformApp = (id?: string) =>
  useGet<PlatformApp>({ path: "platform/apps/one", options: { queryString: qs({ id }) }, deps: [id], enabled: !!id });

/** What the "Allow this app?" screen shows for an app's request. */
export const usePlatformAuthorizePreview = (request: PlatformAuthorizeRequest, options?: { enabled?: boolean }) => {
  const queryString = qs(request as Record<string, string | undefined>);
  return useGet<PlatformAuthorizeCheck>({
    path: "platform/authorize",
    options: { queryString },
    deps: [queryString],
    enabled: options?.enabled ?? !!request.client_id,
  });
};

export const usePlatformConnections = (options?: { enabled?: boolean }) =>
  useGet<PlatformConnection[]>({ path: "platform/connections", options: {}, enabled: options?.enabled });

// ── Writes (callback submit, like the rest of the package) ───────────────────

/** `data` is the new PlatformApp. */
export const useCreatePlatformApp = () =>
  useRequest<PlatformAppInput, ServerResult<PlatformApp>>({ path: "platform/apps", method: "post" });

/** `data` is the updated PlatformApp. */
export const useUpdatePlatformApp = () =>
  useRequest<PlatformAppInput & { id: string }, ServerResult<PlatformApp>>({ path: "platform/apps", method: "PATCH" });

export const useDeletePlatformApp = () =>
  useRequest<{ id: string }, ServerResult<{ deleted: boolean }>>({ path: "platform/apps", method: "delete" });

/** `data` is `{ secret, app }`. The secret is shown this once; NewPaper keeps only a hash. */
export const useCreatePlatformAppSecret = () =>
  useRequest<{ appId: string; description?: string; expiresInDays?: 90 | 180 | 365 | 730 }, ServerResult<{ secret: string; app: PlatformApp }>>({
    path: "platform/apps/secrets",
    method: "post",
  });

/** `data` is the updated PlatformApp. */
export const useDeletePlatformAppSecret = () =>
  useRequest<{ appId: string; secretId: string }, ServerResult<PlatformApp>>({ path: "platform/apps/secrets", method: "delete" });

/** The person allowed the app. `data` is `{ redirectTo }`: send the browser there. */
export const useApprovePlatformAuthorization = () =>
  useRequest<PlatformAuthorizeRequest & { workspaceId: string }, ServerResult<{ redirectTo: string }>>({
    path: "platform/authorize/approve",
    method: "post",
  });

/** The person said no. `data` is `{ redirectTo }`. */
export const useDenyPlatformAuthorization = () =>
  useRequest<PlatformAuthorizeRequest, ServerResult<{ redirectTo: string }>>({ path: "platform/authorize/deny", method: "post" });

export const useRemovePlatformConnection = () =>
  useRequest<{ id: string }, ServerResult<{ removed: boolean }>>({ path: "platform/connections", method: "delete" });
