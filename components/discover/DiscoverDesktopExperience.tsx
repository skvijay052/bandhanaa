"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  Grid2X2,
  Heart,
  List,
  Search,
  SlidersHorizontal,
  Star,
  Target,
} from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import { createClient } from "@/lib/supabase/client";
import { genderDiscoverPhoto, resolveProfilePhoto } from "@/lib/profile-photo";
import { ProfileCard } from "./ProfileCard";
import type { DiscoverProfile } from "./types";

type DesktopFilter = "all" | "nearby" | "new" | "verified";
type SortMode = "recommended" | "newest" | "age";

type RecentVisitorRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  gender: string | null;
};

type InsightPerson = {
  id: string;
  name: string;
  image: string;
};

type Props = {
  profiles: DiscoverProfile[];
  allProfiles: DiscoverProfile[];
  query: string;
  onQuery: (value: string) => void;
  filtersOpen: boolean;
  onFilters: () => void;
  shortlisted: string[];
  relationshipStates: Record<string, DiscoverProfile["relationship"]>;
  onShortlist: (id: string) => void;
  onRelationshipAction: (profile: DiscoverProfile) => void;
};

const NEW_PROFILE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function DiscoverDesktopExperience({
  profiles,
  allProfiles,
  query,
  onQuery,
  filtersOpen,
  onFilters,
  shortlisted,
  relationshipStates,
  onShortlist,
  onRelationshipAction,
}: Props) {
  const [filter, setFilter] = useState<DesktopFilter>("all");
  const [sort, setSort] = useState<SortMode>("recommended");
  const [gridView, setGridView] = useState(true);
  const [viewerCity, setViewerCity] = useState("");
  const [recentVisitors, setRecentVisitors] = useState<InsightPerson[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadInsights() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const [viewerResult, visitorResult] = await Promise.all([
        supabase.from("profiles").select("city").eq("id", user.id).maybeSingle(),
        supabase.rpc("get_recent_profile_visitors", { result_limit: 12 }),
      ]);

      if (!cancelled) {
        setViewerCity(String(viewerResult.data?.city ?? "").trim());
      }

      if (!cancelled && !visitorResult.error && visitorResult.data) {
        setRecentVisitors(
          (visitorResult.data as RecentVisitorRow[]).map((visitor) => ({
            id: visitor.id,
            name: visitor.display_name?.trim() || "Member",
            image: resolveProfilePhoto(
              {
                avatar_url: visitor.avatar_url,
                photos: visitor.photos,
                gender: visitor.gender,
              },
              genderDiscoverPhoto(visitor.gender),
            ),
          })),
        );
      }
    }

    void loadInsights();
    return () => {
      cancelled = true;
    };
  }, []);

  const shortlistedProfiles = useMemo(
    () => allProfiles.filter((profile) => shortlisted.includes(profile.id)),
    [allProfiles, shortlisted],
  );

  const preferenceMatches = useMemo(
    () => [...allProfiles].sort((a, b) => b.match - a.match),
    [allProfiles],
  );

  const newMatches = useMemo(() => {
    const cutoff = Date.now() - NEW_PROFILE_WINDOW_MS;
    const recent = allProfiles
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
    return recent.length
      ? recent
      : [...allProfiles].sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
  }, [allProfiles]);

  const visibleProfiles = useMemo(() => {
    let items = [...profiles];
    if (filter === "nearby") {
      const city = normalizeCity(viewerCity);
      items = city
        ? items.filter((profile) => normalizeCity(profile.city) === city)
        : [];
    }
    if (filter === "new") {
      const cutoff = Date.now() - NEW_PROFILE_WINDOW_MS;
      items = items.filter((profile) => {
        if (!profile.createdAt) return false;
        const createdAt = new Date(profile.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
      });
    }

    if (sort === "newest") {
      items.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );
    } else if (sort === "age") {
      items.sort((a, b) => (a.age || 999) - (b.age || 999));
    } else {
      items.sort((a, b) => b.match - a.match);
    }
    return items;
  }, [filter, profiles, sort, viewerCity]);

  const toPeople = (items: DiscoverProfile[]): InsightPerson[] =>
    items.map((profile) => ({
      id: profile.id,
      name: profile.name,
      image: profile.image,
    }));

  return (
    <div className="hidden md:block">
      <section
        aria-label="Discover insights"
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
      >
        <InsightCard
          icon={<Eye size={22} />}
          title="Recent profile visitors"
          description="See who recently viewed your profile."
          people={recentVisitors}
          count={recentVisitors.length}
          href="/settings/activity"
        />
        <InsightCard
          icon={<Heart size={22} />}
          title="Your shortlist"
          description="Profiles you saved to revisit later."
          people={toPeople(shortlistedProfiles)}
          count={shortlisted.length}
          href="/matches?tab=shortlisted"
        />
        <InsightCard
          icon={<Target size={22} />}
          title="Partner preference matches"
          description="People aligned with your preferences."
          people={toPeople(preferenceMatches)}
          count={preferenceMatches.length}
          onOpen={() => setFilter("all")}
        />
        <InsightCard
          icon={<Star size={22} />}
          title="New matches"
          description="Fresh profiles that may interest you."
          people={toPeople(newMatches)}
          count={newMatches.length}
          onOpen={() => setFilter("new")}
        />
      </section>

      <section className="mt-7" aria-label="Discover profiles">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-.035em] text-[#111111]">
              Discover
            </h1>
            <p className="mt-1 text-[14px] text-[#737780]">
              People who match your preferences
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-full bg-[#fafafa] p-1">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </FilterPill>
              <FilterPill
                active={filter === "nearby"}
                onClick={() => setFilter("nearby")}
              >
                Near you
              </FilterPill>
              <FilterPill
                active={filter === "new"}
                onClick={() => setFilter("new")}
              >
                New members
              </FilterPill>
              <FilterPill
                active={filter === "verified"}
                onClick={() => setFilter("verified")}
              >
                Verified
              </FilterPill>
            </div>

            <label className="flex h-10 w-[190px] items-center gap-2 rounded-xl border border-[#e7e7e7] bg-white px-3 text-[#777] focus-within:border-[#f4a8cb]">
              <Search size={15} />
              <input
                type="search"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#111] outline-none placeholder:text-[#9b9b9b]"
              />
            </label>

            <button
              type="button"
              onClick={onFilters}
              aria-expanded={filtersOpen}
              aria-label="Advanced filters"
              className="grid size-10 place-items-center rounded-xl border border-[#e7e7e7] bg-white text-[#313131] transition hover:bg-[#fafafa]"
            >
              <SlidersHorizontal size={16} />
            </button>

            <label className="relative flex h-10 min-w-[132px] items-center rounded-xl border border-[#e7e7e7] bg-white px-3 text-[12px] text-[#303030]">
              <span className="mr-2 text-[#777]">Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className="min-w-0 flex-1 appearance-none bg-transparent pr-5 font-semibold outline-none"
                aria-label="Sort profiles"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">Newest</option>
                <option value="age">Age</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3"
              />
            </label>

            <div className="flex h-10 items-center rounded-xl border border-[#e7e7e7] bg-white p-1">
              <button
                type="button"
                onClick={() => setGridView(true)}
                aria-label="Grid view"
                aria-pressed={gridView}
                className={`grid size-8 place-items-center rounded-lg transition ${gridView ? "bg-[#111] text-white" : "text-[#727272] hover:bg-[#f6f6f6]"}`}
              >
                <Grid2X2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setGridView(false)}
                aria-label="List view"
                aria-pressed={!gridView}
                className={`grid size-8 place-items-center rounded-lg transition ${!gridView ? "bg-[#111] text-white" : "text-[#727272] hover:bg-[#f6f6f6]"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {visibleProfiles.length ? (
          <div
            className={`mt-5 grid gap-4 ${gridView ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 2xl:grid-cols-2"}`}
          >
            {visibleProfiles.map((profile) => {
              const currentProfile = {
                ...profile,
                relationship:
                  relationshipStates[profile.id] ?? profile.relationship,
              };
              return (
                <ProfileCard
                  key={profile.id}
                  profile={currentProfile}
                  liked={shortlisted.includes(profile.id)}
                  onLike={() => onShortlist(profile.id)}
                  onRelationshipAction={() => onRelationshipAction(currentProfile)}
                  listView={!gridView}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-[20px] border border-[#ededed] bg-white px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-[#222]">
              No profiles match this view.
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-3 text-[13px] font-semibold text-[#e83e78]"
            >
              Show all profiles
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
  people,
  count,
  href,
  onOpen,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  people: InsightPerson[];
  count: number;
  href?: string;
  onOpen?: () => void;
}) {
  const actionClass =
    "grid size-10 shrink-0 place-items-center rounded-full border border-[#ededed] bg-white text-[#222] shadow-[0_5px_14px_rgba(17,17,17,.06)] transition hover:-translate-y-0.5 hover:border-[#f6c6dc] hover:text-[#e83e78]";

  return (
    <article className="min-h-[190px] rounded-[18px] border border-[#f1e7ec] bg-white p-5 shadow-[0_8px_24px_rgba(30,22,26,.035)]">
      <span className="grid size-11 place-items-center rounded-full bg-[#fff0f7] text-[#ed3f8f]">
        {icon}
      </span>
      <h2 className="mt-4 max-w-[190px] text-[17px] font-bold leading-[1.15] tracking-[-.02em] text-[#171717]">
        {title}
      </h2>
      <div className="mt-3 flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <AvatarStack people={people} count={count} />
          <p className="mt-3 text-[11px] leading-[1.45] text-[#8a8a8a]">
            {description}
          </p>
        </div>
        {href ? (
          <Link href={href} aria-label={`Open ${title}`} className={actionClass}>
            <ArrowRight size={17} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${title}`}
            className={actionClass}
          >
            <ArrowRight size={17} />
          </button>
        )}
      </div>
    </article>
  );
}

function AvatarStack({
  people,
  count,
}: {
  people: InsightPerson[];
  count: number;
}) {
  const visible = people.slice(0, 3);
  const extra = Math.max(count - visible.length, 0);

  if (!visible.length) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-[#faf5f7] px-3 text-[10px] font-semibold text-[#9a7183]">
        {count ? `${count} profiles` : "No activity yet"}
      </span>
    );
  }

  return (
    <div className="flex items-center">
      {visible.map((person, index) => (
        <span
          key={person.id}
          className={`relative size-8 overflow-hidden rounded-full border-2 border-white bg-[#eee] ${index ? "-ml-2" : ""}`}
          title={person.name}
        >
          <ProfileImage
            src={person.image}
            alt={person.name}
            fill
            sizes="32px"
            className="object-cover"
          />
        </span>
      ))}
      {extra > 0 ? (
        <span className="-ml-1 grid h-8 min-w-8 place-items-center rounded-full bg-[#f6f1f3] px-2 text-[9px] font-bold text-[#7e7176] ring-2 ring-white">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 rounded-full px-4 text-[11px] font-semibold transition ${active ? "bg-[#111] text-white shadow-sm" : "text-[#747474] hover:bg-white hover:text-[#222]"}`}
    >
      {children}
    </button>
  );
}

function normalizeCity(value: string) {
  return value.split(",")[0]?.trim().toLowerCase() ?? "";
}
