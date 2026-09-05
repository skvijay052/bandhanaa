"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronDown,
  Filter,
  Heart,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  MessageCircle,
  Languages,
  MapPin,
  MessageSquare,
  RotateCcw,
  Ruler,
  Search,
  SlidersHorizontal,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  UserRoundSearch,
  X,
} from "lucide-react";
import { Brand } from "@/components/auth/Brand";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { profileFieldOptions } from "@/data/profile-field-options";
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
  const [notice, setNotice] = useState("");
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
  const [religion, setReligion] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [education, setEducation] = useState("");
  const [minHeight, setMinHeight] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
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
      .filter((profile) => !religion || profile.religion === religion)
      .filter(
        (profile) => !motherTongue || profile.motherTongue === motherTongue,
      )
      .filter((profile) => !education || profile.education === education)
      .filter((profile) => {
        const height = heightInCentimeters(profile.height);
        return (
          (!minHeight || height >= Number.parseInt(minHeight, 10)) &&
          (!maxHeight || height <= Number.parseInt(maxHeight, 10))
        );
      })
      .filter((profile) => !quickFilters.includes("online") || profile.online)
      .filter(
        (profile) => !quickFilters.includes("photos") || profile.photoCount > 0,
      )
      .filter(
        (profile) =>
          !quickFilters.includes("never-married") ||
          /never|unmarried|single/i.test(profile.maritalStatus),
      )
      .filter(
        (profile) =>
          !quickFilters.includes("working") ||
          Boolean(profile.job && profile.job !== "Not added"),
      )
      .filter((profile) => profile.age >= minAge && profile.age <= maxAge)
      .sort((a, b) => b.match - a.match);
  }, [
    education,
    location,
    maritalStatus,
    maxAge,
    maxHeight,
    minAge,
    minHeight,
    motherTongue,
    profession,
    profiles,
    query,
    quickFilters,
    religion,
  ]);
  const cardProfiles = query.trim() ? profiles : list;
  const mobileProfiles = (
    mobileMode === "online" ? list.filter((profile) => profile.online) : list
  ).filter((profile) => !hiddenProfiles.includes(profile.id));
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function toggleShortlist(id: string) {
    const exists = shortlisted.includes(id);
    const profileName =
      profiles.find((profile) => profile.id === id)?.name ?? "Profile";
    setShortlisted((items) =>
      exists ? items.filter((item) => item !== id) : [...items, id],
    );
    setNotice(
      exists
        ? `${profileName} was removed from your shortlist.`
        : `${profileName} was added to your shortlist.`,
    );

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setShortlisted((items) =>
        exists ? [...items, id] : items.filter((item) => item !== id),
      );
      setNotice("Please sign in to update your shortlist.");
      return;
    }
    const result = exists
      ? await supabase
          .from("profile_shortlists")
          .delete()
          .eq("user_id", user.id)
          .eq("profile_id", id)
      : await supabase
          .from("profile_shortlists")
          .insert({ user_id: user.id, profile_id: id });
    if (result.error) {
      setShortlisted((items) =>
        exists ? [...items, id] : items.filter((item) => item !== id),
      );
      setNotice("We couldn't save that action. Please try again.");
    }
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
      {notice ? (
        <p
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full bg-[#0f1419] px-5 py-2.5 text-center text-[12px] font-medium text-white shadow-lg"
        >
          {notice}
        </p>
      ) : null}
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
                  className="fixed inset-0 z-[60] bg-[#111827]/45 backdrop-blur-[2px]"
                />
                <AdvancedFilters
                  location={location}
                  profession={profession}
                  maritalStatus={maritalStatus}
                  religion={religion}
                  motherTongue={motherTongue}
                  education={education}
                  minHeight={minHeight}
                  maxHeight={maxHeight}
                  quickFilters={quickFilters}
                  minAge={minAge}
                  maxAge={maxAge}
                  profiles={profiles}
                  onLocation={setLocation}
                  onProfession={setProfession}
                  onMaritalStatus={setMaritalStatus}
                  onReligion={setReligion}
                  onMotherTongue={setMotherTongue}
                  onEducation={setEducation}
                  onMinHeight={setMinHeight}
                  onMaxHeight={setMaxHeight}
                  onToggleQuick={(filter) =>
                    setQuickFilters((current) =>
                      current.includes(filter)
                        ? current.filter((item) => item !== filter)
                        : [...current, filter],
                    )
                  }
                  onMinAge={setMinAge}
                  onMaxAge={setMaxAge}
                  onClear={() => {
                    setLocation("");
                    setProfession("");
                    setMaritalStatus("");
                    setReligion("");
                    setMotherTongue("");
                    setEducation("");
                    setMinHeight("");
                    setMaxHeight("");
                    setQuickFilters([]);
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
                <div className="mt-6 hidden grid-cols-2 gap-4 md:grid xl:grid-cols-4">
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
    <div className="relative z-40 hidden md:block">
      <div className="flex items-center gap-3">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#e3e5ef] bg-white px-4 text-[#69738e] shadow-none transition focus-within:border-[#e3e5ef] focus-within:ring-0">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search by name, profession, location..."
            aria-label="Search profiles"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[#7a849d]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="grid size-7 place-items-center rounded-full bg-[#edeff5] text-[#5d667d]"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          ) : null}
        </label>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#ddd8ea] bg-transparent px-4 text-[12px] font-semibold text-black shadow-none transition hover:border-[#ddd8ea] hover:bg-transparent"
        >
          <SlidersHorizontal size={16} />
          Advanced Filters
          <ChevronDown
            size={16}
            className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {query.trim() ? <SearchResults profiles={suggestions} /> : null}
    </div>
  );
}
function AdvancedFilters({
  location,
  profession,
  maritalStatus,
  religion,
  motherTongue,
  education,
  minHeight,
  maxHeight,
  quickFilters,
  minAge,
  maxAge,
  profiles,
  onLocation,
  onProfession,
  onMaritalStatus,
  onReligion,
  onMotherTongue,
  onEducation,
  onMinHeight,
  onMaxHeight,
  onToggleQuick,
  onMinAge,
  onMaxAge,
  onClear,
  onApply,
}: {
  location: string;
  profession: string;
  maritalStatus: string;
  religion: string;
  motherTongue: string;
  education: string;
  minHeight: string;
  maxHeight: string;
  quickFilters: string[];
  minAge: number;
  maxAge: number;
  profiles: DiscoverProfile[];
  onLocation: (value: string) => void;
  onProfession: (value: string) => void;
  onMaritalStatus: (value: string) => void;
  onReligion: (value: string) => void;
  onMotherTongue: (value: string) => void;
  onEducation: (value: string) => void;
  onMinHeight: (value: string) => void;
  onMaxHeight: (value: string) => void;
  onToggleQuick: (value: string) => void;
  onMinAge: (value: number) => void;
  onMaxAge: (value: number) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const unique = (values: string[]) =>
    [
      ...new Set(values.filter((value) => value && value !== "Not added")),
    ].sort();
  const locations = unique([
    ...profileFieldOptions("Location"),
    ...profiles.map((profile) => profile.city),
  ]);
  const professions = unique([
    ...profileFieldOptions("Profession"),
    ...profiles.map((profile) => profile.job),
  ]);
  const statuses = unique([
    ...profileFieldOptions("Marital Status"),
    ...profiles.map((profile) => profile.maritalStatus),
  ]);
  const religions = unique([
    ...profileFieldOptions("Religion"),
    ...profiles.map((profile) => profile.religion),
  ]);
  const languages = unique([
    ...profileFieldOptions("Mother Tongue"),
    ...profiles.map((profile) => profile.motherTongue),
  ]);
  const educations = unique([
    ...profileFieldOptions("Education"),
    ...profiles.map((profile) => profile.education),
  ]);
  const heights = Array.from(
    { length: 15 },
    (_, index) => `${140 + index * 5} cm`,
  );

  return (
    <section
      className="fixed left-1/2 top-1/2 z-[70] max-h-[86dvh] w-[min(1080px,calc(100vw-64px))] -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-[22px] border border-[#e4e3ee] bg-white shadow-[0_24px_80px_rgba(15,20,40,.24)] [&_.form-control]:!mt-1 [&_.form-control]:!h-9 [&_.form-control]:!min-h-9 [&_.form-control]:!rounded-lg [&_.form-control]:!px-3 [&_.form-control]:!text-[11px] [&_.form-control+div]:!z-[100] [&_.form-control+div]:!min-w-full [&_.form-control+div]:!max-w-full [&_.form-label]:!mb-1 [&_.form-label]:!text-[11px] max-md:inset-x-0 max-md:bottom-0 max-md:left-0 max-md:top-auto max-md:max-h-[82dvh] max-md:w-full max-md:overflow-y-auto max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-b-none max-md:rounded-t-[24px]"
      aria-label="Advanced profile filters"
    >
      <header className="flex items-center justify-between border-b border-[#ecebf2] px-5 py-2.5 max-md:px-5">
        <div>
          <h2 className="text-[17px] font-bold tracking-[-.02em] text-[#11182d]">
            Find Your Perfect Match
          </h2>
          <p className="mt-0.5 text-[11px] text-[#68718b]">
            Use filters to find people who match your preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-[11px] italic text-[#8a8faa] xl:flex">
            <Heart size={17} className="text-pink-500" />
            Meaningful people. Brighter tomorrows.
          </span>
          <button
            type="button"
            onClick={onApply}
            aria-label="Close filters"
            className="grid size-8 place-items-center rounded-full bg-[#f3efff] text-[#4f2aa5]"
          >
            <ChevronDown size={16} className="rotate-180" />
          </button>
        </div>
      </header>

      <div className="px-5 py-3.5 max-md:px-5">
        <div className="grid gap-x-3 gap-y-2 lg:grid-cols-4">
          <FilterField icon={<MapPin />}>
            <FilterSelect
              label="Location"
              value={location}
              options={locations}
              onChange={onLocation}
            />
          </FilterField>
          <FilterField icon={<BriefcaseBusiness />}>
            <FilterSelect
              label="Profession"
              value={profession}
              options={professions}
              onChange={onProfession}
            />
          </FilterField>
          <FilterField icon={<HeartHandshake />}>
            <FilterSelect
              label="Marital Status"
              value={maritalStatus}
              options={statuses}
              onChange={onMaritalStatus}
            />
          </FilterField>
          <FilterField icon={<UserRound />}>
            <AgeRange
              minAge={minAge}
              maxAge={maxAge}
              onMinAge={onMinAge}
              onMaxAge={onMaxAge}
            />
          </FilterField>

          <FilterField icon={<Sparkles />}>
            <FilterSelect
              label="Religion"
              value={religion}
              options={religions}
              onChange={onReligion}
            />
          </FilterField>
          <FilterField icon={<Languages />}>
            <FilterSelect
              label="Mother Tongue"
              value={motherTongue}
              options={languages}
              onChange={onMotherTongue}
            />
          </FilterField>
          <FilterField icon={<GraduationCap />}>
            <FilterSelect
              label="Education"
              value={education}
              options={educations}
              onChange={onEducation}
            />
          </FilterField>
          <FilterField icon={<Ruler />}>
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold text-[#11182d]">
                Height
              </span>
              <div className="flex items-center gap-2">
                <CompactSelect
                  value={minHeight}
                  options={heights}
                  placeholder="Any"
                  onChange={onMinHeight}
                />
                <span className="text-xs text-[#68718b]">to</span>
                <CompactSelect
                  value={maxHeight}
                  options={heights}
                  placeholder="Any"
                  onChange={onMaxHeight}
                />
              </div>
            </div>
          </FilterField>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[#ecebf2] pt-3.5">
          <span className="mr-1 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#f3efff] px-3 text-[12px] font-semibold text-[#3d287e]">
            <Sparkles size={15} /> Quick Filters
          </span>
          <QuickFilter
            label="Online Now"
            active={quickFilters.includes("online")}
            onClick={() => onToggleQuick("online")}
          />
          <QuickFilter
            label="With Photos"
            active={quickFilters.includes("photos")}
            onClick={() => onToggleQuick("photos")}
          />
          <QuickFilter
            label="Never Married"
            active={quickFilters.includes("never-married")}
            onClick={() => onToggleQuick("never-married")}
          />
          <QuickFilter
            label="Working Professionals"
            active={quickFilters.includes("working")}
            onClick={() => onToggleQuick("working")}
          />

          <div className="ml-auto flex gap-2 max-md:mt-3 max-md:w-full">
            <button
              type="button"
              onClick={onClear}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#f5f4fa] px-4 text-[11px] font-semibold text-[#22283b] max-md:flex-1"
            >
              <RotateCcw size={16} /> Clear All
            </button>
            <button
              type="button"
              onClick={onApply}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-black px-5 text-[11px] font-semibold text-white shadow-[0_7px_18px_rgba(15,15,15,.18)] hover:bg-[#222] max-md:flex-1"
            >
              <Search size={17} /> Search Profiles
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterField({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <span
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#f4f0ff] text-[#5d36c6] [&_svg]:size-[16px]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function AgeRange({
  minAge,
  maxAge,
  onMinAge,
  onMaxAge,
}: {
  minAge: number;
  maxAge: number;
  onMinAge: (value: number) => void;
  onMaxAge: (value: number) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#11182d]">
        Age Range
      </span>
      <div className="flex items-center gap-2">
        <input
          aria-label="Minimum age"
          type="number"
          min={18}
          max={maxAge}
          value={minAge}
          onChange={(event) =>
            onMinAge(Math.min(Number(event.target.value), maxAge))
          }
          className="h-9 min-w-0 w-full rounded-lg border border-[#dfe2ec] px-2 text-center text-[12px] outline-none focus:border-[#8b5cf6]"
        />
        <span className="text-xs text-[#68718b]">to</span>
        <input
          aria-label="Maximum age"
          type="number"
          min={minAge}
          max={100}
          value={maxAge}
          onChange={(event) =>
            onMaxAge(Math.max(Number(event.target.value), minAge))
          }
          className="h-9 min-w-0 w-full rounded-lg border border-[#dfe2ec] px-2 text-center text-[12px] outline-none focus:border-[#8b5cf6]"
        />
      </div>
    </div>
  );
}

function CompactSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <SearchableSelect
        hideLabel
        label="Height"
        value={value}
        options={options}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
function QuickFilter({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-full border px-3 text-[11px] font-medium transition ${active ? "border-[#8b5cf6] bg-[#ede9fe] text-[#4c1d95]" : "border-transparent bg-[#f5f4fa] text-[#525b73] hover:border-[#d8cdf8]"}`}
    >
      {label}
    </button>
  );
}

function heightInCentimeters(value: string) {
  const centimeters = value.match(/(\d{3})\s*cm/i);
  if (centimeters) return Number(centimeters[1]);
  const feet = value.match(/(\d)\s*['′]\s*(\d{1,2})?/);
  if (feet)
    return Math.round(Number(feet[1]) * 30.48 + Number(feet[2] ?? 0) * 2.54);
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : 0;
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
      <div className="flex items-center gap-3">
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
