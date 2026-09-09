import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const publicRoutes = [
  {
    path: "/",
    lastModified: "2026-09-09T05:40:33.000Z",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/discover-matrimony",
    lastModified: "2026-09-09T10:24:00.000Z",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/how-it-works",
    lastModified: "2026-09-09T09:20:00.000Z",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/safety",
    lastModified: "2026-09-09T10:24:00.000Z",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/about",
    lastModified: "2026-09-09T09:20:00.000Z",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/privacy",
    lastModified: "2026-09-08T13:45:40.000Z",
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    path: "/terms",
    lastModified: "2026-09-08T13:46:17.000Z",
    changeFrequency: "monthly",
    priority: 0.4,
  },
] as const;

function absoluteUrl(path: string) {
  const baseUrl = getSiteUrl();
  return new URL(path, `${baseUrl}/`).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
