import React, { useEffect, useRef, useState } from "react";
import { useAccountProfile } from "../../api";
import { logout } from "../../helper/utils";
import {
  getCaptiveModeFromQuery,
  useProjectId,
  useProjects,
} from "../projects";
import { openWorkspace } from "./NewPaperProvider";
import { ProfileImage } from "./ProfileImage";
import { WorkspaceSelector } from "./workspace/WorkspaceSelector";
import { navbarStyles as styles } from "./Navbar.styles";

interface NavbarProps {
  children: any;
  userImage?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  logo?: {
    src: string;
    alt?: string;
    onClick?: () => void;
  };
  containerStyle?: React.CSSProperties;
}

export const NPMainActionBar = ({
  children,
  userName,
  userEmail,
  logo,
  containerStyle,
}: NavbarProps) => {
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const workspaceDropdownRef = useRef<HTMLDivElement | null>(null);
  const { data } = useAccountProfile();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { projectId } = useProjectId();
  const { data: Workspaces } = useProjects();
  const currentWorkspace = Workspaces?.find((w) => w.id == projectId);
  const captiveMode = getCaptiveModeFromQuery();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowLogoutConfirm(false);
      }
      if (
        workspaceDropdownRef.current &&
        !workspaceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWorkspaceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setShowLogoutConfirm(false);
    const rootPath = `${window.location.origin}/`;
    if (window.location.href !== rootPath) {
      window.location.href = rootPath;
    }
  };

  return (
    <nav style={{ ...styles.navbar, ...containerStyle }}>
      {logo && (
        <div style={styles.logoSection}>
          <img
            src={logo.src || "@np_icon.jpg"}
            alt={logo.alt || "Logo"}
            style={styles.logo}
            onClick={logo.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          />
        </div>
      )}
      <div style={styles.leftSection}>{children}</div>

      {!captiveMode && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            style={{
              ...styles.workspaceButton,
              ...(showWorkspaceDropdown && styles.workspaceButtonHover),
              transition: "all 0.2s ease",
              transform: showWorkspaceDropdown ? "scale(1.02)" : "scale(1)",
              boxShadow: showWorkspaceDropdown
                ? "0 4px 12px rgba(0,0,0,0.1)"
                : "0 2px 4px rgba(0,0,0,0.05)",
            }}
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                styles.workspaceButtonHover.backgroundColor || "#e9ecef";
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              if (!showWorkspaceDropdown) {
                e.currentTarget.style.backgroundColor =
                  styles.workspaceButton.backgroundColor || "#f8f9fa";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              }
            }}
          >
            <span
              style={{
                maxWidth: "40vw",
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1,
                minWidth: 0,
                verticalAlign: "middle",
              }}
            >
              {currentWorkspace?.name || "Select Workspace"}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: showWorkspaceDropdown ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div style={styles.profileSection} ref={popoverRef}>
            <ProfileImage
              avatarUrl={data?.avatar?.original}
              name={data?.name ?? ""}
              isOpen={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            />

            <div
              style={{
                ...styles.popover,
                ...(isOpen && styles.popoverVisible),
              }}
            >
              <div style={styles.userInfo}>
                <h4 style={styles.userName}>{data?.name ?? userName}</h4>
                <p style={styles.userEmail}>{data?.email ?? userEmail}</p>
              </div>

              <div
                style={styles.userInfo}
                onClick={() => {
                  setShowProjectSelector(true);
                  setIsOpen(false);
                }}
              >
                Change Workspace
              </div>

              <div
                style={styles.userInfo}
                onClick={() => {
                  if (projectId) {
                    window.open(
                      `https://www.newpaper.app/project/${projectId}/settings/general`,
                      "_blank"
                    );
                  }
                  setIsOpen(false);
                }}
              >
                Manage Workspace
              </div>

              {/* Subscription Promotion */}
              <div
                style={styles.subscriptionPromo}
                onClick={() => {
                  if (projectId) {
                    window.open(
                      `https://newpaper.app/project/${projectId}/settings/billing`,
                      "_blank"
                    );
                  }
                  setIsOpen(false);
                }}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector(
                    ".promo-overlay"
                  ) as HTMLElement;
                  if (overlay) overlay.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector(
                    ".promo-overlay"
                  ) as HTMLElement;
                  if (overlay) overlay.style.opacity = "0";
                }}
              >
                <div
                  className="promo-overlay"
                  style={styles.subscriptionPromoOverlay}
                />
                <h4 style={styles.subscriptionTitle}>
                  <svg
                    style={styles.sparkleIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 0L14.09 8.26L22 6L14.09 8.26L12 0ZM12 0L9.91 8.26L2 6L9.91 8.26L12 0Z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 24L14.09 15.74L22 18L14.09 15.74L12 24ZM12 24L9.91 15.74L2 18L9.91 15.74L12 24Z"
                      fill="currentColor"
                    />
                    <path
                      d="M0 12L8.26 9.91L6 2L8.26 9.91L0 12ZM0 12L8.26 14.09L6 22L8.26 14.09L0 12Z"
                      fill="currentColor"
                    />
                    <path
                      d="M24 12L15.74 9.91L18 2L15.74 9.91L24 12ZM24 12L15.74 14.09L18 22L15.74 14.09L24 12Z"
                      fill="currentColor"
                    />
                  </svg>
                  Go Unlimited
                </h4>
                <p style={styles.subscriptionSubtitle}>
                  Get unlimited usage, storage, and features. No more limits
                  holding you back!
                </p>
                <div style={styles.subscriptionCTA}>
                  View Plans
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ marginLeft: "4px" }}
                  >
                    <path
                      d="M6 3L11 8L6 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {!showLogoutConfirm ? (
                <button
                  style={styles.logoutButton}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    // @ts-ignore
                    e.currentTarget.style.backgroundColor =
                      styles.logoutButtonHover.backgroundColor;
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  Logout
                </button>
              ) : (
                <div style={styles.confirmDialog}>
                  <p style={styles.confirmText}>
                    Are you sure you want to logout?
                  </p>
                  <div style={styles.buttonGroup}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => setShowLogoutConfirm(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.confirmButton}
                      onClick={handleLogout}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#c82333";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc3545";
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <WorkspaceSelector
        onSelect={({ id }) => {
          openWorkspace({ id });
          setShowWorkspaceDropdown(false);
        }}
        open={showWorkspaceDropdown}
        onClose={() => setShowWorkspaceDropdown(false)}
      />

      {showProjectSelector && (
        <WorkspaceSelector
          onSelect={({ id }) => openWorkspace({ id })}
          open={showProjectSelector}
          onClose={() => setShowProjectSelector(false)}
        />
      )}
    </nav>
  );
};
