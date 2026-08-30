import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProfileDetailsClient } from "@/components/profile/ProfileDetailsClient";
import type {
  CompactProfile,
  ProfileDetail,
} from "@/data/profile";
import { getRelationshipState } from "@/data/profile";
import { createClient } from "@/lib/supabase/server";
import { resolveProfilePhoto } from "@/lib/profile-photo";
import { generatedHoroscopeItems } from "@/lib/horoscope";

export const metadata: Metadata = { title: "Profile Details" };

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  age: number | null;
  birth_date: string | null;
  profession: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  gender: string | null;
  weight: string | null;
  height: string | null;
  religion: string | null;
  education: string | null;
  mother_tongue: string | null;
  marital_status: string | null;
  bio: string | null;
  photos: string[] | null;
  lifestyle: unknown;
  family: unknown;
  partner_preferences: unknown;
  horoscope: unknown;
  compatibility: number | null;
  created_at: string;
};

function detailItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    return typeof record.label === "string" && typeof record.value === "string" && record.value.trim()
      ? [{ label: record.label, value: record.value }]
      : [];
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/profile/${id}`);
  if (id === user.id) redirect("/discover");

  const [profileResult, relationResult, recommendationsResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, age, birth_date, profession, company, city, state, country, gender, weight, height, religion, education, mother_tongue, marital_status, bio, photos, lifestyle, family, partner_preferences, horoscope, compatibility, created_at",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("profile_likes")
        .select("liker_id, liked_id, status")
        .or(
          `and(liker_id.eq.${user.id},liked_id.eq.${id}),and(liker_id.eq.${id},liked_id.eq.${user.id})`,
        )
        .limit(2),
      supabase.rpc("get_recommended_profiles", { result_limit: 50 }),
    ]);
  if (profileResult.error) {
    console.error(
      "Unable to load profile directly:",
      profileResult.error.message,
    );
  }
  const recommendedRows = (recommendationsResult.data ?? []) as ProfileRow[];
  const row =
    (profileResult.data as ProfileRow | null) ??
    recommendedRows.find((candidate) => candidate.id === id);
  if (!row) notFound();
  const photoIds = [...new Set([user.id, ...recommendedRows.map((candidate) => candidate.id)])];
  const { data: photoRows, error: photoError } = await supabase
    .from("profiles")
    .select("id, avatar_url, photos, gender")
    .in("id", photoIds);
  if (photoError) console.error("Unable to load profile photos:", photoError.message);
  const photoById = new Map((photoRows ?? []).map((photo) => [photo.id, photo]));
  const image = resolveProfilePhoto(row);
  const savedPhotos = row.photos?.filter(Boolean).slice(0, 6) ?? [];
  const photos = savedPhotos;
  const location = [row.city, row.state, row.country].filter(Boolean).join(", ");
  const profile: ProfileDetail = {
    id: row.id,
    name: row.display_name ?? "Bandhanaa Member",
    age: row.age ?? 0,
    birthDate: row.birth_date ? new Date(`${row.birth_date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not added",
    occupation: row.profession ?? "Not added",
    company: row.company ?? "",
    location: location || "Location not added",
    gender: row.gender ?? "Not added",
    weight: row.weight ?? "Not added",
    height: row.height ?? "Not added",
    religion: row.religion ?? "Not added",
    motherTongue: row.mother_tongue ?? "Not added",
    education: row.education ?? "Not added",
    maritalStatus: row.marital_status ?? "Not added",
    memberSince: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Not added",
    about:
      row.bio ?? "No description added yet.",
    quote: "",
    verified: true,
    online: false,
    image,
    photos,
    interests: [],
    lifestyle: detailItems(row.lifestyle),
    family: detailItems(row.family),
    preferences: detailItems(row.partner_preferences),
    horoscope: generatedHoroscopeItems(
      row.birth_date,
      detailItems(row.horoscope),
    ),
    compatibility: row.compatibility ?? 0,
  };
  const relationRows = (relationResult.data ?? []) as Array<{
    liker_id: string;
    liked_id: string;
    status: "pending" | "accepted" | "declined";
  }>;
  const relationRow =
    relationRows.find((item) => item.status === "accepted") ??
    relationRows.find(
      (item) => item.liked_id === user.id && item.status === "pending",
    ) ??
    relationRows.find(
      (item) => item.liker_id === user.id && item.status === "pending",
    );
  const relation = getRelationshipState(relationRow, user.id);
  const moreProfiles: CompactProfile[] = recommendedRows
    .filter((candidate) => candidate.id !== id)
    .slice(0, 3)
    .map((candidate, index) => ({
      id: candidate.id,
      name: candidate.display_name ?? "Member",
      age: candidate.age ?? 27,
      location: candidate.city ?? "Bengaluru",
      image: resolveProfilePhoto(photoById.get(candidate.id) ?? candidate),
      verified: true,
    }));
  const viewerName = String(
    user.user_metadata?.full_name ??
      user.user_metadata?.display_name ??
      user.user_metadata?.name ??
      "Member",
  );
  const avatarUrl = resolveProfilePhoto(photoById.get(user.id), String(user.user_metadata?.avatar_url ?? ""));
  return (
    <ProfileDetailsClient
      profile={profile}
      moreProfiles={moreProfiles}
      initialRelation={relation}
      currentUserId={user.id}
      viewerName={viewerName}
      avatarUrl={avatarUrl}
    />
  );
}
