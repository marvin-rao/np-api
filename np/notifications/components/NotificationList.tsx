import { Notification } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

const styles = {
  backdrop: {
    position: "fixed" as const,
    inset: "0",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(4px)",
    zIndex: 40,
  },
  container: {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    maxWidth: "500px",
    position: "relative" as const,
    zIndex: 50,
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 8px",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#111827",
  },
  markAll: {
    fontSize: "14px",
    color: "#2563eb",
    cursor: "pointer",
  },
  markAllButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  list: {
    maxHeight: "400px",
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    padding: "8px",
  },
  loading: {
    textAlign: "center" as const,
    padding: "16px",
  },
  empty: {
    textAlign: "center" as const,
    padding: "32px",
    color: "#6b7280",
  },
};

type Props = {
  onNotificationClick?: (n: Notification) => void;
  showBackdrop?: boolean;
  onBackdropClick?: () => void;
};

export const NotificationList = ({
  onNotificationClick,
  showBackdrop = true,
  onBackdropClick = () =>
    console.log(
      "NotificationList: backdrop clicked - provide onBackdropClick handler to close"
    ),
}: Props) => {
  const { notifications, loading, error, onMarkAllAsRead, onMarkAsRead } =
    useNotifications();

  if (loading) {
    return <div style={styles.loading}>Loading notifications…</div>;
  }

  if (error) {
    return (
      <div style={{ ...styles.loading, color: "red" }}>
        Error loading notifications
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);

  return (
    <>
      {showBackdrop && (
        <div style={styles.backdrop} onClick={onBackdropClick} />
      )}
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Notifications</span>
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
        <div style={styles.list}>
          {notifications.length === 0 && (
            <div style={styles.empty}>No notifications</div>
          )}
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={onNotificationClick ?? (() => {})}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// Re-export child component for convenience
export { NotificationItem };
