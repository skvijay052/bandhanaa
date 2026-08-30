import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { BadgeCheck, Heart, MapPin } from "lucide-react";
import type { DiscoverProfile } from "./types";
export function ProfileCard({
  profile,
  liked,
  onLike,
  onRelationshipAction,
}: {
  profile: DiscoverProfile;
  liked: boolean;
  onLike: () => void;
  onRelationshipAction: () => void;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#dfe5e9] bg-white transition-shadow hover:shadow-[0_8px_24px_rgba(15,20,25,.08)]">
      <div className="relative aspect-[.92/1] overflow-hidden bg-[#eff3f4]">
        <Link href={`/profile/${profile.id}`} className="absolute inset-0">
          <ProfileImage
            src={profile.image}
            alt={`${profile.name}'s profile`}
            fill
            sizes="(max-width:767px) 100vw, (max-width:1279px) 50vw, 25vw"
            className="object-cover"
          />
        </Link>
        <span className="absolute left-3 top-3 rounded-full bg-[#1d9bf0] px-3 py-1 text-[11px] font-semibold text-white">
          New
        </span>
        <button
          onClick={onLike}
          aria-label={`${liked ? "Remove from shortlist" : "Add to shortlist"} ${profile.name}`}
          className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/20 backdrop-blur-sm transition-colors ${liked ? "text-[#ff3040]" : "text-white"}`}
        >
          <Heart size={19} fill={liked ? "currentColor" : "none"} strokeWidth={2} />
        </button>
      </div>
      <div className="relative p-4">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/profile/${profile.id}`}
            className="truncate text-[17px] font-bold text-[#0f1419]"
          >
            {profile.name}
          </Link>
          <BadgeCheck
            size={15}
            className="shrink-0 fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
          />
        </div>
        <p className="mt-2 text-[13px] text-[var(--text-secondary)]">{profile.age}<span className="mx-2">•</span>{profile.job}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
          <MapPin size={12} />
          {profile.city}
        </p>
        <p className="mt-3 truncate text-[12px] text-[var(--text-secondary)]">{profile.height}<span className="mx-2">•</span>{profile.religion}<span className="mx-2">•</span>{profile.motherTongue}</p>
        <div className="mt-5 flex items-center justify-between gap-3"><p className="text-[13px] font-semibold text-[#1d9bf0]">{profile.match}% preferences</p><button type="button" onClick={onRelationshipAction} disabled={profile.relationship === "following" || profile.relationship === "outgoing_pending"} className={`h-9 rounded-xl px-5 text-[12px] font-semibold ${profile.relationship === "none" || profile.relationship === "incoming_pending" ? "bg-[#1d9bf0] text-white hover:bg-[#1689df]" : "border border-[#1d9bf0] bg-white text-[#1d9bf0]"}`}>{profile.relationship === "none" ? "Follow" : profile.relationship === "outgoing_pending" ? "Requested" : profile.relationship === "incoming_pending" ? "Accept Request" : "Following"}</button></div>
      </div>
    </article>
  );
}
