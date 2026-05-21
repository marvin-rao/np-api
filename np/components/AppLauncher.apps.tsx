import React from "react";
// Icons are co-located with this file (`./app-icons/*.png`) so consumer
// apps get a working launcher without copying anything into their own
// `/public/` directory. Vite/webpack will bundle each PNG and rewrite the
// import to a hashed asset URL.
//
// `?url` ensures the import resolves to the asset's public URL string
// even without ambient `*.png` module declarations on the consumer side.
import spaceaiIcon from "./app-icons/SpaceAi.png?url";
import notesIcon from "./app-icons/notes.png?url";
import formsIcon from "./app-icons/forms.png?url";
import spacedriveIcon from "./app-icons/spacedrive.png?url";
import bookingIcon from "./app-icons/booking.png?url";
import tasksIcon from "./app-icons/tasksappicon.png?url";
import recruitIcon from "./app-icons/recruite_app_icon.png?url";
import careerIcon from "./app-icons/career_app_icon.png?url";
import spaceosIcon from "./app-icons/spaceos.png?url";

export interface NewpaperAppDef {
    /** Stable id for keying. */
    id: string;
    /** Display label shown under the icon. */
    label: string;
    /**
     * Builder for the launch URL. Receives the active workspace id (may be
     * `null` if no workspace is loaded) and returns the absolute URL to
     * open in a new tab.
     */
    buildUrl: (projectId: string | null) => string;
    /**
     * Bundled icon URL (resolved by the bundler at build time). When
     * omitted, the tile renders the fallback gradient glyph instead.
     */
    iconUrl?: string;
    /** Fallback initial used if the icon is missing or fails to load. */
    fallbackGlyph?: string;
}

/**
 * Canonical Newpaper apps shown in the action-bar launcher. Mirrors the
 * SpaceOS shell's app catalog (`HR/client/src/components/sidebar/os/apps/*`)
 * so every Newpaper frontend exposes the same set.
 */
export const NEWPAPER_APPS: NewpaperAppDef[] = [
    {
        id: "spaceos",
        label: "SpaceOS",
        iconUrl: spaceosIcon,
        fallbackGlyph: "◆",
        // SpaceOS is the main Newpaper shell at newpaper.app. The
        // workspace dashboard lives at `/project/<id>/`.
        buildUrl: (pid) =>
            pid ? `https://newpaper.app/project/${pid}/` : "https://newpaper.app/",
    },
    {
        id: "spaceai",
        label: "Space AI",
        iconUrl: spaceaiIcon,
        fallbackGlyph: "✦",
        buildUrl: (pid) =>
            pid
                ? `https://spaceai.newpaper.app/workspace/${pid}/`
                : "https://spaceai.newpaper.app/",
    },
    {
        id: "notes",
        label: "Notes",
        iconUrl: notesIcon,
        fallbackGlyph: "N",
        buildUrl: (pid) =>
            pid
                ? `https://notes.newpaper.app/workspace/${pid}/`
                : "https://notes.newpaper.app/",
    },
    {
        id: "forms",
        label: "Forms",
        iconUrl: formsIcon,
        fallbackGlyph: "F",
        buildUrl: (pid) =>
            pid
                ? `https://forms.newpaper.app/workspace/${pid}/`
                : "https://forms.newpaper.app/",
    },
    {
        id: "files",
        label: "Files",
        iconUrl: spacedriveIcon,
        fallbackGlyph: "Fi",
        buildUrl: (pid) =>
            pid
                ? `https://spacedrive.newpaper.app/workspace/${pid}/`
                : "https://spacedrive.newpaper.app/",
    },
    {
        id: "bookings",
        label: "Bookings",
        iconUrl: bookingIcon,
        fallbackGlyph: "B",
        buildUrl: (pid) =>
            pid
                ? `https://booking.newpaper.app/workspace/${pid}/`
                : "https://booking.newpaper.app/",
    },
    {
        id: "tasks",
        label: "Tasks",
        iconUrl: tasksIcon,
        fallbackGlyph: "T",
        // Tasks lives inside the Newpaper main app at
        // `/project/<id>/tasks/boards` (per SpaceOS routing).
        buildUrl: (pid) =>
            pid
                ? `https://newpaper.app/project/${pid}/tasks/boards`
                : "https://newpaper.app/",
    },
    {
        id: "recruit",
        label: "Recruit",
        iconUrl: recruitIcon,
        fallbackGlyph: "R",
        buildUrl: (pid) =>
            pid
                ? `https://recruit.newpaper.app/workspace/${pid}/`
                : "https://recruit.newpaper.app/",
    },
    {
        id: "career",
        label: "Career",
        iconUrl: careerIcon,
        fallbackGlyph: "C",
        // Career is the public-facing site, not workspace-scoped.
        buildUrl: () => "https://career.newpaper.app/",
    },
    {
        id: "shifts",
        label: "Shifts",
        // No dedicated PNG yet — fall back to the gradient glyph tile.
        fallbackGlyph: "S",
        // Shifts is not workspace-scoped.
        buildUrl: () => "https://shifts.newpaper.app/",
    },
];

/**
 * Build the launch URL for a given app, scoped to the current workspace
 * when supported by the target app.
 */
export const buildNewpaperAppUrl = (
    app: NewpaperAppDef,
    projectId: string | null
): string => app.buildUrl(projectId);

/**
 * Render an app's icon. Tries the bundled image first; if it somehow
 * fails to load we fall back to a tinted glyph tile so a missing asset
 * never leaves a hole.
 */
export const NewpaperAppIcon: React.FC<{ app: NewpaperAppDef }> = ({
    app,
}) => {
    const [errored, setErrored] = React.useState(false);

    if (errored || !app.iconUrl) {
        return (
            <div
                aria-hidden="true"
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background:
                        "linear-gradient(135deg,#94a3b8 0%,#475569 100%)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
            >
                {app.fallbackGlyph || app.label.slice(0, 1)}
            </div>
        );
    }

    return (
        <img
            src={app.iconUrl}
            alt=""
            onError={() => setErrored(true)}
            style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                objectFit: "contain",
                display: "block",
            }}
        />
    );
};
