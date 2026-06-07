import { useEffect, useState } from "react";
import { useNPThemeOptional } from "../theme/NPThemeProvider";

/**
 * Resolves the dark-mode flag the workspace modal should render with.
 *
 * Priority:
 *  1. An explicit `override` (e.g. `NewPaperProvider`'s `dark` prop) — lets
 *     the host app drive the modal directly.
 *  2. `<NPThemeProvider>` context, when mounted. This is the canonical
 *     source of truth for Newpaper apps.
 *  3. The host app's resolved theme, read from the `dark`/`light` class or
 *     `data-theme` attribute on <html> (the convention used by next-themes,
 *     Tailwind, etc.). Kept for legacy hosts without `NPThemeProvider`.
 *  4. Fallback: the OS / browser `prefers-color-scheme: dark` media query.
 *
 * Re-renders when any of these change while the modal is open.
 */

type HostTheme = "dark" | "light" | null;

const readHostTheme = (): HostTheme => {
  if (typeof document === "undefined") return null;
  const el = document.documentElement;
  if (!el) return null;

  if (el.classList.contains("dark")) return "dark";
  if (el.classList.contains("light")) return "light";

  const dataTheme = el.getAttribute("data-theme");
  if (dataTheme === "dark") return "dark";
  if (dataTheme === "light") return "light";

  return null;
};

const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useResolvedDarkMode = (override?: boolean): boolean => {
  const npTheme = useNPThemeOptional();

  const resolveWithContext = (): boolean => {
    if (typeof override === "boolean") return override;
    if (npTheme) return npTheme.theme === "dark";
    const host = readHostTheme();
    if (host) return host === "dark";
    return prefersDark();
  };

  const [dark, setDark] = useState<boolean>(resolveWithContext);

  useEffect(() => {
    setDark(resolveWithContext());

    if (typeof override === "boolean") return;
    if (npTheme) return; // context is the source of truth, no DOM watching needed
    if (typeof window === "undefined") return;

    const update = () => setDark(resolveWithContext());

    // Legacy: watch the host's <html> theme class / attribute.
    let observer: MutationObserver | undefined;
    if (typeof MutationObserver === "function" && document?.documentElement) {
      observer = new MutationObserver(update);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    }

    // Watch the OS preference (only effective when there's no host class).
    let mql: MediaQueryList | undefined;
    if (typeof window.matchMedia === "function") {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      if (mql.addEventListener) mql.addEventListener("change", update);
      else mql.addListener(update);
    }

    return () => {
      observer?.disconnect();
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener("change", update);
        else mql.removeListener(update);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [override, npTheme?.theme]);

  return dark;
};

/** @deprecated Use {@link useResolvedDarkMode}. Kept for backward compat. */
export const usePrefersDark = (): boolean => useResolvedDarkMode();
