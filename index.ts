import { NPMainActionBar } from "./np/components/Navbar";
import { NewPaperProvider, BrandedAuthLoader } from "./np/components/NewPaperProvider";
import { WorkspaceSelector } from "./np/components/workspace/WorkspaceSelector";
import {
  useAddFilesAppFile as useWebAddFilesAppFile,
  useDeleteFilesAppFile as useWebDeleteFilesAppFile,
  useFileAppFiles as useWebFileAppFiles,
  useWebFileUpload,
  useWebNativeFileUpload,
  useUpdateFilesAppFile as useWebUpdateFilesAppFile,
} from "./np/webFilesApp";
import { useWebFileUploadV2 } from "./np/webFilesAppV2";

export { LoginButton } from "./helper/AuthHelper";
export { AuthProvider, useAuthSession } from "./helper/provider";

export * from "./api";
export * from "./helper/utils";
export * from "./np/calendar";
export * from "./np/career_types";
export * from "./np/customers";
export * from "./np/developer";
export * from "./np/filesapp";
export * from "./np/bookings";

export * from "./np/career";
export * from "./np/chat";
export * from "./np/npai";
export * from "./np/npai-workspace";
export { useIsMobile, useViewport } from "./np/hooks/useResponsive";
export * from "./np/messages";
export * from "./np/notes";
export * from "./np/formdocs";
export * from "./np/osBridge";
export { NotificationItem, NotificationList } from "./np/notifications/components/NotificationList";
export { NotificationsPage } from "./np/notifications/components/NotificationsPage";
export { ResponsiveNotifications } from "./np/notifications/components/ResponsiveNotifications";
export * from "./np/notifications/hooks/useNotifications";
export * from "./np/notifications/types";
export * from "./np/projects";
export * from "./np/recruit";
export * from "./np/useFileUpload";
export {
  useWebAddFilesAppFile, useWebDeleteFilesAppFile, useWebFileAppFiles, useWebFileUpload,
  useWebNativeFileUpload, useWebUpdateFilesAppFile
};
export { useWebFileUploadV2 };
export type { UploadFileResumableProps } from "./np/webFilesAppV2";

export { NewPaperProvider, NPMainActionBar, WorkspaceSelector, BrandedAuthLoader };
export { OsDesignProvider, useOsDesign } from "./np/design/OsDesignContext";
export { AppLauncher } from "./np/components/AppLauncher";
export {
  NEWPAPER_APPS,
  buildNewpaperAppUrl,
} from "./np/components/AppLauncher.apps";
export type { NewpaperAppDef } from "./np/components/AppLauncher.apps";


