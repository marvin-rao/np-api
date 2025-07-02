import { Notification } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column" as const,
    overflowY: "auto" as const,
  },
  header: {
    backgroundColor: "#ffffff",
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#2563eb",
    fontWeight: 500,
    fontSize: "14px",
    transition: "background-color 0.2s ease",
  },
  title: {
    fontSize: "20px",
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
  content: {
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    padding: "16px",
    overflowY: "auto" as const,
  },
  loading: {
    textAlign: "center" as const,
    padding: "64px 16px",
    fontSize: "16px",
    color: "#6b7280",
  },
  error: {
    textAlign: "center" as const,
    padding: "64px 16px",
    color: "#dc2626",
    fontSize: "16px",
  },
  empty: {
    textAlign: "center" as const,
    padding: "64px 16px",
    color: "#6b7280",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 16px",
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "8px",
  },
  emptyDescription: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
  },
  notificationsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  mobileNotificationItem: {
    border: "none",
    borderRadius: "12px",
    marginBottom: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
    overflow: "hidden",
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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            {onBack && (
              <button style={styles.backButton} onClick={onBack}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
                </svg>
                {backButtonText}
              </button>
            )}
            <h1 style={styles.title}>Notifications</h1>
            <div style={{ width: "80px" }} />{" "}
            {/* Spacer for center alignment */}
          </div>
        </div>
        <div style={styles.loading}>Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            {onBack && (
              <button style={styles.backButton} onClick={onBack}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
                </svg>
                {backButtonText}
              </button>
            )}
            <h1 style={styles.title}>Notifications</h1>
            <div style={{ width: "80px" }} />
          </div>
        </div>
        <div style={styles.error}>Failed to load notifications</div>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          {onBack && (
            <button style={styles.backButton} onClick={onBack}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
              </svg>
              {backButtonText}
            </button>
          )}
          <h1 style={styles.title}>Notifications</h1>
          {unread.length > 0 && (
            <button
              style={styles.markAllButton}
              onClick={onMarkAllAsRead}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }}
            >
              Mark all ({unread.length})
            </button>
          )}
        </div>
      </div>

      <div style={styles.content}>
        {notifications.length === 0 ? (
          <div style={styles.empty}>
            <svg
              style={styles.emptyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div style={styles.emptyTitle}>No notifications yet</div>
            <div style={styles.emptyDescription}>
              When you have notifications, they'll appear here.
            </div>
          </div>
        ) : (
          <div style={styles.notificationsList}>
            {notifications.map((n) => (
              <div key={n.id} style={styles.mobileNotificationItem}>
                <NotificationItem
                  notification={n}
                  onClick={onNotificationClick ?? (() => {})}
                  onMarkAsRead={onMarkAsRead}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
