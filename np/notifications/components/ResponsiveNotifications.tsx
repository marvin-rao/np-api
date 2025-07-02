import { Notification } from "../types";
import { NotificationList } from "./NotificationList";
import { NotificationsPage } from "./NotificationsPage";
import { useIsMobile } from "../../hooks/useResponsive";

type Props = {
  isVisible: boolean;
  onNotificationClick?: (n: Notification) => void;
  onClose: () => void;
  mobileBreakpoint?: number;
  backButtonText?: string;
};

export const ResponsiveNotifications = ({
  isVisible,
  onNotificationClick,
  onClose,
  mobileBreakpoint = 768,
  backButtonText = "Back",
}: Props) => {
  const isMobile = useIsMobile(mobileBreakpoint);

  if (!isVisible) return null;

  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "#f8fafc",
          overflowY: "auto" as const,
        }}
      >
        <NotificationsPage
          onNotificationClick={(notification) => {
            onNotificationClick?.(notification);
            // Auto-close on mobile after clicking a notification
            onClose();
          }}
          onBack={onClose}
          backButtonText={backButtonText}
        />
      </div>
    );
  }

  // Desktop: Modal view
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <NotificationList
        onNotificationClick={onNotificationClick}
        showBackdrop={true}
        onBackdropClick={onClose}
      />
    </div>
  );
};
