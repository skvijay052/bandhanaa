import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditProfileClient } from "@/components/profile/EditProfileClient";
import {
  familyLabels,
  horoscopeLabels,
  lifestyleLabels,
  preferenceLabels,
  type EditProfileData,
} from "@/data/edit-profile";
import { profileDefaults, type DetailItem } from "@/data/my-profile";
import { createClient } from "@/lib/supabase/server";
import { resolveProfilePhoto } from "@/lib/profile-photo";
export const metadata: Metadata = { title: "Edit Profile" };
function items(value: unknown, labels: string[], fallback: DetailItem[] = []) {
  const source = Array.isArray(value) ? value : fallback;
  const valid = source.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return typeof row.label === "string" && typeof row.value === "string"
      ? [{ label: row.label, value: row.value }]
      : [];
  });
  const map = new Map(valid.map((item) => [item.label, item.value]));
  const legacyLocation = (label: string) => {
    const oldLabel = label.startsWith("Family ")
      ? "Family Location"
      : label.startsWith("Preferred ")
        ? "Location"
        : label.startsWith("Birth ")
          ? "Birth Place"
          : "";
    const oldValue = oldLabel ? (map.get(oldLabel) ?? "") : "";
    if (label.endsWith(" Country") && oldValue) return "India";
    if (label.endsWith(" State")) return oldValue.split(",")[1]?.trim() ?? "";
    if (label.endsWith(" City")) return oldValue.split(",")[0]?.trim() ?? "";
    return "";
  };
  return labels.map((label) => ({
    label,
    value: map.get(label) ?? legacyLocation(label),
  }));
}
function visibility(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      "Profile Photo": true,
      "Basic Details": true,
      Lifestyle: true,
      "Family Details": true,
      Horoscope: false,
      "Contact Information": false,
    };
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      Boolean(val),
    ]),
  );
}
export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/edit-profile");
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, gender, birth_date, age, weight, profession, company, city, state, country, religion, education, height, mother_tongue, marital_status, bio, photos, lifestyle, family, partner_preferences, horoscope, profile_visibility, visibility_details, profile_completion, registration_status",
    )
    .eq("id", user.id)
    .single();
  if (error) console.error("Unable to load profile editor:", error.message);
  const row = (data ?? {}) as Record<string, unknown>;
  const metadata = user.user_metadata ?? {};
  const avatar = resolveProfilePhoto(row, String(metadata.avatar_url ?? ""));
  const initial: EditProfileData = {
    id: user.id,
    registrationStatus: ["draft", "awaiting_verification", "active"].includes(
      String(row.registration_status),
    )
      ? (String(
          row.registration_status,
        ) as EditProfileData["registrationStatus"])
      : "draft",
    completion: Number(row.profile_completion ?? 0),
    displayName: String(
      row.display_name ?? metadata.display_name ?? metadata.full_name ?? "",
    ),
    birthDate: String(row.birth_date ?? ""),
    gender: String(row.gender ?? metadata.gender ?? ""),
    maritalStatus: String(row.marital_status ?? profileDefaults.maritalStatus),
    religion: String(row.religion ?? profileDefaults.religion),
    motherTongue: String(row.mother_tongue ?? profileDefaults.motherTongue),
    height: String(row.height ?? profileDefaults.height),
    weight: String(row.weight ?? ""),
    city: String(row.city ?? "")
      .split(",")[0]
      .trim(),
    state: String(
      row.state ?? String(row.city ?? "").split(",")[1] ?? "",
    ).trim(),
    country: String(row.country ?? "India"),
    education: String(row.education ?? profileDefaults.education),
    profession: String(row.profession ?? ""),
    company: String(row.company ?? profileDefaults.company),
    about: String(row.bio ?? profileDefaults.about),
    photos: Array.isArray(row.photos)
      ? row.photos.filter((photo): photo is string => typeof photo === "string")
      : [avatar],
    lifestyle: items(row.lifestyle, lifestyleLabels, profileDefaults.lifestyle),
    family: items(row.family, familyLabels, profileDefaults.family),
    preferences: items(
      row.partner_preferences,
      preferenceLabels,
      profileDefaults.preferences,
    ),
    horoscope: items(row.horoscope, horoscopeLabels),
    visibility: ["everyone", "connections", "private"].includes(
      String(row.profile_visibility),
    )
      ? (String(row.profile_visibility) as EditProfileData["visibility"])
      : "everyone",
    visibilityDetails: visibility(row.visibility_details),
    avatar,
  };
  return <EditProfileClient initial={initial} />;
}
