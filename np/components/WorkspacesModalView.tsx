import { useState } from "react";
import { Workspace } from "../types";

const style = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  },
  modal: {
    width: "100%",
    maxWidth: "28rem",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
  },
  header: {
    padding: "8px",
    paddingLeft: "18px",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  search: {
    padding: "1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  searchContainer: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    padding: "0.5rem 2.5rem 0.5rem 2.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    transition: "box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out",
    fontSize: "14px",
  },
  searchIcon: {
    position: "absolute" as const,
    left: "0.75rem",
    width: "16px",
    height: "16px",
    color: "#6b7280",
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
    color: "#6b7280",
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
    color: "#6b7280",
    fontSize: "0.875rem",
  },
  item: {
    width: "100%",
    padding: "1rem 1.5rem",
    display: "flex",
    alignItems: "flex-start",
    textAlign: "left",
    border: "none",
    borderBottom: "1px solid #e5e7eb",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
    backgroundColor: "transparent",
  },
  avatar: {
    height: "2.5rem",
    width: "2.5rem",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.375rem",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#2563eb",
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
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemDate: {
    marginLeft: "0.5rem",
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  description: {
    fontSize: "0.875rem",
    color: "#6b7280",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  members: {
    marginTop: "0.25rem",
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  footer: {
    padding: "0.4rem",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    display: "flex",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.15s ease-in-out",
  },
};

type Props = {
  onSelect: (workspace: Workspace) => void;
  onClose: () => void;
  workspaces: Workspace[];
  loading: boolean;
  currentWorkspaceId?: string | null;
};

export const WorkspacesModalView = ({
  workspaces,
  onClose,
  onSelect,
  loading,
  currentWorkspaceId,
}: Props) => {
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(filter.toLowerCase()) ||
      (workspace.description &&
        workspace.description.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleClearSearch = () => {
    setFilter("");
  };

  return (
    // @ts-ignore
    <div style={style.overlay}>
      <div style={style.modal}>
        {loading && (
          <div
            style={{ textAlign: "center", padding: "8px", fontSize: "14px" }}
          >
            Loading Workspaces
          </div>
        )}
        {!loading && (
          <>
            <div style={style.header}>
              <h2 style={style.title}>Select Workspace</h2>
              <p style={style.subtitle}>Choose a workspace to continue</p>
            </div>

            <div style={style.search}>
              <div style={style.searchContainer}>
                <svg
                  style={style.searchIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  style={{
                    ...style.searchInput,
                    borderColor: filter ? "#2563eb" : "#d1d5db",
                    boxShadow: filter
                      ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                      : "none",
                  }}
                  type="text"
                  placeholder="Search workspaces by name..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  autoFocus
                />
                {filter && (
                  <button
                    style={{
                      ...style.clearButton,
                      backgroundColor:
                        hoveredId === "clear" ? "#f3f4f6" : "transparent",
                    }}
                    onClick={handleClearSearch}
                    onMouseEnter={() => setHoveredId("clear")}
                    onMouseLeave={() => setHoveredId(null)}
                    title="Clear search"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <path d="M6 4.586L9.293 1.293a1 1 0 111.414 1.414L7.414 6l3.293 3.293a1 1 0 01-1.414 1.414L6 7.414 2.707 10.707a1 1 0 01-1.414-1.414L4.586 6 1.293 2.707a1 1 0 011.414-1.414L6 4.586z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {/* @ts-ignore */}
            <div style={style.list}>
              {filteredWorkspaces.length === 0 ? (
                <div style={style.noResults}>
                  {filter ? (
                    <>
                      <div style={{ marginBottom: "0.5rem" }}>
                        No workspaces found for "{filter}"
                      </div>
                      <button
                        onClick={handleClearSearch}
                        style={{
                          color: "#2563eb",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    "No workspaces available"
                  )}
                </div>
              ) : (
                filteredWorkspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    //   @ts-ignore
                    style={{
                      ...style.item,
                      backgroundColor:
                        workspace.id === currentWorkspaceId
                          ? "rgba(59, 130, 246, 0.15)"
                          : selectedId === workspace.id
                          ? "rgba(59, 130, 246, 0.1)"
                          : hoveredId === workspace.id
                          ? "rgba(59, 130, 246, 0.05)"
                          : "transparent",
                      transform:
                        hoveredId === workspace.id ? "translateX(4px)" : "none",
                      boxShadow:
                        hoveredId === workspace.id
                          ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                          : "none",
                      borderLeft:
                        workspace.id === currentWorkspaceId
                          ? "4px solid #2563eb"
                          : "none",
                    }}
                    onClick={() => {
                      setSelectedId(workspace.id);
                      onSelect(workspace);
                    }}
                    onMouseEnter={() => setHoveredId(workspace.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      style={{
                        ...style.avatar,
                        backgroundColor:
                          workspace.id === currentWorkspaceId
                            ? "rgba(59, 130, 246, 0.3)"
                            : hoveredId === workspace.id
                            ? "rgba(59, 130, 246, 0.2)"
                            : "rgba(59, 130, 246, 0.1)",
                        transform:
                          hoveredId === workspace.id
                            ? "scale(1.1)"
                            : "scale(1)",
                      }}
                    >
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={style.content}>
                      <div style={style.itemHeader}>
                        <div
                          style={{
                            ...style.itemTitle,
                            color:
                              workspace.id === currentWorkspaceId
                                ? "#2563eb"
                                : hoveredId === workspace.id
                                ? "#2563eb"
                                : "#111827",
                            fontWeight:
                              workspace.id === currentWorkspaceId ? 600 : 500,
                          }}
                        >
                          {workspace.name}
                          {workspace.id === currentWorkspaceId && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.75rem",
                                color: "#2563eb",
                              }}
                            >
                              (Current)
                            </span>
                          )}
                        </div>
                        <span style={style.itemDate}>
                          {workspace.lastActive}
                        </span>
                      </div>
                      <div
                        // @ts-ignore
                        style={{
                          ...style.description,
                          color:
                            hoveredId === workspace.id ? "#4b5563" : "#6b7280",
                        }}
                      >
                        {workspace.description}
                      </div>
                      <div style={style.members}>
                        {workspace.members} members
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div style={style.footer}>
              <button
                style={{
                  ...style.cancelButton,
                  //   @ts-ignore
                  ":hover": {
                    color: "#111827",
                    backgroundColor: "#e5e7eb",
                  },
                }}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
