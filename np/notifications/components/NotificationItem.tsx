import React from "react";
import { Notification } from "../types";

const styles = {
  card: {
    display: "flex",
    alignItems: "flex-start",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    marginBottom: "8px",
    backgroundColor: "#ffffff",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
  },
  unread: {
    backgroundColor: "#f8fafc",
  },
  avatarWrap: {
    marginRight: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "4px",
    objectFit: "cover" as const,
  },
  placeholder: {
    backgroundColor: "#e5e7eb",
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: "14px",
    color: "#111827",
  },
  date: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  markButton: {
    marginLeft: "12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

type Props = {
  notification: Notification;
  onClick: (n: Notification) => void;
  onMarkAsRead: (n: Notification[]) => void;
};

function relativeTime(timestamp?: number): string {
  if (!timestamp) return "";
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export const NotificationItem = ({
  notification,
  onClick,
  onMarkAsRead,
}: Props) => {
  const avatarSrc =
    notification.user?.icon?.s240 || notification.user?.icon?.original || "";

  return (
    <div
      style={{
        ...styles.card,
        ...(notification.read ? {} : styles.unread),
        cursor: "pointer",
      }}
      onClick={() => onClick(notification)}
    >
      <div style={styles.avatarWrap}>
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" style={styles.avatar} />
        ) : (
          <div style={{ ...styles.avatar, ...styles.placeholder }} />
        )}
      </div>
      <div style={styles.content}>
        <div style={styles.message}>{notification.text}</div>
        <div style={styles.date}>{relativeTime(notification.created)}</div>
      </div>
      {!notification.read && (
        <button
          style={styles.markButton}
          title="Mark as read"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead([notification]);
          }}
        >
          ✓
        </button>
      )}
    </div>
  );
};
