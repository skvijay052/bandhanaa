"use client";

import { useEffect, useMemo, useState } from "react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { createClient } from "@/lib/supabase/client";
import { AdvancedDiscoverFilters } from "./AdvancedDiscoverFilters";
import { DiscoverDesktopExperience } from "./DiscoverDesktopExperience";
import { MobileDiscoverExperience } from "./MobileDiscoverExperience";
import type { DiscoverProfile } from "./types";

export type { DiscoverProfile } from "./types";

export function DiscoverClient({
  firstName: _firstName,
  avatarUrl: _avatarUrl,
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
  const [relationshipStates, setRelationshipStates] = useState<
    Record<string, DiscoverProfile["relationship"]>
  >(() =>
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

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return profiles
      .filter(
        (profile) =>
          !normalizedQuery ||
          `${profile.name} ${profile.job} ${profile.city} ${profile.age} ${profile.maritalStatus}`
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
      .filter(
        (profile) =>
          !profile.age || (profile.age >= minAge && profile.age <= maxAge),
      )
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

  const mobileProfiles =
    mobileMode === "online"
      ? filteredProfiles.filter((profile) => profile.online)
      : filteredProfiles;

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

      if (!error) {
        setRelationshipStates((current) => ({
          ...current,
          [profile.id]: "following",
        }));
      }
      return;
    }

    const { error } = await supabase
      .from("profile_likes")
      .insert({ liker_id: user.id, liked_id: profile.id, status: "pending" });

    if (!error) {
      setRelationshipStates((current) => ({
        ...current,
        [profile.id]: "outgoing_pending",
      }));
    }
  }

  function clearFilters() {
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
  }

  return (
    <div className="h-dvh bg-[#fbfbfb] max-md:bg-[#f8fafc]">
      {notice ? (
        <p
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full bg-[#111] px-5 py-2.5 text-center text-[12px] font-medium text-white shadow-lg"
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

            <DiscoverDesktopExperience
              profiles={filteredProfiles}
              allProfiles={profiles}
              query={query}
              onQuery={setQuery}
              filtersOpen={showFilters}
              onFilters={() => setShowFilters(true)}
              shortlisted={shortlisted}
              relationshipStates={relationshipStates}
              onShortlist={(id) => void toggleShortlist(id)}
              onRelationshipAction={(profile) =>
                void updateRelationship(profile)
              }
            />

            {showFilters ? (
              <AdvancedDiscoverFilters
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
                onClear={clearFilters}
                onApply={() => setShowFilters(false)}
              />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function heightInCentimeters(value: string) {
  const centimeters = value.match(/(\d{3})\s*cm/i);
  if (centimeters) return Number(centimeters[1]);

  const feet = value.match(/(\d)\s*['′]\s*(\d{1,2})?/);
  if (feet) {
    return Math.round(
      Number(feet[1]) * 30.48 + Number(feet[2] ?? 0) * 2.54,
    );
  }

  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : 0;
}
