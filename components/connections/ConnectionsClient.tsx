"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { ConnectionProfile } from "@/data/connections";
import { createClient } from "@/lib/supabase/client";
import { ActiveConnectionCard } from "./ActiveConnectionCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConnectionSectionHeader } from "./ConnectionSectionHeader";
import { ConnectionTabs } from "./ConnectionTabs";
import { MobileConnectionRow } from "./MobileConnectionRow";
import { PendingConnectionCard } from "./PendingConnectionCard";
export function ConnectionsClient({
  connections,
  currentUserId,
  blockedCount,
}: {
  connections: ConnectionProfile[];
  currentUserId: string;
  blockedCount: number;
}) {
  const router = useRouter();
  const activeProfiles = connections.filter((x) => x.status === "active");
  const pendingProfiles = connections.filter((x) => x.status === "pending");
  const [tab, setTab] = useState("All");
  const [updating, setUpdating] = useState<Set<string>>(() => new Set());
  const acceptRequest = async (profile: ConnectionProfile) => {
    if (profile.requestDirection !== "received") return;
    setUpdating((current) => new Set(current).add(profile.id));
    const supabase = createClient();
    const { error } = await supabase
      .from("profile_likes")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("liker_id", profile.interestLikerId)
      .eq("liked_id", currentUserId);
    if (!error) router.refresh();
    setUpdating((current) => { const next = new Set(current); next.delete(profile.id); return next; });
  };
  const showActive =
    tab === "All" || tab === "Active" || tab === "Our Connections";
  const showPending = tab === "All" || tab === "Pending";
  return (
    <main className="h-dvh overflow-hidden bg-[var(--app-bg)]">
      <div className="app-shell">
        <AppSidebar active="Requests" />
        <div className="flex min-w-0 flex-1">
          <div className="min-w-0 flex-1 overflow-y-auto pb-[72px] md:pb-5">
            <div className="hidden md:block">
              <PageHeader title="Connections" description="Manage and nurture your connections in one place." />
              <ConnectionTabs active={tab} onChange={setTab} />
              <div className="px-7 pt-4 md:px-8">
                {showActive ? (
                  <section>
                    <ConnectionSectionHeader
                      title="Active Connections"
                      description="People you are actively connected with."
                      status="active"
                    />
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {activeProfiles.map((profile) => (
                        <ActiveConnectionCard
                          key={profile.id}
                          profile={profile}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
                {showPending ? (
                  <section className="mt-6">
                    <ConnectionSectionHeader
                      title="Pending Connections"
                      description="Incoming and sent connection requests."
                      status="pending"
                    />
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {pendingProfiles.map((profile) => (
                        <PendingConnectionCard
                          key={profile.id}
                          profile={profile}
                          sent={profile.requestDirection === "sent" || updating.has(profile.id)}
                          actionLabel={profile.requestDirection === "received" ? "Accept request" : "Request sent"}
                          onSayHello={() => void acceptRequest(profile)}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
                {!showActive && !showPending ? (
                  <p className="py-20 text-center text-sm text-[#667085]">
                    No connections in this category yet.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="md:hidden">
              <PageHeader title="Connections" description="Manage your connections." />
              <ConnectionTabs active={tab} onChange={setTab} mobile />
              <div className="px-4 pt-4">
                {showActive ? (
                  <section>
                    <ConnectionSectionHeader
                      title="Active Connections"
                      description=""
                      status="active"
                    />
                    {activeProfiles.map((profile) => (
                      <MobileConnectionRow key={profile.id} profile={profile} />
                    ))}
                  </section>
                ) : null}
                {showPending ? (
                  <section className="mt-5">
                    <ConnectionSectionHeader
                      title="Pending Connections"
                      description=""
                      status="pending"
                    />
                    {pendingProfiles.slice(0, 3).map((profile) => (
                      <MobileConnectionRow
                        key={profile.id}
                        profile={profile}
                        pending
                        sent={profile.requestDirection === "sent" || updating.has(profile.id)}
                        actionLabel={profile.requestDirection === "received" ? "Accept" : "Requested"}
                        onSayHello={() => void acceptRequest(profile)}
                      />
                    ))}
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <MobileBottomNavigation active="Connections" connectionsLast />
      </div>
    </main>
  );
}
