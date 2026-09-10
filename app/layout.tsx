import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { RouteProgressBar } from "@/components/layout/RouteProgressBar";
import { MobileRelationshipActionEnhancer } from "@/components/profile/MobileRelationshipActionEnhancer";
import { HomepageHeaderMount } from "@/components/home/HomepageHeaderMount";
import "./globals.css";
import "./mobile-overrides.css";
import "./messages-chat-reference.css";
import "./homepage-spacing.css";
import "./homepage-hero-title.css";
import "./brand-pink-theme.css";

export const metadata: Metadata = {
  title: { default: "Bandhanaa", template: "%s | Bandhanaa" },
  description: "Meaningful connections begin here.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <MobileRelationshipActionEnhancer />
        <HomepageHeaderMount />
        {children}
      </body>
    </html>
  );
}
