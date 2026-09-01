import type { Metadata } from "next";
import { RecoveryShell } from "@/components/auth/RecoveryShell";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <RecoveryShell>
      <VerifyEmailForm />
    </RecoveryShell>
  );
}
