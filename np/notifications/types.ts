import { Image } from "../types";

export type NotificationIdObject =
  | { type: "boardItem"; id: string; boardId: string; projectId: string }
  | { type: "leave"; id: string; projectId: string }
  | {
      type: "chat_message";
      id: string;
      projectId: string;
      channelId: string;
      channelType: "direct" | "group";
    }
  | { type: "task"; id: string; projectId: string }
  | { type: "note"; id: string; projectId: string };

export type NotificationDb = {
  id: string;
  read: boolean;
  created: number; // epoch ms
  text?: string; // server-rendered HTML-ish string
  action:
    | "commentedOnTaskImAssignedTo"
    | "commentedOnTaskICreated"
    | "movedTask"
    | "assignedATaskToMe"
    | "leave_request"
    | "leave_approved"
    | "new_message"
    | "note_shared_with_me";
  creator: { sessionUid: string; projectUid: string };
  object: NotificationIdObject;
};

// Public notification shape consumed by UI (text guaranteed, user info enriched)
export type Notification = Partial<NotificationDb> & {
  text: string;
  appId: string;
  user: { name: string; icon?: Image };
}; 