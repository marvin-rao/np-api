import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useProjectId } from "../projects";
import { useResolvedDarkMode } from "./workspace/useColorScheme";
import {
    buildNewpaperAppUrl,
    NEWPAPER_APPS,
    NewpaperAppDef,
    NewpaperAppIcon,
} from "./AppLauncher.apps";

const NP_APP_LAUNCHER_STYLE_ID = "np-app-launcher-responsive";
if (
    typeof document !== "undefined" &&
    !document.getElementById(NP_APP_LAUNCHER_STYLE_ID)
) {
    const s = document.createElement("style");
    s.id = NP_APP_LAUNCHER_STYLE_ID;
    s.textContent = `
    .np-app-launcher-popover {
      width: min(360px, calc(100vw - 16px));
      max-width: calc(100vw - 16px);
    }
    @media (max-width: 768px) {
      .np-app-launcher-popover {
        position: fixed !important;
        top: 56px !important;
        left: 8px !important;
        right: 8px !important;
        width: auto !important;
        max-width: none !important;
        padding: 10px !important;
        transform-origin: top center !important;
      }
      .np-app-launcher-grid { gap: 2px !important; }
      .np-app-launcher-hr { padding: 8px !important; }
      .np-app-launcher-tile { padding: 10px 4px !important; }
      .np-app-launcher-tile img,
      .np-app-launcher-tile .np-app-launcher-fallback { width: 48px !important; height: 48px !important; border-radius: 12px !important; }
    }
    @keyframes np-app-tip-in {
      from { opacity: 0; transform: translateY(var(--np-tip-dy, 4px)) scale(0.96); }
      to { opacity: 1; transform: none; }
    }
    /* Touch screens can't hover; a tap opens the app instead. */
    @media (hover: none) {
      .np-app-tip { display: none !important; }
    }
  `;
    document.head.appendChild(s);
}

interface AppLauncherProps {
    /** Override the dark-mode signal (defaults to the host theme). */
    dark?: boolean;
    /** Optional override list — defaults to `NEWPAPER_APPS`. */
    apps?: NewpaperAppDef[];
    /** Name of the current workspace, shown in the header row. */
    currentWorkspaceName?: string;
    /** Invoked when the user taps the workspace header row. */
    onChooseWorkspace?: () => void;
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
    currentWorkspaceName,
    onChooseWorkspace,
}) => {
    const dark = useResolvedDarkMode(darkOverride);
    const { projectId } = useProjectId();
    const [open, setOpen] = useState(false);
    // Tooltip for the tile under the pointer (or keyboard focus).
    const [tip, setTip] = useState<{ app: NewpaperAppDef; rect: DOMRect } | null>(null);
    const tipTimer = useRef<number | undefined>(undefined);
    // Once a tooltip has shown, moving to the next tile shows its tooltip
    // straight away instead of waiting out the delay again.
    const tipWarmUntil = useRef(0);

    const showTip = (app: NewpaperAppDef, el: HTMLElement, immediate = false) => {
        if (!app.description) return;
        window.clearTimeout(tipTimer.current);
        const rect = el.getBoundingClientRect();
        const delay = immediate || Date.now() < tipWarmUntil.current ? 0 : 400;
        tipTimer.current = window.setTimeout(() => setTip({ app, rect }), delay);
    };
    const hideTip = () => {
        window.clearTimeout(tipTimer.current);
        setTip((t) => {
            if (t) tipWarmUntil.current = Date.now() + 500;
            return null;
        });
    };
    useEffect(() => () => window.clearTimeout(tipTimer.current), []);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    // Click outside / Escape to close.
    useEffect(() => {
        if (!open) {
            window.clearTimeout(tipTimer.current);
            setTip(null);
            return;
        }
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
    const mainApps = apps.filter((a) => a.group !== "hr");
    const hrApps = apps.filter((a) => a.group === "hr");

    const renderTile = (app: NewpaperAppDef, hoverBg: string) => (
        <a
            key={app.id}
            className="np-app-launcher-tile"
            href={buildNewpaperAppUrl(app, projectId)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
                hideTip();
                setOpen(false);
            }}
            aria-label={
                app.description ? `${app.label}. ${app.description}` : app.label
            }
            onFocus={(e) => showTip(app, e.currentTarget, true)}
            onBlur={hideTip}
            style={{
                ...styles.tile,
                color: palette.tileLabel,
            }}
            onMouseEnter={(e) => {
                showTip(app, e.currentTarget);
                e.currentTarget.style.backgroundColor = hoverBg;
            }}
            onMouseLeave={(e) => {
                hideTip();
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.backgroundColor = palette.tileActiveBg;
                e.currentTarget.style.transform = "scale(0.96)";
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.backgroundColor = hoverBg;
                e.currentTarget.style.transform = "scale(1)";
            }}
        >
            <NewpaperAppIcon app={app} />
            <div style={styles.tileLabel}>{app.label}</div>
        </a>
    );

    return (
        <div ref={wrapRef} style={styles.wrap}>
            <button
                type="button"
                aria-label="Newpaper apps"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = open
                        ? palette.btnOpenBg
                        : palette.btnHoverBg;
                    e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = open
                        ? palette.btnOpenBg
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
                    e.currentTarget.style.backgroundColor = open
                        ? palette.btnOpenBg
                        : palette.btnHoverBg;
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
                    backgroundColor: open ? palette.btnOpenBg : "transparent",
                }}
            >
                <NineDotIcon />
            </button>

            <div
                className="np-app-launcher-popover"
                style={{
                    ...styles.popover,
                    background: palette.popoverBg,
                    boxShadow: palette.popoverShadow,
                    border: `0.5px solid ${palette.popoverBorder}`,
                    opacity: open ? 1 : 0,
                    visibility: open ? "visible" : "hidden",
                    transform: open
                        ? "translateY(0) scale(1)"
                        : "translateY(-10px) scale(0.94)",
                    pointerEvents: open ? "auto" : "none",
                    transition: open
                        ? "opacity 220ms cubic-bezier(0.16, 1, 0.3, 1), transform 260ms cubic-bezier(0.16, 1, 0.3, 1), visibility 0s"
                        : "opacity 140ms ease-out, transform 160ms ease-out, visibility 0s linear 160ms",
                }}
                role="menu"
                onScroll={hideTip}
            >
                {onChooseWorkspace && (
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onChooseWorkspace();
                        }}
                        style={{
                            ...styles.workspaceRow,
                            background: palette.workspaceRowBg,
                            color: palette.tileLabel,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                palette.workspaceRowHoverBg;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                                palette.workspaceRowBg;
                        }}
                    >
                        <span style={styles.workspaceRowIcon} aria-hidden="true">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <rect
                                    x="2"
                                    y="3.5"
                                    width="12"
                                    height="9"
                                    rx="1.75"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M6 3.5V2.5C6 2.22 6.22 2 6.5 2H9.5C9.78 2 10 2.22 10 2.5V3.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                        <span style={styles.workspaceRowText}>
                            <span style={styles.workspaceRowEyebrow}>
                                Workspace
                            </span>
                            <span style={styles.workspaceRowName}>
                                {currentWorkspaceName || "Select workspace"}
                            </span>
                        </span>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 12 12"
                            fill="none"
                            style={{ opacity: 0.6, flexShrink: 0 }}
                        >
                            <path
                                d="M4.5 2.5L8 6L4.5 9.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
                <div
                    style={{
                        ...styles.eyebrow,
                        color: palette.eyebrow,
                    }}
                >
                    Newpaper apps
                </div>
                <div
                    style={styles.grid}
                    className="np-app-launcher-grid"
                >
                    {mainApps.map((app) => renderTile(app, palette.tileHoverBg))}
                </div>
                {hrApps.length > 0 && (
                    <section
                        aria-label="HR apps"
                        className="np-app-launcher-hr"
                        style={{
                            ...styles.hrCard,
                            background: palette.hrCardBg,
                            border: `0.5px solid ${palette.hrCardBorder}`,
                        }}
                    >
                        <div style={styles.hrHeader}>
                            <span
                                aria-hidden="true"
                                style={{
                                    ...styles.hrBadge,
                                    background: palette.hrBadgeBg,
                                    boxShadow: palette.hrBadgeShadow,
                                }}
                            >
                                <PeopleIcon />
                            </span>
                            <span style={styles.hrHeaderText}>
                                <span
                                    style={{
                                        ...styles.hrTitle,
                                        color: palette.tileLabel,
                                    }}
                                >
                                    HR
                                </span>
                                <span
                                    style={{
                                        ...styles.hrCaption,
                                        color: palette.hint,
                                    }}
                                >
                                    People, hiring and rosters
                                </span>
                            </span>
                            <span
                                style={{
                                    ...styles.hrCount,
                                    color: palette.hrAccent,
                                    background: palette.hrCountBg,
                                }}
                            >
                                {hrApps.length} apps
                            </span>
                        </div>
                        <div style={styles.grid} className="np-app-launcher-grid">
                            {hrApps.map((app) => renderTile(app, palette.hrTileHoverBg))}
                        </div>
                    </section>
                )}
            </div>
            {tip && <AppTooltip app={tip.app} rect={tip.rect} dark={dark} />}
        </div>
    );
};

/**
 * A tile's tooltip. Portalled to <body> with fixed positioning so the
 * popover's scrolling can't clip it. Sits above the tile, flips below when
 * there's no room, and is nudged back inside the viewport after measuring —
 * the arrow stays on the tile either way.
 */
const AppTooltip: React.FC<{ app: NewpaperAppDef; rect: DOMRect; dark: boolean }> = ({
    app,
    rect,
    dark,
}) => {
    const GAP = 8;
    const EDGE = 8;
    const bubbleRef = useRef<HTMLDivElement | null>(null);
    const [shift, setShift] = useState(0);
    const centre = rect.left + rect.width / 2;
    const below = rect.top < 96;
    const bg = dark ? "rgba(246,246,250,0.97)" : "rgba(24,24,28,0.94)";

    useLayoutEffect(() => {
        const half = (bubbleRef.current?.offsetWidth ?? 0) / 2;
        const clamped = Math.min(
            Math.max(centre, EDGE + half),
            window.innerWidth - EDGE - half
        );
        setShift(clamped - centre);
    }, [centre, app]);

    return createPortal(
        <div
            role="tooltip"
            className="np-app-tip"
            style={{
                position: "fixed",
                left: centre + shift,
                transform: "translateX(-50%)",
                zIndex: 1100,
                pointerEvents: "none",
                ...(below
                    ? { top: rect.bottom + GAP }
                    : { bottom: window.innerHeight - rect.top + GAP }),
            }}
        >
            <div
                ref={bubbleRef}
                style={
                    {
                        position: "relative",
                        width: "max-content",
                        maxWidth: 220,
                        padding: "8px 11px",
                        borderRadius: 10,
                        background: bg,
                        color: dark ? "#1c1c1e" : "#fff",
                        fontSize: 12,
                        lineHeight: 1.4,
                        textAlign: "center",
                        boxShadow: dark
                            ? "0 10px 28px -8px rgba(0,0,0,0.6)"
                            : "0 10px 28px -8px rgba(0,0,0,0.45)",
                        animation:
                            "np-app-tip-in 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                        "--np-tip-dy": below ? "-4px" : "4px",
                    } as React.CSSProperties
                }
            >
                {app.description}
                <span
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        // Undo the viewport nudge so the arrow points at the tile.
                        left: `calc(50% - ${shift}px - 5px)`,
                        width: 10,
                        height: 10,
                        background: bg,
                        transform: "rotate(45deg)",
                        borderRadius: 2,
                        ...(below ? { top: -4 } : { bottom: -4 }),
                    }}
                />
            </div>
        </div>,
        document.body
    );
};

/** Two people, front and back — the HR group's badge. */
const PeopleIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="6" cy="5.25" r="2.25" fill="currentColor" />
        <path
            d="M1.75 13c0-2.35 1.9-4.25 4.25-4.25S10.25 10.65 10.25 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <circle cx="11.25" cy="5.75" r="1.75" fill="currentColor" opacity="0.7" />
        <path
            d="M11.5 8.9c1.6.25 2.75 1.8 2.75 3.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
        />
    </svg>
);

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
              btnOpenBg: "rgba(255,255,255,0.16)",
              popoverBg: "rgba(28,28,32,0.85)",
              popoverBorder: "rgba(255,255,255,0.08)",
              popoverShadow:
                  "0 20px 50px -12px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.04)",
              eyebrow: "rgba(255,255,255,0.55)",
              tileLabel: "rgba(255,255,255,0.9)",
              tileHoverBg: "rgba(255,255,255,0.06)",
              tileActiveBg: "rgba(255,255,255,0.12)",
              workspaceRowBg: "rgba(255,255,255,0.05)",
              workspaceRowHoverBg: "rgba(255,255,255,0.1)",
              hint: "rgba(255,255,255,0.6)",
              hrCardBg:
                  "radial-gradient(120% 90% at 100% 0%, rgba(244,114,182,0.16) 0%, rgba(244,114,182,0) 55%), linear-gradient(160deg, rgba(129,140,248,0.16) 0%, rgba(129,140,248,0.06) 100%)",
              hrCardBorder: "rgba(165,180,252,0.22)",
              hrBadgeBg: "linear-gradient(135deg, #818cf8 0%, #ec4899 100%)",
              hrBadgeShadow: "0 4px 12px -4px rgba(236,72,153,0.6)",
              hrAccent: "#c7d2fe",
              hrCountBg: "rgba(165,180,252,0.14)",
              hrTileHoverBg: "rgba(255,255,255,0.08)",
          }
        : {
              btnIcon: "rgba(0,0,0,0.65)",
              btnHoverBg: "rgba(0,0,0,0.06)",
              btnActiveBg: "rgba(0,0,0,0.12)",
              btnOpenBg: "rgba(0,0,0,0.12)",
              popoverBg: "rgba(250,250,252,0.92)",
              popoverBorder: "rgba(0,0,0,0.06)",
              popoverShadow:
                  "0 20px 50px -12px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.04)",
              eyebrow: "rgba(0,0,0,0.5)",
              tileLabel: "rgba(0,0,0,0.85)",
              tileHoverBg: "rgba(0,0,0,0.04)",
              tileActiveBg: "rgba(0,0,0,0.09)",
              workspaceRowBg: "rgba(0,0,0,0.04)",
              workspaceRowHoverBg: "rgba(0,0,0,0.07)",
              hint: "rgba(0,0,0,0.55)",
              hrCardBg:
                  "radial-gradient(120% 90% at 100% 0%, rgba(244,114,182,0.14) 0%, rgba(244,114,182,0) 55%), linear-gradient(160deg, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0.03) 100%)",
              hrCardBorder: "rgba(99,102,241,0.16)",
              hrBadgeBg: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              hrBadgeShadow: "0 4px 12px -4px rgba(236,72,153,0.45)",
              hrAccent: "#4f46e5",
              hrCountBg: "rgba(99,102,241,0.10)",
              hrTileHoverBg: "rgba(255,255,255,0.7)",
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
        padding: 12,
        borderRadius: 20,
        zIndex: 1000,
        backdropFilter: "saturate(180%) blur(30px)",
        WebkitBackdropFilter: "saturate(180%) blur(30px)",
        transformOrigin: "top right",
        maxHeight: "calc(100vh - 72px)",
        overflowY: "auto",
        willChange: "opacity, transform",
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        padding: "4px 8px 10px",
    },
    workspaceRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        marginBottom: 8,
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",
        transition: "background-color 140ms ease",
    },
    workspaceRowIcon: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        background: "rgba(0,122,255,0.12)",
        color: "#0a66c2",
        flexShrink: 0,
    },
    workspaceRowText: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
    },
    workspaceRowEyebrow: {
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        opacity: 0.55,
        lineHeight: 1.2,
    },
    workspaceRowName: {
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.3,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
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
    hrCard: {
        marginTop: 10,
        padding: 10,
        borderRadius: 16,
    },
    hrHeader: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "2px 4px 8px",
    },
    hrBadge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 9,
        color: "#fff",
        flexShrink: 0,
    },
    hrHeaderText: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
    },
    hrTitle: {
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.02em",
        lineHeight: 1.2,
    },
    hrCaption: {
        fontSize: 11,
        lineHeight: 1.3,
    },
    hrCount: {
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        padding: "3px 8px",
        borderRadius: 999,
        flexShrink: 0,
    },
    tileLabel: {
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.2,
        textAlign: "center",
        maxWidth: 96,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
};
