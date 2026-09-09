import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bandhanaa",
    short_name: "Bandhanaa",
    description: "Modern matrimony for meaningful relationships",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon.png",
        type: "image/png",
      },
    ],
  };
}
