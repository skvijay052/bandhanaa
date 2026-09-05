import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthLayout mode="login">
      <LoginForm oauthError={error === "google_auth_failed"} />
    </AuthLayout>
  );
}
