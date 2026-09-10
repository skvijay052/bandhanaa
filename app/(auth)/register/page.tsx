import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bandhanaa.netlify.app"
).replace(/\/+$/, "");
const socialImage = `${siteUrl}/bandhanaa-logo.png`;

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Bandhanaa and create your profile for meaningful marriage connections.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Join me on Bandhanaa",
    description:
      "Create your Bandhanaa profile and discover meaningful marriage connections.",
    type: "website",
    images: [
      {
        url: socialImage,
        alt: "Bandhanaa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join me on Bandhanaa",
    description:
      "Create your Bandhanaa profile and discover meaningful marriage connections.",
    images: [socialImage],
  },
};

export default function RegisterPage() {
  return (
    <AuthLayout mode="register">
      <RegisterForm />
    </AuthLayout>
  );
}
