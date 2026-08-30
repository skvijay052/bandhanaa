import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { RecoveryShell } from "@/components/auth/RecoveryShell";
export const metadata: Metadata = { title: "Forgot Password" };
export default function Page() {
  return (
    <RecoveryShell>
      <ForgotPasswordForm />
    </RecoveryShell>
  );
}
