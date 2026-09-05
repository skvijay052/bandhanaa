import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default function Page() {
  return (
    <AuthLayout mode="login">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
