import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { RouteProgressBar } from "@/components/layout/RouteProgressBar";
import "./globals.css";
import "./mobile-overrides.css";

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
        {children}
      </body>
    </html>
  );
}
