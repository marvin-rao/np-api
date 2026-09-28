/**
 * The workspaces this browser chose most recently, newest first, so the
 * picker can put the one you used last at the top. A per-device
 * convenience, so it lives in localStorage; if storage is unavailable the
 * picker simply falls back to its normal order.
 */
const KEY = "np:recentWorkspaces";
const MAX = 10;

export const readRecentWorkspaces = (): string[] => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
};

export const rememberWorkspace = (id: string) => {
  try {
    const next = [id, ...readRecentWorkspaces().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or blocked storage: nothing to remember, nothing breaks.
  }
};

/** Recently chosen first (most recent on top), then everything else as before. */
export const byRecent = <T extends { id: string }>(items: T[], fallback: (a: T, b: T) => number): T[] => {
  const recent = readRecentWorkspaces();
  const rank = (id: string) => {
    const i = recent.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...items].sort((a, b) => rank(a.id) - rank(b.id) || fallback(a, b));
};
