"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  BadgeCheck,
  ChevronDown,
  Filter,
  Heart,
  HeartHandshake,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Settings,
  ShieldCheck,
  UserRound,
  UserRoundSearch,
  X,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { MobileProfileCard } from "./MobileProfileCard";
import { MobileDiscoverExperience } from "./MobileDiscoverExperience";
import { ProfileCard } from "./ProfileCard";
import type { DiscoverProfile } from "./types";
export type { DiscoverProfile } from "./types";

export function DiscoverClient({
  profiles,
  initialShortlisted,
  profileCompletion,
}: {
  firstName: string;
  avatarUrl: string;
  profiles: DiscoverProfile[];
  initialShortlisted: string[];
  profileCompletion: number;
}) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [relationshipStates, setRelationshipStates] = useState(() =>
    Object.fromEntries(
      profiles.map((profile) => [profile.id, profile.relationship]),
    ),
  );
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);
  const [mobileMode, setMobileMode] = useState<"all" | "online">("all");
  const [hiddenProfiles, setHiddenProfiles] = useState<string[]>([]);
  const list = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return profiles
      .filter(
        (p) =>
          !normalizedQuery ||
          `${p.name} ${p.job} ${p.city} ${p.age} ${p.maritalStatus}`
            .toLowerCase()
            .includes(normalizedQuery),
      )
      .filter(
        (profile) =>
          !location ||
          profile.city.toLowerCase().includes(location.toLowerCase()),
      )
      .filter((profile) => !profession || profile.job === profession)
      .filter(
        (profile) => !maritalStatus || profile.maritalStatus === maritalStatus,
      )
      .filter((profile) => profile.age >= minAge && profile.age <= maxAge)
      .sort((a, b) => b.match - a.match);
  }, [location, maritalStatus, maxAge, minAge, profession, profiles, query]);
  const cardProfiles = query.trim() ? profiles : list;
  const mobileProfiles = (
    mobileMode === "online" ? list.filter((profile) => profile.online) : list
  ).filter((profile) => !hiddenProfiles.includes(profile.id));
  async function toggleShortlist(id: string) {
    const exists = shortlisted.includes(id);
    setShortlisted((items) =>
      exists ? items.filter((item) => item !== id) : [...items, id],
    );
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const result = exists
      ? await supabase
          .from("profile_shortlists")
          .delete()
          .eq("user_id", user.id)
          .eq("profile_id", id)
      : await supabase
          .from("profile_shortlists")
          .insert({ user_id: user.id, profile_id: id });
    if (result.error)
      setShortlisted((items) =>
        exists ? [...items, id] : items.filter((item) => item !== id),
      );
  }
  async function updateRelationship(profile: DiscoverProfile) {
    const state = relationshipStates[profile.id] ?? profile.relationship;
    if (state === "following" || state === "outgoing_pending") return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (state === "incoming_pending") {
      const { error } = await supabase
        .from("profile_likes")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("liker_id", profile.id)
        .eq("liked_id", user.id)
        .eq("status", "pending");
      if (!error)
        setRelationshipStates((current) => ({
          ...current,
          [profile.id]: "following",
        }));
      return;
    }
    const { error } = await supabase
      .from("profile_likes")
      .insert({ liker_id: user.id, liked_id: profile.id, status: "pending" });
    if (!error)
      setRelationshipStates((current) => ({
        ...current,
        [profile.id]: "outgoing_pending",
      }));
  }
  return (
    <div className="h-dvh bg-[var(--app-bg)] max-md:bg-[#f8fafc]">
    
      <div className="app-shell">
        <AppSidebar active="Discover" />
        <div className="app-workspace min-w-0 flex-1 overflow-y-auto pb-20 md:pb-8">
          <main className="relative px-8 py-7 max-md:px-0 max-md:py-0">
            <MobileDiscoverExperience
              profiles={mobileProfiles.map((profile) => ({
                ...profile,
                relationship:
                  relationshipStates[profile.id] ?? profile.relationship,
              }))}
              query={query}
              onQuery={setQuery}
              filtersOpen={showFilters}
              onFilters={() => setShowFilters(true)}
              mode={mobileMode}
              onMode={setMobileMode}
              completion={profileCompletion}
              shortlisted={shortlisted}
              onShortlist={(id) => void toggleShortlist(id)}
            />
            <DiscoverSearch
              query={query}
              onQuery={setQuery}
              open={showFilters}
              onToggle={() => setShowFilters((value) => !value)}
              suggestions={list}
            />
            {showFilters ? (
              <>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 z-[60] bg-[#0f1419]/30 md:hidden"
                />
                <AdvancedFilters
                  location={location}
                  profession={profession}
                  maritalStatus={maritalStatus}
                  minAge={minAge}
                  maxAge={maxAge}
                  profiles={profiles}
                  onLocation={setLocation}
                  onProfession={setProfession}
                  onMaritalStatus={setMaritalStatus}
                  onMinAge={setMinAge}
                  onMaxAge={setMaxAge}
                  onClear={() => {
                    setLocation("");
                    setProfession("");
                    setMaritalStatus("");
                    setMinAge(18);
                    setMaxAge(60);
                  }}
                  onApply={() => setShowFilters(false)}
                />
              </>
            ) : null}
            <div className="mt-6 max-md:hidden">
              <h1 className="text-[26px] font-bold tracking-[-.025em] text-[#0f1419]">
                Discover
              </h1>
              <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
                People who match your preferences
              </p>
            </div>
            {cardProfiles.length ? (
              <>
                <div className="mt-6 hidden grid-cols-2 gap-5 md:grid xl:grid-cols-3 2xl:grid-cols-4">
                  {cardProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={{
                        ...profile,
                        relationship:
                          relationshipStates[profile.id] ??
                          profile.relationship,
                      }}
                      liked={shortlisted.includes(profile.id)}
                      onLike={() => void toggleShortlist(profile.id)}
                      onRelationshipAction={() =>
                        void updateRelationship(profile)
                      }
                    />
                  ))}
                </div>
                <div className="hidden">
                  {mobileProfiles.length ? (
                    mobileProfiles.map((profile) => {
                      const currentProfile = {
                        ...profile,
                        relationship:
                          relationshipStates[profile.id] ??
                          profile.relationship,
                      };
                      return (
                        <MobileProfileCard
                          key={profile.id}
                          profile={currentProfile}
                          liked={shortlisted.includes(profile.id)}
                          onLike={() => void toggleShortlist(profile.id)}
                          onRelationshipAction={() =>
                            void updateRelationship(currentProfile)
                          }
                          onClose={() =>
                            setHiddenProfiles((current) => [
                              ...current,
                              profile.id,
                            ])
                          }
                        />
                      );
                    })
                  ) : (
                    <p className="py-14 text-center text-[14px] text-[#536471]">
                      No profiles match your search.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="py-16 text-center text-sm text-[#747184]">
                No profiles match your search.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileDiscoverControls({
  query,
  onQuery,
  filtersOpen,
  onFilters,
  mode,
  onMode,
}: {
  query: string;
  onQuery: (value: string) => void;
  filtersOpen: boolean;
  onFilters: () => void;
  mode: "all" | "online";
  onMode: (mode: "all" | "online") => void;
}) {
  return (
    <section className="px-4 md:hidden" aria-label="Discover controls">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onMode("all")}
          aria-pressed={mode === "all"}
          className={`h-11 shrink-0 rounded-full px-5 text-[14px] font-semibold ${mode === "all" ? "bg-[#1d9bf0] text-white" : "border border-white/80 bg-white/80 text-[#0f1419] shadow-sm"}`}
        >
          All
        </button>
        <button
          type="button"
          disabled
          title="Nearby profiles will be available when location distance is supported"
          className="h-11 shrink-0 rounded-full border border-white/80 bg-white/80 px-5 text-[14px] font-semibold text-[#8b98a5] shadow-sm disabled:cursor-not-allowed"
        >
          Nearby
        </button>
        <button
          type="button"
          onClick={() => onMode("online")}
          aria-pressed={mode === "online"}
          className={`h-11 shrink-0 rounded-full px-5 text-[14px] font-semibold ${mode === "online" ? "bg-[#1d9bf0] text-white" : "border border-white/80 bg-white/80 text-[#0f1419] shadow-sm"}`}
        >
          Online
        </button>
        <button
          type="button"
          onClick={onFilters}
          aria-expanded={filtersOpen}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 text-[14px] font-semibold text-[#0f1419] shadow-sm"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>
      <label className="mt-2 flex h-11 items-center gap-3 rounded-full border border-white/80 bg-white/85 px-4 text-[#536471] shadow-sm focus-within:ring-1 focus-within:ring-[#1d9bf0]">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search profiles"
          aria-label="Search profiles"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0f1419] outline-none placeholder:text-[#8b98a5]"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="Clear search"
            className="grid size-7 place-items-center rounded-full bg-[#eff3f4]"
          >
            <X size={14} />
          </button>
        ) : null}
      </label>
    </section>
  );
}

function DiscoverSearch({
  query,
  onQuery,
  open,
  onToggle,
  suggestions,
}: {
  query: string;
  onQuery: (value: string) => void;
  open: boolean;
  onToggle: () => void;
  suggestions: DiscoverProfile[];
}) {
  return (
    <div className="relative z-40 hidden border-b border-[var(--border)] pb-5 md:block">
      <label className="flex h-12 w-full items-center gap-3 rounded-2xl bg-[#f7f9f9] px-5 text-[#536471] transition focus-within:ring-1 focus-within:ring-[#cfd9de]">
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search by name, profession, location..."
          aria-label="Search profiles"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-[var(--text-primary)] outline-none placeholder:text-[#737373]"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="Clear search"
            className="grid size-6 place-items-center rounded-full bg-[#c7c7c7] text-white"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={`ml-2 flex h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-[13px] font-semibold text-[#0f1419] shadow-sm ${open ? "ring-1 ring-[#1d9bf0]" : ""}`}
        >
          <SlidersHorizontal size={16} className="text-[#536471]" />
          Advanced Filters
        </button>
      </label>
      {query.trim() ? <SearchResults profiles={suggestions} /> : null}
    </div>
  );
}

function AdvancedFilters({
  location,
  profession,
  maritalStatus,
  minAge,
  maxAge,
  profiles,
  onLocation,
  onProfession,
  onMaritalStatus,
  onMinAge,
  onMaxAge,
  onClear,
  onApply,
}: {
  location: string;
  profession: string;
  maritalStatus: string;
  minAge: number;
  maxAge: number;
  profiles: DiscoverProfile[];
  onLocation: (value: string) => void;
  onProfession: (value: string) => void;
  onMaritalStatus: (value: string) => void;
  onMinAge: (value: number) => void;
  onMaxAge: (value: number) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const locations = [
    ...new Set(profiles.map((profile) => profile.city)),
  ].sort();
  const professions = [
    ...new Set(profiles.map((profile) => profile.job)),
  ].sort();
  const statuses = [
    ...new Set(profiles.map((profile) => profile.maritalStatus)),
  ].sort();
  return (
    <section
      className="mt-4 rounded-2xl border border-[#eff3f4] bg-white p-5 shadow-[0_8px_24px_rgba(15,20,25,.06)] max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-[70] max-md:mt-0 max-md:max-h-[82dvh] max-md:overflow-y-auto max-md:rounded-b-none max-md:rounded-t-[24px] max-md:px-5 max-md:pb-[calc(20px+env(safe-area-inset-bottom))]"
      aria-label="Advanced profile filters"
    >
      <div className="mb-5 flex items-center justify-between md:hidden">
        <h2 className="text-[20px] font-bold text-[#0f1419]">
          Advanced Filters
        </h2>
        <button
          type="button"
          onClick={onApply}
          aria-label="Close filters"
          className="grid size-11 place-items-center rounded-full bg-[#eff3f4]"
        >
          <X size={20} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FilterSelect
          label="Location"
          value={location}
          options={locations}
          onChange={onLocation}
        />
        <FilterSelect
          label="Profession"
          value={profession}
          options={professions}
          onChange={onProfession}
        />
        <FilterSelect
          label="Marital Status"
          value={maritalStatus}
          options={statuses}
          onChange={onMaritalStatus}
        />
        <SearchableSelect
          label="Minimum age"
          value={String(minAge)}
          options={Array.from(
            { length: Math.max(1, maxAge - 17) },
            (_, index) => String(index + 18),
          )}
          onChange={(value) => onMinAge(Number(value))}
          placeholder="Minimum age"
        />
        <SearchableSelect
          label="Maximum age"
          value={String(maxAge)}
          options={Array.from({ length: 101 - minAge }, (_, index) =>
            String(index + minAge),
          )}
          onChange={(value) => onMaxAge(Number(value))}
          placeholder="Maximum age"
        />
      </div>
      <div className="mt-4 flex justify-end gap-3 max-md:grid max-md:grid-cols-2">
        <button
          type="button"
          onClick={onClear}
          className="h-11 rounded-full border border-[#cfd9de] px-4 text-[13px] font-semibold text-[#0f1419] hover:bg-[#f7f9f9] md:h-9"
        >
          <span className="md:hidden">Reset</span>
          <span className="max-md:hidden">Clear filters</span>
        </button>
        <button
          type="button"
          onClick={onApply}
          className="hidden h-11 rounded-full bg-[#1d9bf0] px-4 text-[13px] font-semibold text-white max-md:block"
        >
          Apply filters
        </button>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <SearchableSelect
      label={label}
      value={value}
      options={["Any", ...options]}
      onChange={(nextValue) => onChange(nextValue === "Any" ? "" : nextValue)}
      placeholder="Any"
    />
  );
}

function SearchResults({ profiles }: { profiles: DiscoverProfile[] }) {
  if (!profiles.length)
    return (
      <div className="absolute inset-x-0 top-[58px] z-50 rounded-2xl border border-[#cfd9de] bg-white px-5 py-8 text-center text-[14px] text-[var(--text-secondary)] shadow-[0_12px_36px_rgba(15,20,25,.14)]">
        No profiles match your search.
      </div>
    );
  return (
    <div className="absolute inset-x-0 top-[58px] z-50 max-h-[420px] divide-y divide-[var(--border)] overflow-y-auto rounded-2xl border border-[#cfd9de] bg-white p-2 shadow-[0_12px_36px_rgba(15,20,25,.14)]">
      {profiles.slice(0, 8).map((profile) => (
        <Link
          key={profile.id}
          href={`/profile/${profile.id}`}
          className="flex items-center gap-4 px-2 py-3 transition-colors hover:bg-[var(--surface-hover)]"
        >
          <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-[#efefef]">
            <ProfileImage
              src={profile.image}
              alt={profile.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[15px] font-semibold text-[var(--text-primary)]">
              {profile.name}, {profile.age}
              <BadgeCheck
                size={15}
                className="fill-[#1d9bf0] text-[#1d9bf0] [&>path:last-child]:text-white"
              />
            </span>
            <span className="mt-0.5 block truncate text-[14px] text-[var(--text-secondary)]">
              {profile.job} · {profile.city}
            </span>
          </span>
          <span className="text-[13px] font-medium text-[#1d9bf0]">
            {profile.match}% match
          </span>
        </Link>
      ))}
    </div>
  );
}

function DiscoverTitle() {
  return (
    <header className="flex items-start justify-between">
      <div>
        <h1 className="text-[25px] font-bold tracking-[-.03em] max-md:text-[23px]">
          Discover
        </h1>
        <p className="mt-1 text-[12px] text-[#6e6e73] max-md:text-[13px]">
          Find meaningful connections
          <span className="max-md:hidden"> that match your preferences.</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex h-10 items-center gap-2 rounded-full border border-[#ebe8ee] px-5 text-[11px] font-semibold">
          <Filter size={15} />
          Filters
        </button>
        <button
          aria-label="Notifications"
          className="relative hidden size-10 place-items-center rounded-full border border-[#ebe8ee] md:grid"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#1d9bf0]" />
        </button>
      </div>
    </header>
  );
}
function MobileHeader() {
  return (
    <header className="relative z-10 flex h-[76px] items-center justify-between px-5 md:hidden">
      <Link
        href="/discover"
        className="w-[150px]"
        aria-label="Bandhanaa Discover"
      >
        <Brand compact />
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/matches?tab=shortlisted"
          aria-label="Shortlist"
          className="grid size-11 place-items-center rounded-full bg-white/70"
        >
          <Heart size={23} />
        </Link>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="grid size-11 place-items-center rounded-full bg-white/70"
        >
          <Bell size={23} />
        </Link>
      </div>
    </header>
  );
}
function ResultsToolbar({
  count,
  grid,
  onGrid,
  sort,
  onSort,
}: {
  count: number;
  grid: boolean;
  onGrid: (value: boolean) => void;
  sort: string;
  onSort: (value: string) => void;
}) {
  return (
    <div className="mt-7 flex items-center justify-between text-[11px]">
      <p>
        <strong>{count}</strong> Matches Found
      </p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-[#6e6e73]">
          <span className="max-md:hidden">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="appearance-none bg-transparent pr-5 font-medium outline-none"
          >
            <option>Recommended</option>
            <option>Age</option>
          </select>
          <ChevronDown size={13} className="-ml-5 pointer-events-none" />
        </label>
        <button
          onClick={() => onGrid(true)}
          aria-label="Grid view"
          className={`hidden size-9 place-items-center rounded-lg md:grid ${grid ? "bg-[#1d9bf0] text-white" : "bg-[#f7f5f8]"}`}
        >
          <LayoutDashboard size={16} />
        </button>
        <button
          onClick={() => onGrid(false)}
          aria-label="List view"
          className={`hidden size-9 place-items-center rounded-lg md:grid ${!grid ? "bg-[#ed3f9b] text-white" : "bg-[#f7f5f8]"}`}
        >
          <List size={17} />
        </button>
      </div>
    </div>
  );
}
function ConnectionReasons() {
  const items = [
    [Heart, "Similar Values"],
    [UserRound, "Similar Interests"],
    [LayoutDashboard, "Family Oriented"],
  ] as const;
  return (
    <section className="mt-7">
      <h2 className="text-[16px] font-bold">Why you’ll connect</h2>
      <div className="mt-3 grid grid-cols-3 rounded-xl border border-[#f0edf2] bg-[#fcfafc] p-3">
        {items.map(([Icon, label]) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2 border-r border-[#eeeaf0] px-1 text-[9px] last:border-0"
          >
            <Icon size={18} className="shrink-0 text-[#1d9bf0]" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
function SafetyBanner() {
  return (
    <section className="mt-7 flex items-center rounded-2xl bg-[#f0f8ff] px-5 py-4 max-md:hidden">
      <span className="grid size-11 place-items-center rounded-full bg-[#dff1fd] text-[#1d9bf0]">
        <ShieldCheck size={21} />
      </span>
      <div className="ml-4">
        <h2 className="text-[12px] font-bold">Your safety is our priority</h2>
        <p className="mt-1 text-[10px] text-[#6e6e73]">
          We verify all profiles manually to ensure a safe and genuine platform
          for meaningful connections.
        </p>
      </div>
      <button className="ml-auto text-[10px] font-semibold text-[#1d9bf0]">
        Learn more →
      </button>
    </section>
  );
}