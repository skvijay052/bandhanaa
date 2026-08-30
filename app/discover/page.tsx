import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  DiscoverClient,
  type DiscoverProfile,
} from "@/components/discover/DiscoverClient";
import { createClient } from "@/lib/supabase/server";
import { genderDiscoverPhoto, resolveProfilePhoto } from "@/lib/profile-photo";
import { getRelationshipState } from "@/data/profile";

export const metadata: Metadata = { title: "Discover" };

type RecommendationRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  age: number | null;
  profession: string | null;
  city: string | null;
  bio: string | null;
  match_score: number | null;
};

type ProfilePhotoRow = {
  id: string;
  avatar_url: string | null;
  photos: string[] | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  marital_status: string | null;
  height: string | null;
  religion: string | null;
  mother_tongue: string | null;
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/discover");

  const [recommendations, savedShortlists, relationships] = await Promise.all([
    supabase.rpc("get_recommended_profiles", { result_limit: 24 }),
    supabase.from("profile_shortlists").select("profile_id").eq("user_id", user.id),
    supabase.from("profile_likes").select("liker_id,liked_id,status").or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`),
  ]);

  if (recommendations.error) {
    console.error(
      "Unable to load recommendations:",
      recommendations.error.message,
    );
  }

  const recommendationRows = (recommendations.data ?? []) as RecommendationRow[];
  const recommendationIds = recommendationRows.map((profile) => profile.id);
  const photoResult = recommendationIds.length
    ? await supabase
        .from("profiles")
        .select("id, avatar_url, photos, gender, city, state, country, marital_status, height, religion, mother_tongue")
        .in("id", recommendationIds)
    : { data: [], error: null };

  if (photoResult.error) {
    console.error("Unable to load discover photos:", photoResult.error.message);
  }

  const photosByProfile = new Map(
    ((photoResult.data ?? []) as ProfilePhotoRow[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  const profiles: DiscoverProfile[] = recommendationRows.map((profile) => {
    const storedPhotos = photosByProfile.get(profile.id);
    const relationship = relationships.data?.find((item) => item.liker_id === profile.id || item.liked_id === profile.id);
    const location = [storedPhotos?.city ?? profile.city, storedPhotos?.state, storedPhotos?.country].filter(Boolean).join(", ");
    return {
      id: profile.id,
      name: profile.display_name ?? "Member",
      age: profile.age ?? 25,
      job: profile.profession ?? "Professional",
      city: location || "India",
      maritalStatus: storedPhotos?.marital_status ?? "Not added",
      height: storedPhotos?.height ?? "Not added",
      religion: storedPhotos?.religion ?? "Not added",
      motherTongue: storedPhotos?.mother_tongue ?? "Not added",
      bio: profile.bio ?? "Looking for a meaningful connection.",
      image: resolveProfilePhoto(
        storedPhotos ?? profile,
        genderDiscoverPhoto(storedPhotos?.gender),
      ),
      match: profile.match_score ?? 85,
      relationship: getRelationshipState(relationship, user.id),
    };
  });

  const firstName = String(
    user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.user_metadata?.display_name ??
      "Member",
  )
    .trim()
    .split(/\s+/)[0];
  const avatarUrl = String(
    user.user_metadata?.avatar_url ?? "/profiles/rohan.png",
  );

  return (
    <DiscoverClient
      firstName={firstName}
      avatarUrl={avatarUrl}
      profiles={profiles}
      initialShortlisted={savedShortlists.data?.map((item) => item.profile_id) ?? []}
    />
  );
}
