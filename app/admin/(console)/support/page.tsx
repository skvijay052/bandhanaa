import { SectionPage } from "@/components/admin/SectionPage";
import type { SearchParams } from "@/lib/admin/types";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <SectionPage section="support" params={await searchParams} />;
}
