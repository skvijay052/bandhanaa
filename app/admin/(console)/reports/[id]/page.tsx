import { CaseDetail } from "@/components/admin/CaseDetail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CaseDetail section="reports" id={(await params).id} />;
}
