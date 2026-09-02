"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Search,
  Heart,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
import { ProfileImage } from "@/components/ui/ProfileImage";
import type { DiscoverProfile } from "./types";

type Props = {
  profiles: DiscoverProfile[];
  query: string;
  onQuery: (value: string) => void;
  filtersOpen: boolean;
  onFilters: () => void;
  mode: "all" | "online";
  onMode: (mode: "all" | "online") => void;
  completion: number;
  shortlisted: string[];
  onShortlist: (id: string) => void;
};

export function MobileDiscoverExperience({
  profiles,
  query,
  onQuery,
  filtersOpen,
  onFilters,
  mode,
  onMode,
  completion,
  shortlisted,
  onShortlist,
}: Props) {
  const featured = profiles[0];
  return (
    <div className="mobile-discover-type mobile-half-type relative z-10 px-4 pb-32 pt-5 md:hidden">
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
            className="grid size-9 place-items-center rounded-[13px] bg-white p-1 text-[#0f1419] shadow-[0_8px_24px_rgba(44,33,80,.1)] dark:bg-[var(--surface)] dark:text-[var(--text-primary)]"
          >
            <Heart size={17} />
          </Link>
        </div>
      </header>
      <label className="mobile-discover-search mt-5 flex h-11 items-center rounded-full border border-[#e6e2ea] bg-white px-3 text-[#87909e] shadow-[0_7px_22px_rgba(44,33,80,.08)] dark:bg-[var(--surface)]">
        <Search size={17} />
        <input
          id="mobile-discover-search"
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search by name, profession or city"
          className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[#8b93a1]"
        />
        <button
          type="button"
          onClick={onFilters}
          aria-expanded={filtersOpen}
          aria-label="Advanced filters"
          className="grid h-8 w-10 place-items-center border-l border-[#ebe8ef]"
        >
          <SlidersHorizontal size={16} />
        </button>
      </label>
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill
          active={mode === "all"}
          onClick={() => onMode("all")}
          icon={<Star size={17} />}
          label="For You"
        />
        <FilterPill
          icon={<MapPin size={17} className="text-[#ff4da0]" />}
          label="Nearby"
        />
        <FilterPill
          icon={
            <span className="mobile-new-badge rounded bg-[#ff4da0] font-bold text-white">
              NEW
            </span>
          }
          label="New"
        />
        <FilterPill
          active={mode === "online"}
          onClick={() => onMode("online")}
          icon={<span className="size-3 rounded-full bg-[#2dd477]" />}
          label="Active"
        />
        <FilterPill
          icon={
            <BadgeCheck size={18} className="fill-[#8c45ff] text-[#8c45ff]" />
          }
          label="Verified"
        />
      </div>
      <Link
        href="/settings/edit-profile"
        className="mt-4 flex min-h-[86px] items-center rounded-[22px] bg-gradient-to-r from-[#e7e3ff] to-[#f9e5fa] px-4 text-[#6534d7] shadow-[0_8px_24px_rgba(113,74,214,.11)]"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/85">
          <Star size={16} className="size-4 fill-[#7448e8] text-[#7448e8]" />
        </span>
        <span className="ml-4 min-w-0 flex-1">
          <strong className="block text-[17px] leading-tight">
            Increase your chances!
          </strong>
          <span className="mt-1 block text-[14px] leading-tight">
            Complete your profile to get better matches
          </span>
        </span>
        <span className="grid size-[48px] shrink-0 place-items-center rounded-full border-4 border-[#9146ee] border-l-white/60 bg-white/35 text-[14px] font-bold">
          {completion}%
        </span>
        <span className="ml-2 text-2xl">›</span>
      </Link>
      {featured ? (
        <FeaturedProfile
          profile={featured}
          liked={shortlisted.includes(featured.id)}
          onShortlist={() => onShortlist(featured.id)}
        />
      ) : (
        <div className="py-16 text-center text-[15px] text-[var(--text-secondary)]">
          No profiles match your search.
        </div>
      )}
      {profiles.length > 1 ? (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)]">
              New Profiles
            </h2>
            <Link
              href="/matches"
              className="text-[15px] font-semibold text-[#8c45ff]"
            >
              View All
            </Link>
          </div>
          <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {profiles.slice(1, 6).map((profile, index) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.id}`}
                className="relative h-[145px] w-[128px] shrink-0 overflow-hidden rounded-[20px] bg-[#eee]"
              >
                <ProfileImage
                  src={profile.image}
                  alt={profile.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
                {index === 0 && profile.online ? (
                  <span className="absolute left-2 top-2 rounded-full bg-[#075d2d]/85 px-2 py-1 text-[10px] text-[#50ef8d]">
                    ● Online
                  </span>
                ) : null}
                {index === 2 ? (
                  <span className="mobile-new-badge absolute left-2 top-2 rounded-full bg-[#f85da6] font-semibold text-white">
                    New
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function FilterPill({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold shadow-[0_5px_16px_rgba(44,33,80,.07)] ${active ? "bg-gradient-to-r from-[#7c3cff] to-[#ee49b5] text-white" : "border border-[#efebf2] bg-white text-[#0f1419] dark:bg-[var(--surface)] dark:text-[var(--text-primary)]"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function FeaturedProfile({
  profile,
  liked,
  onShortlist,
}: {
  profile: DiscoverProfile;
  liked: boolean;
  onShortlist: () => void;
}) {
  return (
    <article className="mt-5 overflow-hidden rounded-[26px] bg-white shadow-[0_14px_38px_rgba(44,33,80,.13)] dark:bg-[var(--surface)]">
      <div className="relative h-[440px] overflow-hidden">
        <Link href={`/profile/${profile.id}`} className="absolute inset-0">
          <ProfileImage
            src={profile.image}
            alt={profile.name}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 0px"
            className="object-cover"
          />
        </Link>
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[12px] font-medium ${profile.online ? "bg-[#075d2d]/85 text-[#50ef8d]" : "bg-black/55 text-white"}`}
        >
          ● {profile.online ? "Online" : "Offline"}
        </span>
        <button
          type="button"
          onClick={onShortlist}
          aria-label={liked ? "Remove bookmark" : "Bookmark profile"}
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-[14px] bg-white text-[#0f1419] shadow-lg"
        >
          <Bookmark
            size={25}
            fill={liked ? "#8c45ff" : "none"}
            className={liked ? "text-[#8c45ff]" : ""}
          />
        </button>
        <div className="absolute inset-x-5 bottom-5 text-white">
          <Link href={`/profile/${profile.id}`} className="inline-flex">
            <h2 className="flex items-center gap-2 text-[31px] font-bold tracking-[-.03em]">
              {profile.name}, {profile.age}
              <BadgeCheck size={23} className="fill-[#ff4d9b] text-white" />
            </h2>
          </Link>
          <p className="mt-1 text-[16px]">{profile.job}</p>
          <p className="mt-2 flex items-center gap-2 text-[15px]">
            <MapPin size={17} fill="white" />
            {profile.city}
          </p>
        </div>
        <span className="absolute bottom-5 right-5 rounded-full bg-black/60 px-3 py-1 text-[12px] text-white">
          1/{Math.max(profile.photoCount, 1)}
        </span>
      </div>
      <div className="rounded-t-[28px] px-5 pb-7 pt-5">
        <div className="grid grid-cols-3 gap-3">
          <Detail
            icon={<GraduationCap size={20} />}
            label="Education"
            value={profile.education}
          />
          <Detail
            icon={<BriefcaseBusiness size={19} />}
            label="Profession"
            value={profile.job}
          />
          <Detail
            icon={<span className="text-[18px]">▥</span>}
            label="Height"
            value={profile.height}
          />
        </div>
        <p className="mt-5 line-clamp-2 text-[15px] leading-6 text-[var(--text-secondary)]">
          {profile.bio}
        </p>
      </div>
    </article>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-2">
      <span className="mobile-profile-detail-icon grid size-8 shrink-0 place-items-center rounded-xl bg-[#f7f3ff] text-[#6d6890]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="mobile-profile-detail-text block text-[10px] text-[#8b93a1]">
          {label}
        </span>
        <strong className="mobile-profile-detail-text mt-1 block truncate text-[10px] font-medium text-[var(--text-primary)]">
          {value}
        </strong>
      </span>
    </div>
  );
}
