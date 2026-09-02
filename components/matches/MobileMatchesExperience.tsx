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
  Sparkles,
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
  return (
    <div className="mobile-half-type mobile-matches-type relative z-10 px-4 pb-32 pt-5 md:hidden">
      <header className="grid grid-cols-[40px_1fr_40px] items-center">
        <span aria-hidden="true" />
        <Link
          href="/discover"
          className="justify-self-center"
          aria-label="Bandhanaa"
        >
          <Brand compact />
        </Link>
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
      <div className="mt-8">
        <h1 className="flex items-center gap-2 text-[34px] font-extrabold tracking-[-.04em] text-[var(--text-primary)]">
          Matches{" "}
          <span className="grid size-7 place-items-center rounded-lg bg-[#eee6ff]">
            <Heart
              size={13}
              className="mobile-matches-title-icon fill-[#9348ee] text-[#9348ee]"
            />
          </span>
        </h1>
        <p className="mt-2 text-[16px] text-[var(--text-secondary)]">
          Profiles that are highly compatible with you 💗
        </p>
      </div>
      <div className="mt-6 flex min-h-[60px] items-center rounded-[18px] bg-gradient-to-r from-[#faf8ff] to-[#f8eefd] px-2.5 py-2 shadow-[0_8px_25px_rgba(72,45,112,.1)]">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white text-[#8b3de8]">
          <Sparkles size={12} fill="currentColor" />
        </span>
        <span className="ml-2.5 min-w-0 flex-1">
          <strong className="block text-[16px] text-[var(--text-primary)]">
            You have {profiles.length} new matches!
          </strong>
          <span className="mt-1 block text-[13px] text-[var(--text-secondary)]">
            Check them out and find your perfect match.
          </span>
        </span>
        <span className="flex -space-x-2">
          {profiles.slice(0, 4).map((profile) => (
            <span
              key={profile.id}
              className="relative size-7 overflow-hidden rounded-full border-2 border-white"
            >
              <ProfileImage
                src={profile.image}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
          ))}
          {profiles.length > 4 ? (
            <span className="grid size-7 place-items-center rounded-full border-2 border-white bg-[#f2e7ff] text-[11px] font-bold text-[#9146ee]">
              +{profiles.length - 4}
            </span>
          ) : null}
        </span>
      </div>
      <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Pill active label="Best Matches" />
        <Pill label="New Matches" badge />
        <Pill label="Highly Compatible" />
        <Pill
          label="Near You"
          icon={<MapPin size={12} className="text-[#a247f2]" />}
        />
      </div>
      <div className="mt-4 space-y-4">
        {profiles.map((profile, index) => (
          <MobileMatchCard
            key={profile.id}
            profile={profile}
            liked={shortlisted.includes(profile.id)}
            sent={sentIds.includes(profile.id)}
            following={followingIds.includes(profile.id)}
            priority={index < 2}
            onShortlist={() => onShortlist(profile)}
            onInterest={() => onInterest(profile)}
          />
        ))}
      </div>
    </div>
  );
}

function Pill({
  label,
  active = false,
  badge = false,
  icon,
}: {
  label: string;
  active?: boolean;
  badge?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
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
    <article className="overflow-hidden rounded-[20px] border border-[#eceaf0] bg-white shadow-[0_10px_30px_rgba(42,35,70,.09)]">
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
              {profile.name}, {profile.age}
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
          className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#9b4cf2] text-[12px] font-semibold text-[#8b3de8]"
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

function MobileMatchCardLegacy({
  profile,
  liked,
  sent,
  priority,
  onShortlist,
  onInterest,
}: {
  profile: MatchProfile;
  liked: boolean;
  sent: boolean;
  priority: boolean;
  onShortlist: () => void;
  onInterest: () => void;
}) {
  return (
    <article className="grid grid-cols-[42%_minmax(0,1fr)] gap-3 rounded-[24px] bg-white p-3 shadow-[0_12px_35px_rgba(44,33,80,.1)]">
      <div className="relative min-h-[250px] overflow-hidden rounded-[20px] bg-[#eee] min-[430px]:min-h-[270px]">
        <Link href={`/profile/${profile.id}`} className="absolute inset-0">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            priority={priority}
            sizes="42vw"
            className="object-cover"
          />
        </Link>
        <span
          className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] ${profile.online ? "bg-[#075d2d]/85 text-[#50ef8d]" : "bg-black/55 text-white"}`}
        >
          ● {profile.online ? "Online" : "Offline"}
        </span>
        <span className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2 py-1 text-[11px] text-white">
          ▧ {Math.max(profile.photoCount, 1)}
        </span>
        <button
          type="button"
          onClick={onShortlist}
          aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
          className="absolute right-2 top-2 grid size-10 place-items-center rounded-[14px] bg-white text-[#0f1419] shadow-lg min-[430px]:size-11"
        >
          <Heart
            size={19}
            fill={liked ? "#ff3040" : "none"}
            className={liked ? "text-[#ff3040]" : ""}
          />
        </button>
      </div>
      <div className="flex min-w-0 flex-col py-2">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-1 truncate text-[clamp(16px,4.2vw,21px)] font-bold tracking-[-.03em] text-[var(--text-primary)]">
              {profile.name}, {profile.age}
              <BadgeCheck
                size={15}
                className="shrink-0 fill-[#ff4d9b] text-white"
              />
            </h2>
            <p className="mt-1 truncate text-[clamp(10px,2.8vw,13px)] text-[var(--text-secondary)]">
              {profile.occupation} ›
            </p>
            <p className="mt-2 flex items-center gap-1 truncate text-[clamp(9px,2.6vw,12px)] text-[var(--text-secondary)]">
              <MapPin size={13} fill="currentColor" />
              {profile.city}, {profile.state}
            </p>
          </div>
          <Score value={profile.compatibility} />
        </div>
        <div className="mt-3 rounded-[18px] bg-gradient-to-br from-[#faf9ff] to-[#f7f1ff] p-3 text-[#0f1419]">
          <strong className="text-[11px]">You match on</strong>
          <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-2 text-[clamp(9px,2.5vw,11px)]">
            <span className="flex items-center gap-2">
              <GraduationCap size={14} />
              Education
            </span>
            <span className="flex items-center gap-2">
              <BriefcaseBusiness size={14} />
              Career Goals
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              Location
            </span>
            <span className="flex items-center gap-2">
              <Heart size={14} />
              {profile.lifestyle}
            </span>
          </div>
          <Link
            href={`/profile/${profile.id}`}
            className="mt-3 block text-[11px] font-semibold text-[#8b3de8]"
          >
            View Details ›
          </Link>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          <Link
            href={`/profile/${profile.id}`}
            className="flex h-10 min-w-0 items-center justify-center gap-1 rounded-full border border-[#8b3de8] px-1 text-[clamp(9px,2.6vw,12px)] font-semibold text-[#8b3de8]"
          >
            <Eye size={13} className="shrink-0" />
            View Profile
          </Link>
          <button
            type="button"
            onClick={onInterest}
            disabled={sent}
            className="flex h-10 min-w-0 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#873df1] to-[#f547a2] px-1 text-[clamp(9px,2.6vw,12px)] font-semibold text-white disabled:opacity-70"
          >
            <Heart size={13} className="shrink-0" />
            {sent ? "Requested" : "Send Interest"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Score({ value }: { value: number }) {
  return (
    <span className="grid size-[52px] shrink-0 place-items-center rounded-full border-[4px] border-[#9146ee] border-l-[#f1eafd] text-center text-[#8b3de8] min-[430px]:size-[62px]">
      <span>
        <strong className="block text-[15px] leading-none">{value}%</strong>
        <small className="text-[8px]">Match</small>
      </span>
    </span>
  );
}
