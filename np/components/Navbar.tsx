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
import { WorkspaceSelector } from "./WorkspaceSelector";
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
}

export const NPMainActionBar = ({
  children,
  userName,
  userEmail,
  logo,
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
    <nav style={styles.navbar}>
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
            }}
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                styles.workspaceButtonHover.backgroundColor || "#e9ecef";
            }}
            onMouseLeave={(e) => {
              if (!showWorkspaceDropdown) {
                e.currentTarget.style.backgroundColor =
                  styles.workspaceButton.backgroundColor || "#f8f9fa";
              }
            }}
          >
            {currentWorkspace?.name || "Select Workspace"}
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
