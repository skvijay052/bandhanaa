export const referralCookieName = "bandhanaa-referral";
export const referralMaxAge = 60 * 60 * 24 * 30;

export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return /^BND[A-F0-9]{32}$/.test(code) ? code : null;
}

// This cookie is an attribution hint, never proof of ownership or reward eligibility.
export function rememberReferral() {
  const fromUrl = normalizeReferralCode(
    new URLSearchParams(window.location.search).get("ref"),
  );
  const previous = readReferral();
  if (fromUrl && !previous) {
    document.cookie = `${referralCookieName}=${fromUrl}; Path=/; Max-Age=${referralMaxAge}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  }
  return previous ?? fromUrl;
}

export function readReferral(): string | null {
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${referralCookieName}=`))
    ?.split("=")[1];
  return normalizeReferralCode(value);
}

export function clearReferral() {
  document.cookie = `${referralCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function invitationText(referralUrl: string) {
  return `Join me on Bandhanaa — a matrimony platform for meaningful marriage connections. Create your profile here: ${referralUrl}`;
}

export function referralAfterProfile(displayedCount: number) {
  return displayedCount > 0 && displayedCount % 10 === 0;
}
