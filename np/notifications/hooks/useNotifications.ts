import { useProjectGetBase, useProjectRequest, useProjectId } from "../../projects";
import { Notification } from "../types";

export function useNotifications() {
  useProjectId();

  const {
    data: listData,
    loading: isLoading,
    error,
    refetch,
  } = useProjectGetBase<Notification[]>({ path: "notifications/list" });

  const notifications: Notification[] = listData ?? [];

 
  const { submit: submitMarkRead } = useProjectRequest<string[]>({
    path: "notifications/markasread",
    method: "post",
  });

  const { submit: submitMarkAllRead } = useProjectRequest<object>({
    path: "notifications/markallasread",
    method: "post",
  });

  const refresh = () => {
    refetch();
  };

  const onMarkAsRead = (arr: Notification[]) => {
    const ids = arr.map((n) => n.id).filter(Boolean) as string[];
    if (ids.length === 0) return;
    submitMarkRead(ids, () => refresh());
  };

  const onMarkAllAsRead = () => {
    submitMarkAllRead({}, () => refresh());
  };

  return {
    notifications,
    loading: isLoading,
    error,
    refetch,
    onMarkAsRead,
    onMarkAllAsRead,
  };
} 