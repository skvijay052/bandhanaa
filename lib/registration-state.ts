import type { User } from "@supabase/supabase-js";

export type RegistrationProfileState = {
  registration_status: "draft" | "awaiting_verification" | "active";
  onboarding_completed: boolean;
  is_verified: boolean;
};

export function registrationDestination(
  user: User,
  profile: RegistrationProfileState | null,
) {
  if (!user.email_confirmed_at) return "/verify-email";
  if (!profile?.onboarding_completed) return "/settings/edit-profile";
  if (profile.registration_status !== "active" || !profile.is_verified)
    return "/settings/edit-profile";
  return "/discover";
}

export function isActiveRegistration(profile: RegistrationProfileState | null) {
  return Boolean(
    profile?.registration_status === "active" &&
    profile.is_verified &&
    profile.onboarding_completed,
  );
}
