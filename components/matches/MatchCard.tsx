import Link from "next/link";
import { BadgeCheck, Heart, MapPin } from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import type { MatchProfile } from "@/data/matches";

export function MatchCard({ profile, shortlisted, onShortlist, priority = false }: {
  profile: MatchProfile;
  shortlisted: boolean;
  onShortlist: () => void;
  priority?: boolean;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#dfe5e9] bg-white transition-shadow hover:shadow-[0_8px_24px_rgba(15,20,25,.08)]">
      <div className="relative aspect-[1.03/1] overflow-hidden bg-[#eff3f4]">
        <Link href={`/profile/${profile.id}`} className="absolute inset-0">
          <ProfileImage src={profile.image} alt={`${profile.name}'s match profile`} fill priority={priority} sizes="(max-width:767px) 100vw, (max-width:1535px) 33vw, 25vw" className="object-cover" />
        </Link>
        <span className="absolute left-3 top-3 rounded-full bg-[#1d9bf0] px-3 py-1 text-[11px] font-semibold text-white">New</span>
        <button type="button" onClick={onShortlist} aria-label={`${shortlisted ? "Remove from" : "Add to"} shortlist`} className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/20 backdrop-blur-sm ${shortlisted ? "text-[#fb1c8d]" : "text-white"}`}>
          <Heart size={22} fill={shortlisted ? "currentColor" : "none"} strokeWidth={2} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full border border-[#7dd3a6] bg-[#e7f8ef] px-3 py-1 text-[12px] font-semibold text-[#197044]">{profile.compatibility}% Match</span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <Link href={`/profile/${profile.id}`} className="truncate text-[17px] font-semibold text-[#0f1419]">{profile.name}, {profile.age}</Link>
          {profile.verified ? <BadgeCheck size={17} className="shrink-0 fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white" aria-label="Verified" /> : null}
        </div>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{profile.occupation}{profile.company ? ` at ${profile.company}` : ""}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]"><MapPin size={14} />{profile.city}, {profile.state}</p>
        <p className="mt-2 text-[12px] text-[var(--text-secondary)]">{profile.height}<span className="mx-2">•</span>{profile.religion}<span className="mx-2">•</span>{profile.language}</p>

      </div>
    </article>
  );
}
