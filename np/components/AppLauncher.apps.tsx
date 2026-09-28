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
import canvasIcon from "./app-icons/canvas.png?url";
import indabaIcon from "./app-icons/indaba.png?url";
import formsIcon from "./app-icons/forms.png?url";
import spacedriveIcon from "./app-icons/spacedrive.png?url";
import bookingIcon from "./app-icons/booking.png?url";
import tasksIcon from "./app-icons/tasksappicon.png?url";
import recruitIcon from "./app-icons/recruite_app_icon.png?url";
import careerIcon from "./app-icons/career_app_icon.png?url";
import spaceosIcon from "./app-icons/spaceos.png?url";
import callsIcon from "./app-icons/calls.png?url";
import shiftsIcon from "./app-icons/shifts.png?url";
import leaveIcon from "./app-icons/leave.png?url";
import timeTrackingIcon from "./app-icons/timetracking.png?url";
import payslipsIcon from "./app-icons/payslips.png?url";
import chatIcon from "./app-icons/chat.png?url";
import meIcon from "./app-icons/me.png?url";

export interface NewpaperAppDef {
    /** Stable id for keying. */
    id: string;
    /** Display label shown under the icon. */
    label: string;
    /** One line on what the app is for, shown when a tile is hovered. */
    description?: string;
    /**
     * Section the launcher shows the app in. Omitted = the main grid;
     * "hr" = the HR group at the bottom (people, hiring and rosters).
     */
    group?: "hr";
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
        description: "Your workspace home, with every Newpaper tool in one place",
        iconUrl: spaceosIcon,
        fallbackGlyph: "◆",
        // SpaceOS is the main Newpaper shell. The
        // workspace dashboard lives at `/project/<id>/`.
        buildUrl: (pid) =>
            pid
                ? `https://spaceos.newpaper.app/workspace/${pid}/`
                : "https://spaceos.newpaper.app/",
    },
    {
        id: "spaceai",
        label: "Space AI",
        description: "An AI assistant that works across your workspace",
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
        description: "Write, organise and share notes and documents",
        iconUrl: notesIcon,
        fallbackGlyph: "N",
        buildUrl: (pid) =>
            pid
                ? `https://notes.newpaper.app/workspace/${pid}/`
                : "https://notes.newpaper.app/",
    },
    {
        id: "canvas",
        label: "Canvas",
        description: "An infinite whiteboard for sticky notes, diagrams and plans",
        iconUrl: canvasIcon,
        fallbackGlyph: "▦",
        buildUrl: (pid) =>
            pid
                ? `https://canvas.newpaper.app/workspace/${pid}/`
                : "https://canvas.newpaper.app/",
    },
    {
        id: "forms",
        label: "Forms",
        description: "Build forms and surveys, and collect responses",
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
        description: "Store, organise and share your files",
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
        description: "Let people book appointments and time with you",
        iconUrl: bookingIcon,
        fallbackGlyph: "B",
        buildUrl: (pid) =>
            pid
                ? `https://booking.newpaper.app/workspace/${pid}/`
                : "https://booking.newpaper.app/",
    },
    {
        id: "calls",
        label: "Calls",
        description: "Voice and video calls with your team",
        iconUrl: callsIcon,
        fallbackGlyph: "☎",
        buildUrl: (pid) =>
            pid
                ? `https://calls.newpaper.app/workspace/${pid}/`
                : "https://calls.newpaper.app/",
    },
    {
        id: "chat",
        label: "Chat",
        description: "Message your team, one-to-one or in groups",
        iconUrl: chatIcon,
        fallbackGlyph: "💬",
        buildUrl: () => "https://chat.newpaper.app/",
    },
    {
        id: "indaba",
        label: "Indaba",
        description: "Company announcements people read and acknowledge",
        iconUrl: indabaIcon,
        fallbackGlyph: "I",
        buildUrl: (pid) =>
            pid
                ? `https://indaba.newpaper.app/workspace/${pid}/`
                : "https://indaba.newpaper.app/",
    },
    {
        id: "tasks",
        label: "Tasks",
        description: "Plan and track work on task boards",
        iconUrl: tasksIcon,
        fallbackGlyph: "T",
        // Tasks lives inside the SpaceOS shell at
        // `/project/<id>/tasks/boards`.
        buildUrl: (pid) =>
            pid
                ? `https://spaceos.newpaper.app/workspace/${pid}/tasks/boards`
                : "https://spaceos.newpaper.app/",
    },
    {
        id: "recruit",
        group: "hr",
        label: "Recruit",
        description: "Post jobs and manage candidates through hiring",
        iconUrl: recruitIcon,
        fallbackGlyph: "R",
        buildUrl: (pid) =>
            pid
                ? `https://recruit.newpaper.app/workspace/${pid}/`
                : "https://recruit.newpaper.app/",
    },
    {
        id: "career",
        group: "hr",
        label: "Career",
        description: "Your public careers site, where candidates find and apply for jobs",
        iconUrl: careerIcon,
        fallbackGlyph: "C",
        // Career is the public-facing site, not workspace-scoped.
        buildUrl: () => "https://career.newpaper.app/",
    },
    {
        id: "me",
        group: "hr",
        label: "Employee Portal",
        description: "Your shifts, leave, payslips and to-dos in one place",
        iconUrl: meIcon,
        fallbackGlyph: "E",
        buildUrl: (pid) =>
            pid
                ? `https://employee.newpaper.app/workspace/${pid}/`
                : "https://employee.newpaper.app/",
    },
    {
        id: "shifts",
        group: "hr",
        label: "Shifts",
        description: "Schedule staff shifts and manage rosters",
        iconUrl: shiftsIcon,
        fallbackGlyph: "S",
        // Shifts is not workspace-scoped.
        buildUrl: () => "https://shifts.newpaper.app/",
    },
    {
        id: "leave",
        group: "hr",
        label: "Leave",
        description: "Apply for leave, approve requests and see balances",
        iconUrl: leaveIcon,
        fallbackGlyph: "L",
        // Leave lives in the main Newpaper app.
        buildUrl: (pid) =>
            pid
                ? `https://newpaper.app/project/${pid}/leave/home`
                : "https://newpaper.app/",
    },
    {
        id: "time-tracking",
        group: "hr",
        label: "Time Tracking",
        description: "Log hours worked and see time on the calendar",
        iconUrl: timeTrackingIcon,
        fallbackGlyph: "T",
        buildUrl: (pid) =>
            pid
                ? `https://newpaper.app/project/${pid}/time-tracking/calendar`
                : "https://newpaper.app/",
    },
    {
        id: "payslips",
        group: "hr",
        label: "Payslips",
        description: "Your payslips, and payslips for your team",
        iconUrl: payslipsIcon,
        fallbackGlyph: "P",
        buildUrl: (pid) =>
            pid
                ? `https://newpaper.app/project/${pid}/accounting/payslips/mypayslips`
                : "https://newpaper.app/",
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
                className="np-app-launcher-fallback"
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background:
                        "linear-gradient(135deg,#94a3b8 0%,#475569 100%)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
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
                width: 56,
                height: 56,
                borderRadius: 14,
                objectFit: "contain",
                display: "block",
            }}
        />
    );
};
