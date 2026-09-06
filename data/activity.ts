export const activityFilters = [
  "all",
  "profiles",
  "requests",
  "messages",
  "account",
] as const;
export type ActivityFilter = (typeof activityFilters)[number];
export type ActivityPeriod = "7" | "30" | "90" | "all";
export type ActivityItem = {
  id: string;
  type: string;
  targetUserId: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
  target: {
    name: string;
    age: number | null;
    profession: string | null;
    city: string | null;
    state: string | null;
    avatar: string;
    accessible: boolean;
  } | null;
};
export type ActivityPage = { items: ActivityItem[]; hasMore: boolean };
