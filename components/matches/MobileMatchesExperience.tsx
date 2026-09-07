"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  Eye,
  GraduationCap,
  Heart,
  MapPin,
  Ruler,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
import { ProfileImage } from "@/components/ui/ProfileImage";
import type { MatchProfile } from "@/data/matches";

export function MobileMatchesExperience({
  profiles,
  shortlisted,
  sentIds,
  followingIds,
  onShortlist,
  onInterest,
}: {
  profiles: MatchProfile[];
  shortlisted: string[];
  sentIds: string[];
  followingIds: string[];
  onShortlist: (profile: MatchProfile) => void;
  onInterest: (profile: MatchProfile) => void;
}) {
  const orderedProfiles = [...profiles].sort(
    (a, b) => b.compatibility - a.compatibility,
  );

  return (
    <div className="mobile-half-type mobile-matches-type relative z-10 px-4 md:hidden">
      <header className="sticky top-0 z-[90] -mx-4 grid grid-cols-[40px_1fr_40px] items-center border-b border-black/5 bg-[#f8fafc]/95 px-4 py-3 backdrop-blur-xl">
        <Link href="/discover" aria-label="Bandhanaa">
          <Brand compact />
        </Link>
        <span aria-hidden="true" />
        <div className="justify-self-end">
          <Link
            href="/matches?tab=shortlisted"
            aria-label="Shortlisted profiles"
            className="grid size-9 place-items-center rounded-[13px] bg-white p-1 shadow-[0_8px_24px_rgba(44,33,80,.1)]"
          >
            <Heart size={17} />
          </Link>
        </div>
      </header>

      {orderedProfiles.length ? (
        <div className="-mx-4 h-[calc(100dvh-136px-env(safe-area-inset-bottom))] snap-y snap-mandatory overflow-y-auto overscroll-contain px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {orderedProfiles.map((profile, index) => (
            <div
              key={profile.id}
              className="flex min-h-full snap-start snap-always items-start py-2"
            >
              <MobileMatchCard
                profile={profile}
                liked={shortlisted.includes(profile.id)}
                sent={sentIds.includes(profile.id)}
                following={followingIds.includes(profile.id)}
                priority={index < 2}
                onShortlist={() => onShortlist(profile)}
                onInterest={() => onInterest(profile)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[52dvh] place-items-center text-center">
          <div>
            <h2 className="text-[18px] font-semibold text-[#0f1419]">
              No matches found
            </h2>
            <p className="mt-2 text-[13px] text-[#687184]">
              New matching profiles will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMatchCard({
  profile,
  liked,
  sent,
  following,
  priority,
  onShortlist,
  onInterest,
}: {
  profile: MatchProfile;
  liked: boolean;
  sent: boolean;
  following: boolean;
  priority: boolean;
  onShortlist: () => void;
  onInterest: () => void;
}) {
  return (
    <article className="w-full overflow-hidden rounded-[20px] border border-[#eceaf0] bg-white shadow-[0_10px_30px_rgba(42,35,70,.09)]">
      <div className="relative h-[clamp(235px,44dvh,390px)] overflow-hidden bg-[#e8e9ec]">
        <Link href={`/profile/${profile.id}`} className="absolute inset-0">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            priority={priority}
            sizes="calc(100vw - 32px)"
            className="object-cover"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5" />
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <i
            className={`size-2 rounded-full ${profile.online ? "bg-[#31df7d]" : "bg-white"}`}
          />
          {profile.online ? "Online" : "Offline"}
        </span>
        <button
          type="button"
          onClick={onShortlist}
          aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-[12px] bg-white text-[#8b3de8] shadow-[0_5px_18px_rgba(0,0,0,.14)]"
        >
          <Bookmark size={18} fill={liked ? "currentColor" : "none"} />
        </button>
        <div className="absolute inset-x-5 bottom-4 text-white">
          <Link href={`/profile/${profile.id}`} className="inline-flex">
            <h2 className="flex items-center gap-1.5 text-[18px] font-semibold tracking-[-.02em]">
              {profile.name}, {profile.age || "Age hidden"}
              {profile.verified ? (
                <BadgeCheck
                  size={16}
                  className="fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
                />
              ) : null}
            </h2>
          </Link>
          <p className="mt-1.5 truncate text-[12px]">{profile.occupation}</p>
          <p className="mt-1.5 flex items-center gap-1.5 truncate pr-16 text-[12px]">
            <MapPin size={14} className="shrink-0" fill="white" />
            {profile.city}, {profile.state}, India
          </p>
        </div>
        <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white">
          1/{Math.max(profile.photoCount, 1)}
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#eceaf0] border-b border-[#eceaf0] px-1 py-2.5">
        <MatchDetail
          icon={GraduationCap}
          label="Education"
          value={profile.education}
        />
        <MatchDetail
          icon={BriefcaseBusiness}
          label="Profession"
          value={profile.occupation}
        />
        <MatchDetail icon={Ruler} label="Height" value={profile.height} />
      </div>

      <p className="line-clamp-2 min-h-[40px] px-4 py-2.5 text-[12px] leading-5 text-[#687184]">
        {profile.about || "No description added yet."}
      </p>

      <div className="grid grid-cols-2 gap-2.5 border-t border-[#eceaf0] p-2.5">
        <Link
          href={`/profile/${profile.id}`}
          className="flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#8b3de8] px-2 text-[11px] font-semibold text-[#8b3de8]"
        >
          <Eye size={14} className="shrink-0" />
          <span className="truncate">View Profile</span>
        </Link>
        <button
          type="button"
          onClick={onInterest}
          disabled={sent || following}
          className="flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#a34cef] to-[#f45ca9] px-2 text-[11px] font-semibold text-white disabled:opacity-80"
        >
          <Heart size={14} className="shrink-0" />
          <span className="truncate">
            {following ? "Following" : sent ? "Requested" : "Send Request"}
          </span>
        </button>
      </div>
    </article>
  );
}

function MatchDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 px-1.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f6efff] text-[#7651a8]">
        <Icon size={13} />
      </span>
      <span className="min-w-0">
        <small className="block truncate text-[9px] text-[#8a91a1]">
          {label}
        </small>
        <strong className="mt-0.5 block truncate text-[10px] font-medium text-[#252936]">
          {value}
        </strong>
      </span>
    </div>
  );
}
