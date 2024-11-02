import React, { useState } from "react";
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
    padding: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
  },
  subtitle: {
    marginTop: "0.25rem",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  search: {
    padding: "1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  searchInput: {
    width: "100%",
    padding: "0.5rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    transition: "box-shadow 0.15s ease-in-out",
  },
  list: {
    maxHeight: "calc(100vh - 24rem)",
    overflowY: "auto",
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
    padding: "1rem",
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
};

export const WorkspacesModalView = ({
  workspaces,
  onClose,
  onSelect,
}: Props) => {
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(filter.toLowerCase()) ||
      workspace.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    // @ts-ignore
    <div style={style.overlay}>
      <div style={style.modal}>
        <div style={style.header}>
          <h2 style={style.title}>Select Workspace</h2>
          <p style={style.subtitle}>Choose a workspace to continue</p>
        </div>

        <div style={style.search}>
          <input
            style={style.searchInput}
            type="text"
            placeholder="Search workspaces..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {/* @ts-ignore */}
        <div style={style.list}>
          {filteredWorkspaces.map((workspace) => (
            <button
              key={workspace.id}
              //   @ts-ignore
              style={{
                ...style.item,
                backgroundColor:
                  selectedId === workspace.id
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
                    hoveredId === workspace.id
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.1)",
                  transform:
                    hoveredId === workspace.id ? "scale(1.1)" : "scale(1)",
                }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div style={style.content}>
                <div style={style.itemHeader}>
                  <div
                    style={{
                      ...style.itemTitle,
                      color: hoveredId === workspace.id ? "#2563eb" : "#111827",
                    }}
                  >
                    {workspace.name}
                  </div>
                  <span style={style.itemDate}>{workspace.lastActive}</span>
                </div>
                <div
                  // @ts-ignore
                  style={{
                    ...style.description,
                    color: hoveredId === workspace.id ? "#4b5563" : "#6b7280",
                  }}
                >
                  {workspace.description}
                </div>
                <div style={style.members}>{workspace.members} members</div>
              </div>
            </button>
          ))}
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
      </div>
    </div>
  );
};
