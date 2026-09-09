"use client";

import {
  BriefcaseBusiness,
  GraduationCap,
  HeartHandshake,
  Languages,
  MapPin,
  RotateCcw,
  Ruler,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { profileFieldOptions } from "@/data/profile-field-options";
import type { DiscoverProfile } from "./types";

type Props = {
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
};

export function AdvancedDiscoverFilters(props: Props) {
  const unique = (values: string[]) =>
    [...new Set(values.filter((value) => value && value !== "Not added"))].sort();

  const locations = unique([
    ...profileFieldOptions("Location"),
    ...props.profiles.map((profile) => profile.city),
  ]);
  const professions = unique([
    ...profileFieldOptions("Profession"),
    ...props.profiles.map((profile) => profile.job),
  ]);
  const statuses = unique([
    ...profileFieldOptions("Marital Status"),
    ...props.profiles.map((profile) => profile.maritalStatus),
  ]);
  const religions = unique([
    ...profileFieldOptions("Religion"),
    ...props.profiles.map((profile) => profile.religion),
  ]);
  const languages = unique([
    ...profileFieldOptions("Mother Tongue"),
    ...props.profiles.map((profile) => profile.motherTongue),
  ]);
  const educations = unique([
    ...profileFieldOptions("Education"),
    ...props.profiles.map((profile) => profile.education),
  ]);
  const heights = Array.from(
    { length: 17 },
    (_, index) => `${140 + index * 5} cm`,
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close discover filters"
        onClick={props.onApply}
        className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px]"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="discover-filter-title"
        className="fixed left-1/2 top-1/2 z-[70] max-h-[88dvh] w-[min(980px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] border border-[#ece7ea] bg-white shadow-[0_28px_90px_rgba(17,17,17,.22)] max-md:inset-x-0 max-md:bottom-0 max-md:left-0 max-md:top-auto max-md:w-full max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-b-none"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#f0ecee] bg-white px-6 py-5">
          <div>
            <h2
              id="discover-filter-title"
              className="text-[20px] font-bold tracking-[-.025em] text-[#171717]"
            >
              Refine your matches
            </h2>
            <p className="mt-1 text-[12px] text-[#858085]">
              Choose the details that matter most to you.
            </p>
          </div>
          <button
            type="button"
            onClick={props.onApply}
            className="grid size-9 place-items-center rounded-full bg-[#f7f4f5] text-[#333]"
            aria-label="Close filters"
          >
            <X size={17} />
          </button>
        </header>

        <div className="px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FilterField icon={<MapPin size={16} />}>
              <FilterSelect
                label="Location"
                value={props.location}
                options={locations}
                onChange={props.onLocation}
              />
            </FilterField>
            <FilterField icon={<BriefcaseBusiness size={16} />}>
              <FilterSelect
                label="Profession"
                value={props.profession}
                options={professions}
                onChange={props.onProfession}
              />
            </FilterField>
            <FilterField icon={<HeartHandshake size={16} />}>
              <FilterSelect
                label="Marital Status"
                value={props.maritalStatus}
                options={statuses}
                onChange={props.onMaritalStatus}
              />
            </FilterField>
            <FilterField icon={<Sparkles size={16} />}>
              <FilterSelect
                label="Religion"
                value={props.religion}
                options={religions}
                onChange={props.onReligion}
              />
            </FilterField>
            <FilterField icon={<Languages size={16} />}>
              <FilterSelect
                label="Mother Tongue"
                value={props.motherTongue}
                options={languages}
                onChange={props.onMotherTongue}
              />
            </FilterField>
            <FilterField icon={<GraduationCap size={16} />}>
              <FilterSelect
                label="Education"
                value={props.education}
                options={educations}
                onChange={props.onEducation}
              />
            </FilterField>
          </div>

          <div className="mt-6 grid gap-5 border-t border-[#f0ecee] pt-6 md:grid-cols-2">
            <div>
              <span className="mb-2 block text-[12px] font-semibold text-[#292429]">
                Age range
              </span>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <input
                  type="number"
                  min={18}
                  max={props.maxAge}
                  value={props.minAge}
                  onChange={(event) =>
                    props.onMinAge(
                      Math.min(Number(event.target.value), props.maxAge),
                    )
                  }
                  className="h-11 rounded-xl border border-[#e5dfe2] px-3 text-[13px] outline-none focus:border-[#f3a4c8]"
                  aria-label="Minimum age"
                />
                <span className="text-[12px] text-[#999]">to</span>
                <input
                  type="number"
                  min={props.minAge}
                  max={100}
                  value={props.maxAge}
                  onChange={(event) =>
                    props.onMaxAge(
                      Math.max(Number(event.target.value), props.minAge),
                    )
                  }
                  className="h-11 rounded-xl border border-[#e5dfe2] px-3 text-[13px] outline-none focus:border-[#f3a4c8]"
                  aria-label="Maximum age"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#292429]">
                <Ruler size={15} className="text-[#e83e78]" /> Height
              </span>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <CompactSelect
                  value={props.minHeight}
                  options={heights}
                  onChange={props.onMinHeight}
                />
                <span className="text-[12px] text-[#999]">to</span>
                <CompactSelect
                  value={props.maxHeight}
                  options={heights}
                  onChange={props.onMaxHeight}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#f0ecee] pt-6">
            <span className="block text-[12px] font-semibold text-[#292429]">
              Quick filters
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              <QuickFilter
                label="Online now"
                active={props.quickFilters.includes("online")}
                onClick={() => props.onToggleQuick("online")}
              />
              <QuickFilter
                label="With photos"
                active={props.quickFilters.includes("photos")}
                onClick={() => props.onToggleQuick("photos")}
              />
              <QuickFilter
                label="Never married"
                active={props.quickFilters.includes("never-married")}
                onClick={() => props.onToggleQuick("never-married")}
              />
              <QuickFilter
                label="Working professionals"
                active={props.quickFilters.includes("working")}
                onClick={() => props.onToggleQuick("working")}
              />
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-3 border-t border-[#f0ecee] pt-5">
            <button
              type="button"
              onClick={props.onClear}
              className="flex h-11 items-center gap-2 rounded-xl border border-[#e6e0e3] px-5 text-[12px] font-semibold text-[#333]"
            >
              <RotateCcw size={15} /> Clear all
            </button>
            <button
              type="button"
              onClick={props.onApply}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#111] px-6 text-[12px] font-semibold text-white hover:bg-[#282828]"
            >
              <Search size={15} /> Show matches
            </button>
          </div>
        </div>
      </section>
    </>
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
    <div className="flex items-start gap-3">
      <span className="mt-5 grid size-8 shrink-0 place-items-center rounded-full bg-[#fff1f7] text-[#e83e78]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
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
      placeholder="Any"
      onChange={(nextValue) => onChange(nextValue === "Any" ? "" : nextValue)}
    />
  );
}

function CompactSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <SearchableSelect
      hideLabel
      label="Height"
      value={value}
      options={["Any", ...options]}
      placeholder="Any"
      onChange={(nextValue) => onChange(nextValue === "Any" ? "" : nextValue)}
    />
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
      className={`h-9 rounded-full border px-4 text-[11px] font-semibold transition ${active ? "border-[#f4a8cb] bg-[#fff1f7] text-[#d93278]" : "border-[#e6e0e3] bg-white text-[#666] hover:border-[#f4c3d9]"}`}
    >
      {label}
    </button>
  );
}
