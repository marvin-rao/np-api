import { useState } from "react";
import { useAuthData } from "../../../helper/provider";
import { useCreateWorkspace } from "../../projects";
import { Workspace } from "../../types";
import { CreateWorkspaceForm } from "./CreateWorkspaceForm";
import { makeStyle } from "./styles";
import { usePrefersDark } from "./useColorScheme";

type Props = {
  onSelect: (workspace: Workspace) => void;
  onClose: () => void;
  workspaces: Workspace[];
  loading: boolean;
  currentWorkspaceId?: string | null;
  onWorkspaceCreated?: () => void;
};

export const WorkspacesModalView = ({
  workspaces,
  onClose,
  onSelect,
  loading,
  currentWorkspaceId,
  onWorkspaceCreated,
}: Props) => {
  const { callerProduct } = useAuthData();
  const dark = usePrefersDark();
  const style = makeStyle(dark);
  const p = style.palette;
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { submit, loading: createLoading, error } = useCreateWorkspace();

  const filteredWorkspaces = workspaces
    .filter(
      (workspace) =>
        workspace.name.toLowerCase().includes(filter.toLowerCase()) ||
        (workspace.description &&
          workspace.description.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) => b.created - a.created);

  const handleClearSearch = () => {
    setFilter("");
  };

  const handleEditWorkspace = (workspace: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `https://www.newpaper.app/project/${workspace.id}/settings/general`,
      "_blank"
    );
  };

  const handleCreateWorkspace = (data: {
    name: string;
    description: string;
  }) => {
    const payload: Workspace = {
      ...data,
      productSettings: {
        [callerProduct]: {
          enabled: true,
          isPrivate: false,
          users: {},
        },
      },
      id: "____",
      activePlanId: "free",
      created: +new Date(),
      members: 1,
      lastActive: new Date().toLocaleDateString(),
    } as Workspace;

    submit(payload, (response) => {
      if (response.data) {
        setShowCreateForm(false);
        onWorkspaceCreated?.();
      }
    });
  };

  if (showCreateForm) {
    return (
      <CreateWorkspaceForm
        onSubmit={handleCreateWorkspace}
        onCancel={() => setShowCreateForm(false)}
        loading={createLoading}
        error={error?.message ?? ""}
        dark={dark}
      />
    );
  }

  return (
    // @ts-ignore
    <div style={style.overlay}>
      <div style={style.modal}>
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "8px",
              fontSize: "14px",
              color: p.textPrimary,
            }}
          >
            Loading Workspaces
          </div>
        )}
        {!loading && (
          <>
            <div style={style.header}>
              <div style={style.title}>Select Workspace</div>
              <div style={style.subtitle}>Choose a workspace to continue</div>
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
                    borderColor: filter ? p.accent : p.inputBorder,
                    boxShadow: filter ? `0 0 0 3px ${p.accentSofter}` : "none",
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
                        hoveredId === "clear" ? p.hoverSurface : "transparent",
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
                          color: p.accent,
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ marginBottom: "1rem" }}>
                        No workspaces available
                      </div>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        style={{
                          ...style.createButton,
                          backgroundColor: p.accent,
                          color: dark ? "#0b1220" : "white",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14m-7-7h14" />
                        </svg>
                        Create Your First Workspace
                      </button>
                    </div>
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
                          ? p.accentSoft
                          : selectedId === workspace.id
                          ? p.accentSofter
                          : hoveredId === workspace.id
                          ? p.accentSoftest
                          : "transparent",
                      transform:
                        hoveredId === workspace.id ? "translateX(4px)" : "none",
                      boxShadow:
                        hoveredId === workspace.id
                          ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                          : "none",
                      borderLeft:
                        workspace.id === currentWorkspaceId
                          ? `4px solid ${p.accent}`
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
                            ? p.accentSoft
                            : hoveredId === workspace.id
                            ? p.accentSofter
                            : p.accentSoftest,
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
                                ? p.accent
                                : hoveredId === workspace.id
                                ? p.accent
                                : p.textPrimary,
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
                                color: p.accent,
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
                            hoveredId === workspace.id
                              ? p.textSecondary
                              : p.textMuted,
                        }}
                      >
                        {workspace.description}
                      </div>
                      <div style={style.members}>
                        {workspace.members} members
                      </div>
                    </div>
                    {workspace.sessionRights?.level === "admin" && (
                      <button
                        style={{
                          ...style.editIcon,
                          color:
                            hoveredId === workspace.id ? p.accent : p.textMuted,
                          backgroundColor:
                            hoveredId === workspace.id
                              ? p.accentSofter
                              : "transparent",
                        }}
                        onClick={(e) => handleEditWorkspace(workspace, e)}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setHoveredId(`edit-${workspace.id}`);
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          setHoveredId(workspace.id);
                        }}
                        title="Edit workspace settings"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </button>
                ))
              )}
            </div>

            <div style={style.footer}>
              <button
                style={{
                  ...style.createButton,
                  backgroundColor:
                    hoveredId === "create" ? p.accentSoftest : "transparent",
                  borderColor:
                    hoveredId === "create" ? p.accentHover : p.accent,
                  color: hoveredId === "create" ? p.accentHover : p.accent,
                }}
                onClick={() => setShowCreateForm(true)}
                onMouseEnter={() => setHoveredId("create")}
                onMouseLeave={() => setHoveredId(null)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                Create New Workspace
              </button>
              <button
                style={{
                  ...style.cancelButton,
                  //   @ts-ignore
                  ":hover": {
                    color: p.textPrimary,
                    backgroundColor: p.hoverSurface,
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
