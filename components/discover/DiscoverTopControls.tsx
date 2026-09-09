"use client";

import Link from "next/link";
import { BadgeCheck, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import type { DiscoverProfile } from "./types";

export function DiscoverTopControls({
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

function SearchResults({ profiles }: { profiles: DiscoverProfile[] }) {
  if (!profiles.length) {
    return (
      <div className="absolute inset-x-0 top-[58px] z-50 rounded-2xl border border-[#cfd9de] bg-white px-5 py-8 text-center text-[14px] text-[var(--text-secondary)] shadow-[0_12px_36px_rgba(15,20,25,.14)]">
        No profiles match your search.
      </div>
    );
  }

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
              {profile.name}, {profile.age || "Age hidden"}
              <BadgeCheck
                size={15}
                className="fill-[#f34ca4] text-[#f34ca4] [&>path:last-child]:text-white"
              />
            </span>
            <span className="mt-0.5 block truncate text-[14px] text-[var(--text-secondary)]">
              {profile.job} · {profile.city}
            </span>
          </span>
          <span className="text-[13px] font-medium text-[#f34ca4]">
            {profile.match}% match
          </span>
        </Link>
      ))}
    </div>
  );
}
