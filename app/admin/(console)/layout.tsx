import { requireAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
