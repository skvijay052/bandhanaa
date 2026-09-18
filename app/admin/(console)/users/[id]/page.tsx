import { MemberDetail } from "@/components/admin/MemberDetail";
import type { SearchParams } from "@/lib/admin/types";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  return <MemberDetail id={(await params).id} params={await searchParams} />;
}
