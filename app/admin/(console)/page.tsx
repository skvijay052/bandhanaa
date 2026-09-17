import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { adminHome } from "@/lib/admin/permissions";
import { Overview } from "@/components/admin/Overview";
import type { SearchParams } from "@/lib/admin/types";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect(adminHome(admin.role));
  return <Overview params={await searchParams} />;
}
