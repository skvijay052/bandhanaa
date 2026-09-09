import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const privatePaths = [
  "/api/",
  "/auth/",
  "/dashboard/",
  "/discover/",
  "/matches/",
  "/interests/",
  "/connections/",
  "/messages/",
  "/requests/",
  "/notifications/",
  "/my-profile/",
  "/profile/",
  "/settings/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privatePaths,
    },
    sitemap: new URL("/sitemap.xml", `${siteUrl}/`).toString(),
    host: siteUrl,
  };
}
