import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RequestsClient } from "@/components/requests/RequestsClient";
import type { InterestProfile } from "@/data/interests";
import type { RequestTab } from "@/components/requests/RequestsClient";
import { resolveProfilePhoto } from "@/lib/profile-photo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Requests" };

type LikeRow = {
  liker_id: string;
  liked_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};
type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  gender: string | null;
  age: number | null;
  profession: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  height: string | null;
  religion: string | null;
  mother_tongue: string | null;
  last_seen_at: string | null;
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/requests");

  const [{ data: relationships, error }, { data: viewer }] = await Promise.all([
    supabase
      .from("profile_likes")
      .select("liker_id,liked_id,status,created_at")
      .or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id,display_name,avatar_url,photos,gender,profession")
      .eq("id", user.id)
      .maybeSingle(),
  ]);
  if (error) console.error("Unable to load requests:", error.message);
  const rows = (relationships ?? []) as LikeRow[];
  const profileIds = [
    ...new Set(
      rows.map((row) =>
        row.liker_id === user.id ? row.liked_id : row.liker_id,
      ),
    ),
  ];
  const { data: profileRows } = profileIds.length
    ? await supabase
        .from("profiles")
        .select(
          "id,display_name,avatar_url,photos,gender,age,profession,city,state,country,height,religion,mother_tongue,last_seen_at",
        )
        .in("id", profileIds)
    : { data: [] as ProfileRow[] };
  const byId = new Map(
    ((profileRows ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const toProfile = (row: LikeRow): InterestProfile => {
    const profileId = row.liker_id === user.id ? row.liked_id : row.liker_id;
    const profile = byId.get(profileId);
    return {
      id: `${row.liker_id}:${row.liked_id}`,
      profileId,
      name: profile?.display_name ?? "Bandhanaa Member",
      age: profile?.age ?? 25,
      occupation: profile?.profession ?? "Professional",
      location:
        [profile?.city, profile?.state, profile?.country]
          .filter(Boolean)
          .join(", ") || "India",
      status: row.status,
      verified: true,
      image: resolveProfilePhoto(profile),
      compatibility: 85,
      height: profile?.height ?? "Not added",
      religion: profile?.religion ?? "Not added",
      motherTongue: profile?.mother_tongue ?? "Not added",
      online: Boolean(
        profile?.last_seen_at &&
        Date.now() - new Date(profile.last_seen_at).getTime() < 120000,
      ),
      time: relativeTime(row.created_at),
    };
  };
  const received = rows
    .filter((row) => row.status === "pending" && row.liked_id === user.id)
    .map(toProfile);
  const sent = rows
    .filter((row) => row.status === "pending" && row.liker_id === user.id)
    .map(toProfile);
  const following = rows
    .filter((row) => row.status === "accepted")
    .map(toProfile);
  const requested = (await searchParams).tab;
  const initialTab: RequestTab =
    requested === "sent" || requested === "following" ? requested : "received";
  return (
    <RequestsClient
      currentUserId={user.id}
      initialReceived={received}
      initialSent={sent}
      initialFollowing={following}
      initialTab={initialTab}
      viewerName={viewer?.display_name ?? "Member"}
      avatarUrl={resolveProfilePhoto(
        viewer,
        String(user.user_metadata?.avatar_url ?? ""),
      )}
    />
  );
}

function relativeTime(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.floor(elapsed / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
}
