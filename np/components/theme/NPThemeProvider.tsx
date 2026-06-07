import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Single source of truth for theme state across every Newpaper frontend.
 *
 * Owns:
 *  - persisted `theme` ("light" | "dark") in localStorage,
 *  - the `dark` / `light` class on <html> so Tailwind + np-api's
 *    `useResolvedDarkMode` agree,
 *  - one React context (`useNPTheme`) consumers read from.
 *
 * Mount once at the app root, BEFORE `<NewPaperProvider>` and any consumer
 * that calls `useNPTheme()`. Replaces the per-app `ThemeContext` files that
 * used to duplicate this logic in every Newpaper repo.
 */

export type NPTheme = "light" | "dark";

interface NPThemeContextValue {
  theme: NPTheme;
  setTheme: (theme: NPTheme) => void;
  toggleTheme: () => void;
}

const NPThemeContext = createContext<NPThemeContextValue | undefined>(undefined);

const DEFAULT_STORAGE_KEY = "np:theme";

const readInitialTheme = (storageKey: string, fallback: NPTheme): NPTheme => {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return fallback;
};

export interface NPThemeProviderProps {
  children: React.ReactNode;
  /** Optional override for the localStorage key (e.g. per-app). */
  storageKey?: string;
  /** Theme used when nothing is saved and the OS doesn't prefer dark. */
  defaultTheme?: NPTheme;
}

export const NPThemeProvider: React.FC<NPThemeProviderProps> = ({
  children,
  storageKey = DEFAULT_STORAGE_KEY,
  defaultTheme = "light",
}) => {
  const [theme, setThemeState] = useState<NPTheme>(() =>
    readInitialTheme(storageKey, defaultTheme)
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // ignore
    }
  }, [theme, storageKey]);

  const setTheme = useCallback((next: NPTheme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "light" ? "dark" : "light")),
    []
  );

  const value = useMemo<NPThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <NPThemeContext.Provider value={value}>{children}</NPThemeContext.Provider>
  );
};

/**
 * Read theme state. Throws if used outside `<NPThemeProvider>`.
 *
 * Use the safer {@link useNPThemeOptional} when running inside legacy
 * trees that may not have mounted the provider yet.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNPTheme = (): NPThemeContextValue => {
  const ctx = useContext(NPThemeContext);
  if (!ctx) {
    throw new Error("useNPTheme must be used within <NPThemeProvider>");
  }
  return ctx;
};

/**
 * Same as {@link useNPTheme} but returns `null` when no provider is mounted —
 * useful inside library code (e.g. `useResolvedDarkMode`) that needs to fall
 * back to other detection mechanisms.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNPThemeOptional = (): NPThemeContextValue | null =>
  useContext(NPThemeContext) ?? null;
