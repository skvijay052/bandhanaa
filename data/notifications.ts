export type NotificationType =
  "like" | "message" | "accepted" | "view" | "connection" | "profile_complete";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  name?: string;
  age?: number;
  title: string;
  subtitle?: string;
  avatar?: string;
  time: string;
  unread: boolean;
  section: "today" | "yesterday" | "earlier";
  actionLabel?: string;
}
