import { getSiteUrl } from "@/lib/site-url";

export const seoConfig = {
  siteName: "Bandhanaa",
  defaultTitle: "Bandhanaa | Modern Matrimony for Meaningful Relationships",
  defaultDescription: "Modern matrimony for meaningful relationships",
} as const;

export function getCanonicalUrl(path = "/"): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function getPageTitle(title?: string): string {
  if (!title) return seoConfig.defaultTitle;
  return `${title} | ${seoConfig.siteName}`;
}

export function getOpenGraphDefaults() {
  return {
    siteName: seoConfig.siteName,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: getCanonicalUrl("/"),
    type: "website" as const,
  };
}
