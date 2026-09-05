"use client";

import { useMemo, useState } from "react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobilePageHeader } from "@/components/layout/MobilePageHeader";
import type { MatchProfile, MatchTab } from "@/data/matches";
import { createClient } from "@/lib/supabase/client";
import { MatchCard } from "./MatchCard";
import { MatchesTabs } from "./MatchesTabs";
import { MobileMatchesExperience } from "./MobileMatchesExperience";

export function MatchesClient({
  profiles,
  initialShortlisted,
  sentIds,
  receivedIds,
  followingIds,
  initialTab = "all",
}: {
  profiles: MatchProfile[];
  initialShortlisted: string[];
  sentIds: string[];
  receivedIds: string[];
  followingIds: string[];
  initialTab?: MatchTab;
}) {
  const [activeTab, setActiveTab] = useState<MatchTab>(initialTab);
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [notice, setNotice] = useState("");
  const [sentInterests, setSentInterests] = useState(sentIds);

  const visibleProfiles = useMemo(() => {
    let result = profiles;
    if (activeTab === "shortlisted")
      result = result.filter((profile) => shortlisted.includes(profile.id));
    if (activeTab === "sent")
      result = result.filter((profile) => sentInterests.includes(profile.id));
    if (activeTab === "received")
      result = result.filter((profile) => receivedIds.includes(profile.id));
    return result;
  }, [activeTab, profiles, receivedIds, sentInterests, shortlisted]);

  async function sendInterest(profile: MatchProfile) {
    if (sentInterests.includes(profile.id)) return;
    setSentInterests((items) => [...items, profile.id]);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profile_likes")
      .insert({ liker_id: user.id, liked_id: profile.id, status: "pending" });
    if (error) {
      setSentInterests((items) => items.filter((id) => id !== profile.id));
      setNotice("We couldn't send that interest. Please try again.");
    } else setNotice(`Interest sent to ${profile.name}.`);
  }

  async function toggleShortlist(profile: MatchProfile) {
    const exists = shortlisted.includes(profile.id);
    setShortlisted((items) =>
      exists ? items.filter((id) => id !== profile.id) : [...items, profile.id],
    );
    setNotice(
      exists
        ? `${profile.name} was removed from your shortlist.`
        : `${profile.name} was added to your shortlist.`,
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
          .eq("profile_id", profile.id)
      : await supabase
          .from("profile_shortlists")
          .insert({ user_id: user.id, profile_id: profile.id });
    if (result.error) {
      setShortlisted((items) =>
        exists
          ? [...items, profile.id]
          : items.filter((id) => id !== profile.id),
      );
      setNotice("We couldn't save that action. Please try again.");
    }
  }

  return (
    <div className="h-dvh bg-[var(--app-bg)]">
      <div className="app-shell">
        <AppSidebar
          active={activeTab === "shortlisted" ? "Shortlist" : "Matches"}
        />
        <div className="app-workspace min-w-0 flex-1 overflow-y-auto pb-[72px] md:pb-8">
          <div className="hidden">
            <MobilePageHeader
              title="Matches"
              description="People who match your preferences"
            />
          </div>
          <main className="px-0 pb-8 md:px-8 md:pt-7">
            <MobileMatchesExperience
              profiles={visibleProfiles}
              shortlisted={shortlisted}
              sentIds={sentInterests}
              followingIds={followingIds}
              onShortlist={(profile) => void toggleShortlist(profile)}
              onInterest={(profile) => void sendInterest(profile)}
            />
            <header className="hidden md:block">
              <h1 className="text-[28px] font-bold tracking-[-0.025em] text-[#0f1419]">
                Matches
              </h1>
              <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
                People who match your preferences
              </p>
            </header>

            <div className="mt-3 hidden md:mt-5 md:block">
              <MatchesTabs
                active={activeTab}
                onChange={(tab) => {
                  setActiveTab(tab);
                  setNotice("");
                }}
              />
            </div>

            <div className="mt-7 hidden items-end justify-between md:flex">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-[19px] font-semibold text-[#0f1419]">
                    Top Matches for You
                  </h2>
                  <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#1d9bf0] px-2 text-[12px] font-semibold text-white">
                    {visibleProfiles.length}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  Based on your preferences and activity
                </p>
              </div>
            </div>

            {notice ? (
              <p
                role="status"
                className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-[#0f1419] px-4 py-2 text-[12px] text-white shadow-lg"
              >
                {notice}
              </p>
            ) : null}

            {visibleProfiles.length ? (
              <div className="mt-6 hidden grid-cols-2 gap-4 md:grid xl:grid-cols-4">
                {visibleProfiles.map((profile, index) => (
                  <MatchCard
                    key={profile.id}
                    profile={profile}
                    shortlisted={shortlisted.includes(profile.id)}
                    onShortlist={() => void toggleShortlist(profile)}
                    priority={index < 4}
                  />
                ))}
              </div>
            ) : (
              <div className="hidden min-h-[360px] place-items-center text-center md:grid">
                <div>
                  <h2 className="text-[19px] font-semibold">
                    No matches here yet
                  </h2>
                  <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                    Try another tab to discover more profiles.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
