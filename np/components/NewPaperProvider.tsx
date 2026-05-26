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
   * Branded app icon shown inside the standard auth loader. Pass just an
   * image URL (or `{ src, alt }`) — np-api handles the rounded crop, the
   * rotating halo animation, and the fullscreen backdrop. Use this for 99%
   * of apps. Only reach for `loadingFallback` if you need a fully custom
   * splash.
   */
  loadingIcon?: string | { src: string; alt?: string };
  /**
   * Escape hatch: a fully custom fullscreen element rendered while the
   * session cookie is being verified. When set, it overrides `loadingIcon`.
   * Skipped when `ignoreWorkspace` is `true` (public/share routes).
   */
  loadingFallback?: React.ReactNode;
}

const LOADER_KEYFRAMES = `
@keyframes np-auth-spin { to { transform: rotate(360deg); } }
@keyframes np-auth-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.96); opacity: 0.92; }
}
@media (prefers-color-scheme: dark) {
  .np-auth-loader { background: var(--np-auth-loader-bg, #020617) !important; }
}
`;

const BrandedAuthLoader = ({ src, alt }: { src: string; alt: string }) => (
  <div
    className="np-auth-loader"
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--np-auth-loader-bg, #f8fafc)",
    }}
  >
    <div style={{ position: "relative", width: 84, height: 84 }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          padding: 2,
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.95) 90deg, transparent 200deg, rgba(59,130,246,0.55) 290deg, transparent 360deg)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          // @ts-expect-error - non-standard but widely supported
          maskComposite: "exclude",
          animation: "np-auth-spin 1.6s linear infinite",
        }}
      />
      <img
        src={src}
        alt={alt}
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          width: "calc(100% - 12px)",
          height: "calc(100% - 12px)",
          borderRadius: 18,
          objectFit: "cover",
          boxShadow: "0 8px 24px -6px rgba(0,0,0,0.18)",
          animation: "np-auth-breathe 2.4s ease-in-out infinite",
        }}
      />
    </div>
    <style>{LOADER_KEYFRAMES}</style>
  </div>
);

const DefaultAuthLoader = () => (
  <div
    className="np-auth-loader"
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
    <style>{LOADER_KEYFRAMES}</style>
  </div>
);

export const NewPaperProvider = (props: NewPaperProviderProps) => {
  const { projectId } = useProjectId();
  const { shouldLogin, loading } = useAuthSession();
  const [isOpen, setIsOpen] = useState(true);
  const { osDesign = false, dark, loadingIcon, loadingFallback, ...authProps } = props;

  // Gate children behind the auth check so apps don't flash their
  // unauthenticated UI while the session cookie is being verified.
  // Public routes (ignoreWorkspace=true) skip this gate — they must render
  // immediately and don't depend on the session at all.
  const showLoader = loading && !props.ignoreWorkspace;

  const resolvedLoader = loadingFallback
    ? loadingFallback
    : loadingIcon
      ? (() => {
          const icon =
            typeof loadingIcon === "string"
              ? { src: loadingIcon, alt: "Loading" }
              : { src: loadingIcon.src, alt: loadingIcon.alt ?? "Loading" };
          return <BrandedAuthLoader src={icon.src} alt={icon.alt} />;
        })()
      : <DefaultAuthLoader />;

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
        {showLoader ? resolvedLoader : props.children}
      </AuthProvider>
    </OsDesignProvider>
  );
};
