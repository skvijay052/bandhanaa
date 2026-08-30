import {
  ChevronRight,
  Eye,
  Heart,
  Shield,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
const rows = [
  [Sparkles, "Lifestyle"],
  [UsersRound, "Family"],
  [Heart, "Partner Preferences"],
  [Shield, "Verification"],
] as const;
export function MobileProfileSections() {
  return (
    <section className="rounded-xl border border-[#eeeef2] bg-white px-4">
      {rows.map(([Icon, label]) => (
        <button
          key={label}
          className="flex h-[54px] w-full items-center border-b border-[#eeeef2] text-[10px] last:border-0"
        >
          <Icon size={15} className="mr-3 text-[#1d9bf0]" />
          {label}
          <span className="ml-auto text-[#1d9bf0]">View</span>
          <ChevronRight size={13} className="ml-1 text-[#1d9bf0]" />
        </button>
      ))}
    </section>
  );
}
export function MobileVisibility({ visibility }: { visibility: string }) {
  return (
    <section className="flex h-14 items-center rounded-xl border border-[#eeeef2] px-4 text-[9px]">
      <Eye size={15} className="mr-3 text-[#1d9bf0]" />
      <strong>Profile Visibility</strong>
      <span className="ml-auto capitalize text-[#596077]">{visibility}</span>
      <Link href="/settings/edit-profile?section=Profile%20Visibility" className="ml-5 border-l border-[#eeeef2] pl-5 text-[#1d9bf0]">
        Edit
      </Link>
    </section>
  );
}
