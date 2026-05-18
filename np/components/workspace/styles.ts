/**
 * Theme palette for the workspace modal. `makeStyle(dark)` builds the
 * style object for the requested color scheme; the `style` export keeps
 * the original light-mode object for backward compatibility.
 */
export type Palette = {
    dark: boolean;
    overlay: string;
    modalBg: string;
    surfaceBg: string;
    border: string;
    inputBg: string;
    inputBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    accentSoft: string;
    accentSofter: string;
    accentSoftest: string;
    hoverSurface: string;
    errorBg: string;
    errorBorder: string;
    errorText: string;
};

export const getPalette = (dark: boolean): Palette =>
    dark
        ? {
            dark,
            overlay: "rgba(0, 0, 0, 0.65)",
            modalBg: "#1f2937",
            surfaceBg: "#111827",
            border: "#374151",
            inputBg: "#374151",
            inputBorder: "#4b5563",
            textPrimary: "#f9fafb",
            textSecondary: "#d1d5db",
            textMuted: "#9ca3af",
            accent: "#60a5fa",
            accentHover: "#93c5fd",
            accentSoft: "rgba(96, 165, 250, 0.25)",
            accentSofter: "rgba(96, 165, 250, 0.18)",
            accentSoftest: "rgba(96, 165, 250, 0.1)",
            hoverSurface: "#374151",
            errorBg: "rgba(220, 38, 38, 0.15)",
            errorBorder: "#7f1d1d",
            errorText: "#fca5a5",
        }
        : {
            dark,
            overlay: "rgba(0, 0, 0, 0.5)",
            modalBg: "white",
            surfaceBg: "#f9fafb",
            border: "#e5e7eb",
            inputBg: "white",
            inputBorder: "#d1d5db",
            textPrimary: "#111827",
            textSecondary: "#374151",
            textMuted: "#6b7280",
            accent: "#2563eb",
            accentHover: "#1d4ed8",
            accentSoft: "rgba(59, 130, 246, 0.15)",
            accentSofter: "rgba(59, 130, 246, 0.1)",
            accentSoftest: "rgba(59, 130, 246, 0.05)",
            hoverSurface: "#f3f4f6",
            errorBg: "#fef2f2",
            errorBorder: "#fecaca",
            errorText: "#dc2626",
        };

export const makeStyle = (dark: boolean) => {
    const p = getPalette(dark);
    return {
        palette: p,
        overlay: {
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: p.overlay,
            backdropFilter: "blur(4px)",
        },
        modal: {
            width: "100%",
            maxWidth: "28rem",
            backgroundColor: p.modalBg,
            borderRadius: "0.5rem",
            boxShadow: dark
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
                : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            overflow: "hidden",
        },
        header: {
            padding: "8px",
            paddingLeft: "18px",
            borderBottom: `1px solid ${p.border}`,
        },
        title: {
            fontSize: "1.25rem",
            fontWeight: 600,
            color: p.textPrimary,
            marginTop: "4px"
        },
        subtitle: {
            fontSize: "0.875rem",
            color: p.textMuted,
            marginTop: "4px",
        },
        search: {
            padding: "1rem",
            borderBottom: `1px solid ${p.border}`,
        },
        searchContainer: {
            position: "relative" as const,
            display: "flex",
            alignItems: "center",
        },
        searchInput: {
            width: "100%",
            padding: "0.5rem 2.5rem 0.5rem 2.5rem",
            border: `1px solid ${p.inputBorder}`,
            borderRadius: "0.375rem",
            transition: "box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out",
            fontSize: "14px",
            backgroundColor: p.inputBg,
            color: p.textPrimary,
        },
        searchIcon: {
            position: "absolute" as const,
            left: "0.75rem",
            width: "16px",
            height: "16px",
            color: p.textMuted,
            pointerEvents: "none" as const,
        },
        clearButton: {
            position: "absolute" as const,
            right: "0.5rem",
            width: "20px",
            height: "20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: p.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background-color 0.15s ease-in-out",
        },
        list: {
            maxHeight: "calc(100vh - 24rem)",
            overflowY: "auto" as const,
        },
        noResults: {
            padding: "2rem",
            textAlign: "center" as const,
            color: p.textMuted,
            fontSize: "0.875rem",
        },
        item: {
            width: "100%",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "flex-start",
            textAlign: "left",
            border: "none",
            borderBottom: `1px solid ${p.border}`,
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
            backgroundColor: "transparent",
            position: "relative" as const,
        },
        avatar: {
            height: "2.5rem",
            width: "2.5rem",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.375rem",
            backgroundColor: p.accentSofter,
            color: p.accent,
            fontWeight: 500,
            transition: "all 0.2s ease-in-out",
        },
        content: {
            marginLeft: "1rem",
            flex: 1,
            minWidth: 0,
            cursor: "pointer",
        },
        itemHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        itemTitle: {
            fontWeight: 500,
            color: p.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
        itemDate: {
            marginLeft: "0.5rem",
            fontSize: "0.75rem",
            color: p.textMuted,
        },
        description: {
            fontSize: "0.875rem",
            color: p.textMuted,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
        },
        members: {
            marginTop: "0.25rem",
            fontSize: "0.75rem",
            color: p.textMuted,
        },
        footer: {
            padding: "1rem",
            borderTop: `1px solid ${p.border}`,
            backgroundColor: p.surfaceBg,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        cancelButton: {
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: p.textSecondary,
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            transition: "all 0.15s ease-in-out",
        },
        createButton: {
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: p.accent,
            backgroundColor: "transparent",
            border: `1px solid ${p.accent}`,
            borderRadius: "0.375rem",
            cursor: "pointer",
            transition: "all 0.15s ease-in-out",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        editIcon: {
            position: "absolute" as const,
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            width: "32px",
            height: "32px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: p.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.25rem",
            transition: "all 0.15s ease-in-out",
            zIndex: 10,
        },
    };
};

export type ModalStyle = ReturnType<typeof makeStyle>;

/** Backward-compatible light-mode style object. */
export const style = makeStyle(false);
