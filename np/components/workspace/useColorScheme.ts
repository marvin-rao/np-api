import { useEffect, useState } from "react";

/**
 * Tracks the OS / browser dark-mode preference via the
 * `prefers-color-scheme: dark` media query and re-renders when the
 * user toggles their system theme while the modal is open.
 */
export const usePrefersDark = (): boolean => {
  const getMatch = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [dark, setDark] = useState<boolean>(getMatch);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);

    // Safari < 14 only supports the deprecated addListener API.
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  return dark;
};
