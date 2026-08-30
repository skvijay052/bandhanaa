"use client";

import { useMemo, useState } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import type { InterestProfile, InterestTab } from "@/data/interests";
import { createClient } from "@/lib/supabase/client";
import { InterestOverviewCard } from "./InterestOverviewCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { InterestsPremiumCard } from "./PremiumCard";
import { ReceivedInterests } from "./ReceivedInterests";
import { SentInterests } from "./SentInterests";
import { InterestsTabs } from "./InterestsTabs";

export function InterestsClient({
  initialReceived,
  initialSent,
  viewerName,
  avatarUrl,
}: {
  initialReceived: InterestProfile[];
  initialSent: InterestProfile[];
  viewerName: string;
  avatarUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<InterestTab>("all");
  const [received, setReceived] = useState<InterestProfile[]>(initialReceived);
  const [sent] = useState<InterestProfile[]>(initialSent);
  const [notice, setNotice] = useState("");

  const visibleReceived = useMemo(
    () =>
      activeTab === "responded"
        ? received.filter((profile) => profile.status !== "new")
        : received,
    [activeTab, received],
  );
  const visibleSent = useMemo(
    () =>
      activeTab === "responded"
        ? sent.filter((profile) =>
            ["accepted", "declined"].includes(profile.status),
          )
        : sent,
    [activeTab, sent],
  );

  async function respond(id: string) {
    const profile = received.find((item) => item.id === id);
    if (!profile || profile.status === "accepted") return;

    const previousStatus = profile.status;
    setReceived((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "accepted" } : item,
      ),
    );
    setNotice(`You accepted ${profile.name}'s interest.`);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profile_likes")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("liker_id", profile.profileId)
      .eq("liked_id", user.id);

    if (error) {
      setReceived((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: previousStatus } : item,
        ),
      );
      setNotice("We couldn't save your response. Please try again.");
    }
  }

  const showReceived =
    activeTab === "all" ||
    activeTab === "received" ||
    activeTab === "responded";
  const showSent =
    activeTab === "all" || activeTab === "sent" || activeTab === "responded";
  const respondedCount = [...received, ...sent].filter((profile) =>
    ["accepted", "declined"].includes(profile.status),
  ).length;

  return (
    <div className="h-dvh bg-[var(--app-bg)]">
      <div className="app-shell">
        <AppSidebar active="Requests">
          <InterestOverviewCard
            sent={sent.length}
            received={received.length}
            responded={respondedCount}
          />
          <InterestsPremiumCard />
        </AppSidebar>
        <div className="app-workspace min-w-0 flex-1 overflow-y-auto pb-[72px] md:pb-0">
          <DesktopTopBar avatarUrl={avatarUrl} name={viewerName} />
          <div className="md:hidden">
            <AppHeader avatarUrl={avatarUrl} name={viewerName} />
          </div>
          <main>
            <PageHeader title="Interests" description="Manage sent and received interests." />
            <div className="px-9 pb-9 pt-3 max-md:px-4 max-md:pb-5 max-md:pt-3">
              <InterestsTabs
                active={activeTab}
                onChange={(tab) => {
                  setActiveTab(tab);
                  setNotice("");
                }}
              />
              {notice ? (
                <p
                  role="status"
                  className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
                >
                  {notice}
                </p>
              ) : null}
              <div className="mt-5 space-y-7 max-md:mt-6 max-md:space-y-6">
                {showReceived ? (
                  visibleReceived.length ? (
                    <ReceivedInterests
                      profiles={visibleReceived}
                      onRespond={respond}
                    />
                  ) : (
                    <EmptyState text="No received interests yet." />
                  )
                ) : null}
                {showSent ? (
                  visibleSent.length ? (
                    <SentInterests profiles={visibleSent} />
                  ) : (
                    <EmptyState text="No sent interests yet." />
                  )
                ) : null}
              </div>
            </div>
          </main>
        </div>
        <MobileBottomNavigation active="Interests" />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-[#72758a]">{text}</p>;
}
