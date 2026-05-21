import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProjectId } from "../projects";
import { useResolvedDarkMode } from "./workspace/useColorScheme";
import {
    buildNewpaperAppUrl,
    NEWPAPER_APPS,
    NewpaperAppDef,
    NewpaperAppIcon,
} from "./AppLauncher.apps";

interface AppLauncherProps {
    /** Override the dark-mode signal (defaults to the host theme). */
    dark?: boolean;
    /** Optional override list — defaults to `NEWPAPER_APPS`. */
    apps?: NewpaperAppDef[];
}

/**
 * Google-style 9-dot app launcher for the Newpaper action bar.
 *
 * Renders as a round 36×36 button. Opens a popover with a 3-column grid
 * of Newpaper apps. Each tile deep-links to the app, scoped to the
 * currently active workspace where possible.
 */
export const AppLauncher: React.FC<AppLauncherProps> = ({
    dark: darkOverride,
    apps = NEWPAPER_APPS,
}) => {
    const dark = useResolvedDarkMode(darkOverride);
    const { projectId } = useProjectId();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    // Click outside / Escape to close.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const palette = useMemo(() => makePalette(dark), [dark]);

    return (
        <div ref={wrapRef} style={styles.wrap}>
            <button
                type="button"
                aria-label="Newpaper apps"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = palette.btnHoverBg;
                    e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = open
                        ? palette.btnHoverBg
                        : "transparent";
                    e.currentTarget.style.opacity = open ? "1" : "0.75";
                    e.currentTarget.style.transform = "scale(1)";
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor =
                        palette.btnActiveBg;
                    e.currentTarget.style.transform = "scale(0.92)";
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = palette.btnHoverBg;
                    e.currentTarget.style.transform = "scale(1)";
                }}
                onBlur={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                }}
                style={{
                    ...styles.button,
                    // Inherit the navbar's text color so the dots are
                    // always visible against whichever background the
                    // host action bar is using (light navbar, dark
                    // navbar wrapper, etc.). The palette only controls
                    // the hover/active wash and popover chrome.
                    color: "currentColor",
                    opacity: open ? 1 : 0.75,
                    backgroundColor: open ? palette.btnHoverBg : "transparent",
                }}
            >
                <NineDotIcon />
            </button>

            <div
                style={{
                    ...styles.popover,
                    background: palette.popoverBg,
                    boxShadow: palette.popoverShadow,
                    border: `0.5px solid ${palette.popoverBorder}`,
                    opacity: open ? 1 : 0,
                    visibility: open ? "visible" : "hidden",
                    transform: open
                        ? "translateY(0) scale(1)"
                        : "translateY(-6px) scale(0.98)",
                    pointerEvents: open ? "auto" : "none",
                }}
                role="menu"
            >
                <div
                    style={{
                        ...styles.eyebrow,
                        color: palette.eyebrow,
                    }}
                >
                    Newpaper apps
                </div>
                <div style={styles.grid}>
                    {apps.map((app) => (
                        <a
                            key={app.id}
                            href={buildNewpaperAppUrl(app, projectId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            style={{
                                ...styles.tile,
                                color: palette.tileLabel,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    palette.tileHoverBg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    palette.tileActiveBg;
                                e.currentTarget.style.transform = "scale(0.96)";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    palette.tileHoverBg;
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <NewpaperAppIcon app={app} />
                            <div style={styles.tileLabel}>{app.label}</div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

const NineDotIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="currentColor"
        aria-hidden="true"
    >
        {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
                <circle
                    key={`${row}-${col}`}
                    cx={2.5 + col * 6.5}
                    cy={2.5 + row * 6.5}
                    r={1.5}
                />
            ))
        )}
    </svg>
);

const makePalette = (dark: boolean) =>
    dark
        ? {
              btnIcon: "rgba(255,255,255,0.85)",
              btnHoverBg: "rgba(255,255,255,0.08)",
              btnActiveBg: "rgba(255,255,255,0.14)",
              popoverBg: "rgba(28,28,32,0.85)",
              popoverBorder: "rgba(255,255,255,0.08)",
              popoverShadow:
                  "0 20px 50px -12px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.04)",
              eyebrow: "rgba(255,255,255,0.55)",
              tileLabel: "rgba(255,255,255,0.9)",
              tileHoverBg: "rgba(255,255,255,0.06)",
              tileActiveBg: "rgba(255,255,255,0.12)",
          }
        : {
              btnIcon: "rgba(0,0,0,0.65)",
              btnHoverBg: "rgba(0,0,0,0.06)",
              btnActiveBg: "rgba(0,0,0,0.12)",
              popoverBg: "rgba(250,250,252,0.92)",
              popoverBorder: "rgba(0,0,0,0.06)",
              popoverShadow:
                  "0 20px 50px -12px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.04)",
              eyebrow: "rgba(0,0,0,0.5)",
              tileLabel: "rgba(0,0,0,0.85)",
              tileHoverBg: "rgba(0,0,0,0.04)",
              tileActiveBg: "rgba(0,0,0,0.09)",
          };

const styles: { [key: string]: React.CSSProperties } = {
    wrap: {
        position: "relative",
        display: "inline-flex",
    },
    button: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition:
            "background-color 160ms ease, opacity 160ms ease, transform 120ms ease",
        padding: 0,
    },
    popover: {
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 320,
        padding: 12,
        borderRadius: 20,
        zIndex: 1000,
        backdropFilter: "saturate(180%) blur(30px)",
        WebkitBackdropFilter: "saturate(180%) blur(30px)",
        transition: "opacity 180ms ease, transform 180ms ease",
        transformOrigin: "top right",
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        padding: "4px 8px 10px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 4,
    },
    tile: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 6px",
        borderRadius: 12,
        textDecoration: "none",
        transition:
            "background-color 140ms ease, transform 120ms ease",
        outline: "none",
    },
    tileLabel: {
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.2,
        textAlign: "center",
        maxWidth: 80,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};
