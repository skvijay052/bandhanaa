let warnedAboutMissingSiteUrl = false;

function normalizeSiteUrl(value: string) {
  const url = value.trim();
  if (!url) return "";
  return (
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`
  ).replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const deploymentUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

  if (
    process.env.NODE_ENV === "production" &&
    !configuredUrl &&
    !warnedAboutMissingSiteUrl
  ) {
    warnedAboutMissingSiteUrl = true;
    console.warn(
      "NEXT_PUBLIC_SITE_URL is not configured. Password reset links will use a deployment or browser origin fallback.",
    );
  }

  const environmentUrl = normalizeSiteUrl(configuredUrl || deploymentUrl || "");
  if (environmentUrl) return environmentUrl;

  if (typeof window !== "undefined") {
    return normalizeSiteUrl(window.location.origin);
  }

  return "http://localhost:3000";
}
