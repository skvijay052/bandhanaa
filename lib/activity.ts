import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityFilter,
  ActivityItem,
  ActivityPage,
  ActivityPeriod,
} from "@/data/activity";
import { resolveProfilePhoto } from "@/lib/profile-photo";

const PAGE_SIZE = 20;
const filterTypes: Record<Exclude<ActivityFilter, "all">, string[]> = {
  profiles: [
    "profile_viewed",
    "profile_updated",
    "profile_photo_updated",
    "partner_preferences_updated",
    "profile_shortlisted",
    "profile_removed_from_shortlist",
  ],
  requests: [
    "request_sent",
    "request_received",
    "request_accepted",
    "request_declined",
    "request_cancelled",
    "following_started",
    "unfollowed",
  ],
  messages: ["message_sent", "conversation_started"],
  account: [
    "profile_updated",
    "profile_photo_updated",
    "partner_preferences_updated",
    "account_created",
    "email_updated",
    "password_updated",
  ],
};

type ActivityRow = {
  id: string;
  activity_type: string;
  target_user_id: string | null;
  metadata: unknown;
  created_at: string;
};
type ProfileRow = {
  id: string;
  display_name: string | null;
  age: number | null;
  profession: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  gender: string | null;
  is_discoverable: boolean | null;
};

export async function getActivityPage(
  client: SupabaseClient,
  userId: string,
  filter: ActivityFilter,
  period: ActivityPeriod,
  offset = 0,
): Promise<ActivityPage> {
  let query = client
    .from("user_activity")
    .select("id,activity_type,target_user_id,metadata,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE);
  if (filter !== "all") query = query.in("activity_type", filterTypes[filter]);
  if (period !== "all") {
    const since = new Date(
      Date.now() - Number(period) * 86_400_000,
    ).toISOString();
    query = query.gte("created_at", since);
  }
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as ActivityRow[];
  const visibleRows = rows.slice(0, PAGE_SIZE);
  const targetIds = [
    ...new Set(
      visibleRows
        .map((item) => item.target_user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const profileMap = new Map<string, ProfileRow>();
  if (targetIds.length) {
    const { data: profiles } = await client
      .from("profiles")
      .select(
        "id,display_name,age,profession,city,state,avatar_url,photos,gender,is_discoverable",
      )
      .in("id", targetIds);
    for (const profile of (profiles ?? []) as ProfileRow[])
      profileMap.set(profile.id, profile);
  }
  const items: ActivityItem[] = visibleRows.map((row) => {
    const profile = row.target_user_id
      ? profileMap.get(row.target_user_id)
      : undefined;
    const metadata =
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {};
    return {
      id: row.id,
      type: row.activity_type,
      targetUserId: row.target_user_id,
      createdAt: row.created_at,
      metadata,
      target: profile
        ? {
            name: profile.display_name ?? "Bandhanaa member",
            age: profile.age,
            profession: profile.profession,
            city: profile.city,
            state: profile.state,
            avatar: resolveProfilePhoto(profile),
            accessible: profile.is_discoverable !== false,
          }
        : typeof metadata.target_name === "string"
          ? {
              name: metadata.target_name,
              age:
                typeof metadata.target_age === "number"
                  ? metadata.target_age
                  : null,
              profession:
                typeof metadata.target_profession === "string"
                  ? metadata.target_profession
                  : null,
              city:
                typeof metadata.target_city === "string"
                  ? metadata.target_city
                  : null,
              state:
                typeof metadata.target_state === "string"
                  ? metadata.target_state
                  : null,
              avatar:
                typeof metadata.target_avatar === "string"
                  ? metadata.target_avatar
                  : "",
              accessible: false,
            }
          : null,
    };
  });
  return { items, hasMore: rows.length > PAGE_SIZE };
}
