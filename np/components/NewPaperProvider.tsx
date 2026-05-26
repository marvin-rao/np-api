import { useState } from "react";
import {
  AuthProvider,
  AuthProviderProps,
  useAuthSession,
} from "../../helper/provider";
import { useProjectId } from "../projects";
import { OsDesignProvider } from "../design/OsDesignContext";
import { WorkspaceSelector } from "./workspace/WorkspaceSelector";

export const openWorkspace = ({ id }: { id: string }) => {
  window.location.href = `../../../../workspace/${id}/`;
};

export interface NewPaperProviderProps extends AuthProviderProps {
  /** Opt into the macOS / iPad-style flush controls in shared chrome. */
  osDesign?: boolean;
  /**
   * Explicit dark-mode for shared chrome (e.g. the workspace selector modal).
   * When omitted, it follows the host app's resolved theme (the `dark`/`light`
   * class or `data-theme` on <html>), falling back to the OS preference.
   * Pass e.g. next-themes' `resolvedTheme === "dark"` to force a match.
   */
  dark?: boolean;
  /**
   * Optional fullscreen element rendered while the session cookie is being
   * verified. Defaults to a centred spinner. Pass a branded icon+spinner to
   * match the host app's identity. Skipped when `ignoreWorkspace` is `true`
   * (i.e. on public/share routes that don't require auth).
   */
  loadingFallback?: React.ReactNode;
}

const DefaultAuthLoader = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--np-auth-loader-bg, #f8fafc)",
    }}
  >
    <div
      aria-label="Loading"
      style={{
        width: 22,
        height: 22,
        border: "2px solid rgba(0,0,0,0.12)",
        borderTopColor: "rgba(0,0,0,0.45)",
        borderRadius: "50%",
        animation: "np-auth-spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes np-auth-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const NewPaperProvider = (props: NewPaperProviderProps) => {
  const { projectId } = useProjectId();
  const { shouldLogin, loading } = useAuthSession();
  const [isOpen, setIsOpen] = useState(true);
  const { osDesign = false, dark, loadingFallback, ...authProps } = props;

  // Gate children behind the auth check so apps don't flash their
  // unauthenticated UI while the session cookie is being verified.
  // Public routes (ignoreWorkspace=true) skip this gate — they must render
  // immediately and don't depend on the session at all.
  const showLoader = loading && !props.ignoreWorkspace;

  return (
    <OsDesignProvider value={osDesign}>
      <AuthProvider {...authProps}>
        {!props.ignoreWorkspace && !shouldLogin && !projectId && (
          <WorkspaceSelector
            open={isOpen}
            dark={dark}
            onSelect={(workspace) => {
              openWorkspace({ id: workspace.id });
              setIsOpen(false);
            }}
            onClose={() => setIsOpen(false)}
          />
        )}
        {showLoader ? (loadingFallback ?? <DefaultAuthLoader />) : props.children}
      </AuthProvider>
    </OsDesignProvider>
  );
};
