import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { RecoveryShell } from "@/components/auth/RecoveryShell";
export const metadata: Metadata = {
  title: "Create New Password",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <RecoveryShell>
      <ResetPasswordForm />
    </RecoveryShell>
  );
}
