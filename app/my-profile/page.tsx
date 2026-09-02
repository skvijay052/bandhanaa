import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyProfileClient } from "@/components/profile/MyProfileClient";
import { profileDefaults, type MyProfileData } from "@/data/my-profile";
import { createClient } from "@/lib/supabase/server";
import { resolveProfilePhoto } from "@/lib/profile-photo";
import { generatedHoroscopeItems } from "@/lib/horoscope";
import {
  familyLabels,
  horoscopeLabels,
  lifestyleLabels,
  preferenceLabels,
} from "@/data/edit-profile";
export const metadata: Metadata = { title: "My Profile" };
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
  religion: string | null;
  education: string | null;
  height: string | null;
  mother_tongue: string | null;
  marital_status: string | null;
  bio: string | null;
  photos: string[] | null;
  lifestyle: unknown;
  family: unknown;
  partner_preferences: unknown;
  horoscope: unknown;
  profile_visibility: "everyone" | "connections" | "private" | null;
  profile_completion: number | null;
  compatibility: number | null;
  is_discoverable: boolean | null;
  created_at: string;
};
function detailItems(
  value: unknown,
  labels: string[],
  fallback: MyProfileData["lifestyle"] = [],
) {
  const source = Array.isArray(value) ? value : fallback;
  const items = source.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    return typeof record.label === "string" && typeof record.value === "string"
      ? [{ label: record.label, value: record.value }]
      : [];
  });
  const values = new Map(items.map((item) => [item.label, item.value]));
  return labels.map((label) => ({
    label,
    value: values.get(label)?.trim() || "Not added",
  }));
}
export default async function MyProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-profile");
  const [{ data, error }, { count: acceptedInterestCount, error: acceptedInterestError }, sentResult, shortlistResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, display_name, avatar_url, age, birth_date, profession, company, city, state, country, gender, weight, religion, education, height, mother_tongue, marital_status, bio, photos, lifestyle, family, partner_preferences, horoscope, profile_visibility, profile_completion, compatibility, is_discoverable, created_at",
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("profile_likes")
      .select("liker_id", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`),
    supabase.from("profile_likes").select("liked_id", { count: "exact", head: true }).eq("liker_id", user.id),
    supabase.from("profile_shortlists").select("profile_id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  if (error) console.error("Unable to load your profile:", error.message);
  if (acceptedInterestError) console.error("Unable to load accepted interests:", acceptedInterestError.message);
  const row = data as ProfileRow | null;
  const metadata = user.user_metadata ?? {};
  const avatar = resolveProfilePhoto(row, String(metadata.avatar_url ?? ""));
  const photos = row?.photos?.filter(Boolean).slice(0, 6) ?? [];
  const memberSince = row?.created_at
    ? new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : profileDefaults.memberSince;
  const profile: MyProfileData = {
    id: user.id,
    name:
      row?.display_name ??
      String(metadata.display_name ?? metadata.full_name ?? "Bandhanaa Member"),
    age: row?.age ?? 0,
    birthDate: row?.birth_date ? new Date(`${row.birth_date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not added",
    profession: row?.profession ?? "Not added",
    company: row?.company ?? "Not added",
    city: row?.city ?? "Not added",
    state: row?.state ?? "",
    country: row?.country ?? "",
    gender: row?.gender ?? "Not added",
    weight: row?.weight ?? "Not added",
    religion: row?.religion ?? "Not added",
    education: row?.education ?? "Not added",
    height: row?.height ?? "Not added",
    motherTongue: row?.mother_tongue ?? "Not added",
    maritalStatus: row?.marital_status ?? "Not added",
    completion: row?.profile_completion ?? 0,
    verified: Boolean(user.email_confirmed_at),
    compatibility: row?.compatibility ?? 0,
    discoverable: row?.is_discoverable ?? false,
    about: row?.bio ?? "No description added yet.",
    avatar,
    photos,
    memberSince,
    visibility: row?.profile_visibility ?? "everyone",
    lifestyle: detailItems(row?.lifestyle, lifestyleLabels),
    family: detailItems(row?.family, familyLabels),
    preferences: detailItems(
      row?.partner_preferences,
      preferenceLabels,
    ),
    horoscope: generatedHoroscopeItems(
      row?.birth_date,
      detailItems(row?.horoscope, horoscopeLabels),
    ),
  };
  return <MyProfileClient profile={profile} acceptedInterestCount={acceptedInterestCount ?? 0} sentInterestCount={sentResult.count ?? 0} shortlistedCount={shortlistResult.count ?? 0} />;
}
