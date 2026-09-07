"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

type MobileMatchFilter = "best" | "new" | "compatible" | "nearby";

const NEW_MATCH_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const HIGH_COMPATIBILITY_SCORE = 90;

export function MobileMatchesExperience({
  profiles,
  shortlisted,
  sentIds,
  followingIds,
  viewerCity,
  onShortlist,
  onInterest,
}: {
  profiles: MatchProfile[];
  shortlisted: string[];
  sentIds: string[];
  followingIds: string[];
  viewerCity: string;
  onShortlist: (profile: MatchProfile) => void;
  onInterest: (profile: MatchProfile) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<MobileMatchFilter>("best");

  const filteredProfiles = useMemo(() => {
    const byCompatibility = (items: MatchProfile[]) =>
      [...items].sort((a, b) => b.compatibility - a.compatibility);

    if (activeFilter === "new") {
      const cutoff = Date.now() - NEW_MATCH_WINDOW_MS;
      return profiles
        .filter((profile) => {
          if (!profile.createdAt) return false;
          const createdAt = new Date(profile.createdAt).getTime();
          return Number.isFinite(createdAt) && createdAt >= cutoff;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
    }

    if (activeFilter === "compatible") {
      return byCompatibility(
        profiles.filter(
          (profile) => profile.compatibility >= HIGH_COMPATIBILITY_SCORE,
        ),
      );
    }

    if (activeFilter === "nearby") {
      const city = normalizeCity(viewerCity);
      if (!city) return [];
      return byCompatibility(
        profiles.filter((profile) => normalizeCity(profile.city) === city),
      );
    }

    return byCompatibility(profiles);
  }, [activeFilter, profiles, viewerCity]);

  return (
    <div className="mobile-half-type mobile-matches-type relative z-10 px-4 pb-28 md:hidden">
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

      <div className="-mx-4 h-[calc(100dvh-64px)] snap-y snap-mandatory overflow-y-auto overscroll-contain pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 overflow-x-auto bg-[#f8fafc] px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Pill
            active={activeFilter === "best"}
            label="Best Matches"
            onClick={() => setActiveFilter("best")}
          />
          <Pill
            active={activeFilter === "new"}
            label="New Matches"
            badge
            onClick={() => setActiveFilter("new")}
          />
          <Pill
            active={activeFilter === "compatible"}
            label="Highly Compatible"
            onClick={() => setActiveFilter("compatible")}
          />
          <Pill
            active={activeFilter === "nearby"}
            label="Near You"
            icon={<MapPin size={12} className="text-[#a247f2]" />}
            onClick={() => setActiveFilter("nearby")}
          />
        </div>

        {filteredProfiles.length ? (
          filteredProfiles.map((profile, index) => (
            <div
              key={profile.id}
              className="flex min-h-[calc(100dvh-154px)] snap-start snap-always items-start px-4 py-2"
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
          ))
        ) : (
          <div className="grid min-h-[52dvh] place-items-center px-4 text-center">
            <div>
              <h2 className="text-[18px] font-semibold text-[#0f1419]">
                No matches found
              </h2>
              <p className="mt-2 text-[13px] text-[#687184]">
                Try another match filter.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({
  label,
  active = false,
  badge = false,
  icon,
  onClick,
}: {
  label: string;
  active?: boolean;
  badge?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`mobile-matches-pill flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-semibold shadow-[0_5px_16px_rgba(44,33,80,.07)] ${active ? "bg-gradient-to-r from-[#7c3cff] to-[#ee49b5] text-white" : "border border-[#efebf2] bg-white text-[var(--text-primary)]"}`}
    >
      {icon}
      {label}
      {badge ? (
        <span className="mobile-new-badge rounded bg-[#fa4c9f] text-white">
          NEW
        </span>
      ) : null}
    </button>
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
      <div className="relative aspect-[0.88] min-h-[390px] overflow-hidden bg-[#e8e9ec]">
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
        <div className="absolute inset-x-5 bottom-5 text-white">
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
          <p className="mt-2 text-[12px]">{profile.occupation}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[12px]">
            <MapPin size={14} fill="white" />
            {profile.city}, {profile.state}, India
          </p>
        </div>
        <span className="absolute bottom-5 right-4 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white">
          1/{Math.max(profile.photoCount, 1)}
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#eceaf0] border-b border-[#eceaf0] px-2 py-4">
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

      <p className="line-clamp-2 min-h-[60px] px-5 py-4 text-[12px] leading-6 text-[#687184]">
        {profile.about || "No description added yet."}
      </p>

      <div className="grid grid-cols-2 gap-3 border-t border-[#eceaf0] p-3">
        <Link
          href={`/profile/${profile.id}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#8b3de8] text-[12px] font-semibold text-[#8b3de8]"
        >
          <Eye size={14} />
          View Profile
        </Link>
        <button
          type="button"
          onClick={onInterest}
          disabled={sent || following}
          className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#a34cef] to-[#f45ca9] text-[12px] font-semibold text-white disabled:opacity-80"
        >
          <Heart size={14} />
          {following ? "Following" : sent ? "Requested" : "Send Request"}
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
    <div className="flex min-w-0 items-center gap-2 px-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f6efff] text-[#7651a8]">
        <Icon size={14} />
      </span>
      <span className="min-w-0">
        <small className="block truncate text-[9px] text-[#8a91a1]">
          {label}
        </small>
        <strong className="mt-1 block truncate text-[10px] font-medium text-[#252936]">
          {value}
        </strong>
      </span>
    </div>
  );
}

function normalizeCity(value: string) {
  return value.split(",")[0]?.trim().toLowerCase() ?? "";
}
