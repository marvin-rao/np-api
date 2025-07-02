import { Notification } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import React from "react";

const styles: { [key: string]: React.CSSProperties } = {
  // A full-screen, isolated container. This is the ONLY scrollable element.
  page: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#ffffff",
    overflowY: "auto",
    zIndex: 9999,
    boxSizing: "border-box",
  },
  // A sticky header that stays at the top during scroll.
  header: {
    position: "sticky",
    top: 0,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  // Centered title and side buttons for a balanced look.
  headerLeft: { flex: 1, display: "flex", justifyContent: "flex-start" },
  headerCenter: { flex: 2, textAlign: "center" },
  headerRight: { flex: 1, display: "flex", justifyContent: "flex-end" },
  backButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#2563eb",
    fontWeight: 500,
    fontSize: "16px",
    padding: "8px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  markAllButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  // The main content area that holds the list.
  content: {
    padding: "16px",
  },
  // A wrapper for each notification to give it a clean, card-like appearance.
  notificationCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    marginBottom: "12px",
    overflow: "hidden", // Important for clipping child borders
  },
  // Styles for loading, error, and empty states.
  statusContainer: {
    textAlign: "center",
    padding: "80px 16px",
    color: "#6b7280",
  },
  statusIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    opacity: 0.5,
  },
  statusTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "8px",
  },
  statusDescription: {
    fontSize: "14px",
    color: "#6b7280",
  },
};

type Props = {
  onNotificationClick?: (n: Notification) => void;
  onBack?: () => void;
  backButtonText?: string;
};

export const NotificationsPage = ({
  onNotificationClick,
  onBack,
  backButtonText = "Back",
}: Props) => {
  const { notifications, loading, error, onMarkAllAsRead, onMarkAsRead } =
    useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderContent = () => {
    if (loading) {
      return (
        <div style={styles.statusContainer}>
          <div style={styles.statusTitle}>Loading...</div>
          <div style={styles.statusDescription}>
            Fetching your notifications.
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.statusContainer}>
          <div style={{ ...styles.statusTitle, color: "#dc2626" }}>
            Loading Failed
          </div>
          <div style={styles.statusDescription}>
            We couldn't retrieve your notifications. Please try again.
          </div>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div style={styles.statusContainer}>
          <svg
            style={styles.statusIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div style={styles.statusTitle}>No notifications yet</div>
          <div style={styles.statusDescription}>
            When you have notifications, they'll show up here.
          </div>
        </div>
      );
    }

    return (
      <div>
        {notifications.map((n) => (
          <div key={n.id} style={styles.notificationCard}>
            <NotificationItem
              notification={n}
              onClick={onNotificationClick ?? (() => {})}
              onMarkAsRead={onMarkAsRead}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {onBack && (
            <button style={styles.backButton} onClick={onBack}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
              </svg>
              {backButtonText}
            </button>
          )}
        </div>
        <div style={styles.headerCenter}>
          <h1 style={styles.title}>Notifications</h1>
        </div>
        <div style={styles.headerRight}>
          {unreadCount > 0 && (
            <button
              style={styles.markAllButton}
              onClick={onMarkAllAsRead}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Mark all ({unreadCount})
            </button>
          )}
        </div>
      </header>

      <main style={styles.content}>{renderContent()}</main>
    </div>
  );
};
