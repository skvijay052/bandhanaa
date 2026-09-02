import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MatchesClient } from "@/components/matches/MatchesClient";
import { createClient } from "@/lib/supabase/server";
import type { MatchProfile, MatchTab } from "@/data/matches";
import { resolveProfilePhoto } from "@/lib/profile-photo";

export const metadata: Metadata = { title: "Matches" };

type RecommendationRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  age: number | null;
  profession: string | null;
  bio: string | null;
  city: string | null;
  match_score: number | null;
};
type ProfilePhotoRow = {
  id: string;
  avatar_url: string | null;
  photos: string[] | null;
  gender: string | null;
  company: string | null;
  height: string | null;
  religion: string | null;
  mother_tongue: string | null;
  education: string | null;
  lifestyle: Record<string, string> | null;
  family: Record<string, string> | null;
  last_seen_at: string | null;
};

function splitLocation(location: string | null) {
  const [city = "Bengaluru", state = "Karnataka"] = (location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return { city, state };
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const requestedTab = (await searchParams).tab;
  const initialTab: MatchTab =
    requestedTab === "shortlisted" ||
    requestedTab === "sent" ||
    requestedTab === "received"
      ? requestedTab
      : "all";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/matches");

  const [recommendations, interactions, shortlistResult] = await Promise.all([
    supabase.rpc("get_recommended_profiles", { result_limit: 24 }),
    supabase
      .from("profile_likes")
      .select("liker_id, liked_id")
      .or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`),
    supabase
      .from("profile_shortlists")
      .select("profile_id")
      .eq("user_id", user.id),
  ]);

  if (recommendations.error) {
    console.error("Unable to load matches:", recommendations.error.message);
  }

  const recommendationRows = (recommendations.data ??
    []) as RecommendationRow[];
  const recommendationIds = recommendationRows.map((profile) => profile.id);
  const photoResult = recommendationIds.length
    ? await supabase
        .from("profiles")
        .select(
          "id, avatar_url, photos, gender, company, height, religion, mother_tongue, education, lifestyle, family, last_seen_at",
        )
        .in("id", recommendationIds)
    : { data: [] as ProfilePhotoRow[], error: null };
  if (photoResult.error)
    console.error("Unable to load match photos:", photoResult.error.message);
  const photosByProfile = new Map(
    ((photoResult.data ?? []) as ProfilePhotoRow[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  const profiles: MatchProfile[] = recommendationRows.map((profile) => {
    const location = splitLocation(profile.city);
    const details = photosByProfile.get(profile.id);
    return {
      id: profile.id,
      name: profile.display_name ?? "Bandhanaa Member",
      age: profile.age ?? 26,
      city: location.city,
      state: location.state,
      occupation: profile.profession ?? "Professional",
      company: details?.company ?? undefined,
      about: profile.bio ?? "",
      height: details?.height ?? "Not added",
      religion: details?.religion ?? "Not added",
      language: details?.mother_tongue ?? "Not added",
      compatibility: profile.match_score ?? 85,
      verified: true,
      image: resolveProfilePhoto(details ?? profile),
      photoCount: Math.max(
        details?.photos?.length ?? 0,
        details?.avatar_url ? 1 : 0,
      ),
      education: details?.education ?? "Not added",
      lifestyle:
        details?.lifestyle && Object.keys(details.lifestyle).length
          ? "Lifestyle"
          : "Lifestyle",
      familyValues:
        details?.family && Object.keys(details.family).length
          ? "Family Values"
          : "Family Values",
      online: Boolean(
        details?.last_seen_at &&
        Date.now() - new Date(details.last_seen_at).getTime() < 120_000,
      ),
    };
  });

  const rows = interactions.data ?? [];
  const sentIds = rows
    .filter((row) => row.liker_id === user.id)
    .map((row) => row.liked_id);
  const receivedIds = rows
    .filter((row) => row.liked_id === user.id)
    .map((row) => row.liker_id);
  return (
    <MatchesClient
      profiles={profiles}
      initialShortlisted={
        shortlistResult.data?.map((item) => item.profile_id) ?? []
      }
      sentIds={sentIds}
      receivedIds={receivedIds}
      initialTab={initialTab}
    />
  );
}
