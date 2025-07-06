import { useProjectGetBase } from "./projects";

export const useChatsUnreadCount = () => {
    return useProjectGetBase<{ count: number }>({ path: "chat/chats/unread_count" });
};