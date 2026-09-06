export type ProfilePhotoSource = {
  avatar_url?: string | null;
  photos?: string[] | null;
  gender?: string | null;
};

export const MALE_PROFILE_PHOTO_FALLBACK = "/profile-male-circle-default.png";
export const FEMALE_PROFILE_PHOTO_FALLBACK = "/profile-female-circle-default.png";
export const PROFILE_PHOTO_FALLBACK = MALE_PROFILE_PHOTO_FALLBACK;
export const MALE_DISCOVER_PHOTO_FALLBACK = "/discover-male-portrait-default.png";
export const FEMALE_DISCOVER_PHOTO_FALLBACK = "/discover-female-portrait-default.png";

export function genderProfilePhoto(gender?: string | null) {
  const value = gender?.trim().toLowerCase();
  return value === "woman" || value === "female" || value === "girl"
    ? FEMALE_PROFILE_PHOTO_FALLBACK
    : MALE_PROFILE_PHOTO_FALLBACK;
}

export function genderDiscoverPhoto(gender?: string | null) {
  const value = gender?.trim().toLowerCase();
  return value === "woman" || value === "female" || value === "girl"
    ? FEMALE_DISCOVER_PHOTO_FALLBACK
    : MALE_DISCOVER_PHOTO_FALLBACK;
}

export function resolveProfilePhoto(
  profile?: ProfilePhotoSource | null,
  fallback?: string,
) {
  const avatar = profile?.avatar_url?.trim();
  if (avatar) return avatar;
  const uploaded = profile?.photos?.find((photo) => photo?.trim())?.trim();
  return uploaded || fallback?.trim() || genderProfilePhoto(profile?.gender);
}
