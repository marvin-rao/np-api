import { createContext, ReactNode, useContext } from "react";

/**
 * Design preference context.
 *
 * Apps that want the macOS / iPad-style flush controls (used by np-ai,
 * np-notes, np-forms, the SpaceOS shell, ...) wrap their tree in
 * `<OsDesignProvider value={true}>` (or pass `osDesign` to NewPaperProvider).
 *
 * Components inside `newpaper-api` (Navbar, WorkspaceSelector, etc.) call
 * `useOsDesign()` and switch their styles accordingly. The default is
 * `false` so existing consumers keep their current look.
 */
const OsDesignContext = createContext<boolean>(false);

export const OsDesignProvider = ({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) => <OsDesignContext.Provider value={value}>{children}</OsDesignContext.Provider>;

export const useOsDesign = (): boolean => useContext(OsDesignContext);
