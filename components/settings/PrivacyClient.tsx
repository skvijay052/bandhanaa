"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileClock,
  MessageSquare,
  Shield,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { PrivacySettings } from "@/data/privacy";
import { createClient } from "@/lib/supabase/client";
import { SettingsNavigation } from "./SettingsNavigation";
export function PrivacyClient({
  initial,
}: {
  initial: PrivacySettings;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [error, setError] = useState("");
  async function update<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K],
  ) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    const column = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    const { error: failure } = await createClient()
      .from("user_privacy_settings")
      .upsert(
        { user_id: settings.userId, [column]: value },
        { onConflict: "user_id" },
      );
    if (failure) setError(failure.message);
  }
  return (
    <main className="fixed inset-0 overflow-hidden bg-[var(--app-bg)]">
      <div className="app-shell edit-profile-shell !h-full">
        <AppSidebar active="Settings" />
        <div className="grid h-full min-h-0 min-w-0 flex-1 md:grid-cols-[340px_minmax(0,1fr)]">
            <SettingsNavigation active="Settings & Privacy" />
            <div className="h-full min-h-0 overflow-y-auto px-6 pb-10 max-md:px-4">
              <div className="mx-auto w-full max-w-[780px] py-6 md:py-8">
              <header className="flex items-center md:hidden">
                <button onClick={() => router.back()}>
                  <ArrowLeft size={20} />
                </button>
                <h1 className="mx-auto pr-5 text-[15px] font-bold">
                  Settings &amp; Privacy
                </h1>
              </header>
              <header className="hidden md:block">
                <h1 className="text-[24px] font-bold tracking-[-0.02em]">
                  Settings &amp; Privacy
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[var(--text-secondary)]">
                  Manage your privacy, data and safety.
                </p>
              </header>
              <SettingsSection title="Privacy">
                <ValueRow
                  icon={Eye}
                  title="Profile Visibility"
                  subtitle="Control who can see your profile"
                  value={
                    settings.profileVisibility === "everyone"
                      ? "Everyone"
                      : "Matches"
                  }
                  onClick={() =>
                    void update(
                      "profileVisibility",
                      settings.profileVisibility === "everyone"
                        ? "matches"
                        : "everyone",
                    )
                  }
                />
                <ValueRow
                  icon={Clock3}
                  title="Last Seen"
                  subtitle="Control who can see your last seen time"
                  value={
                    settings.lastSeenVisibility === "matches"
                      ? "Matches"
                      : "Everyone"
                  }
                  onClick={() =>
                    void update(
                      "lastSeenVisibility",
                      settings.lastSeenVisibility === "matches"
                        ? "everyone"
                        : "matches",
                    )
                  }
                />
                <ToggleRow
                  icon={MessageSquare}
                  title="Read Receipts"
                  subtitle="Let others know when you've read their messages"
                  checked={settings.readReceipts}
                  onChange={(value) => void update("readReceipts", value)}
                />
                <ToggleRow
                  icon={Eye}
                  title="Show Online Status"
                  subtitle="Let others know when you are online"
                  checked={settings.showOnlineStatus}
                  onChange={(value) => void update("showOnlineStatus", value)}
                />
                <ToggleRow
                  icon={Shield}
                  title="Hide My Age"
                  subtitle="Do not show my age on my profile"
                  checked={settings.hideAge}
                  onChange={(value) => void update("hideAge", value)}
                />
              </SettingsSection>
              <SettingsSection title="Data & Activity">
                <ValueRow
                  icon={Download}
                  title="Download My Data"
                  subtitle="Get a copy of your account data"
                />
                <ValueRow
                  icon={FileClock}
                  title="Activity Log"
                  subtitle="See your recent activity"
                />
              </SettingsSection>
              <SettingsSection title="Safety">
                <Link href="/settings/report-block" className="block">
                  <ValueRow
                    icon={Shield}
                    title="Report / Block"
                    subtitle="Report or block a member"
                    highlighted
                  />
                </Link>
                <ValueRow
                  icon={Shield}
                  title="Two-Step Verification"
                  subtitle="Add an extra layer of security"
                  value={settings.twoStepVerification ? "On" : "Off"}
                  onClick={() =>
                    void update(
                      "twoStepVerification",
                      !settings.twoStepVerification,
                    )
                  }
                />
              </SettingsSection>
              {error ? (
                <p role="alert" className="mt-4 text-[11px] text-red-600">
                  {error}
                </p>
              ) : null}
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}
function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h2 className="mb-3 text-[17px] font-semibold">{title}</h2>
      <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] bg-white">
        {children}
      </div>
    </section>
  );
}
function ValueRow({
  icon: Icon,
  title,
  subtitle,
  value,
  onClick,
  highlighted = false,
}: {
  icon: typeof Eye;
  title: string;
  subtitle: string;
  value?: string;
  onClick?: () => void;
  highlighted?: boolean;
}) {
  const content = (
    <div
      className={`flex min-h-[74px] items-center px-1 transition-colors hover:bg-[#f7f9f9] ${highlighted ? "text-[#0f1419]" : ""}`}
    >
      <Icon size={21} strokeWidth={1.8} />
      <div className="ml-4">
        <strong className="text-[15px] font-normal">{title}</strong>
        <p className="mt-0.5 text-[12px] font-normal text-[var(--text-secondary)]">{subtitle}</p>
      </div>
      {value ? (
        <span className="ml-auto text-[13px] font-normal text-[var(--text-secondary)]">{value}</span>
      ) : null}
      <ChevronRight size={18} className="ml-2" />
    </div>
  );
  return onClick ? (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  ) : (
    content
  );
}
function ToggleRow({
  icon: Icon,
  title,
  subtitle,
  checked,
  onChange,
}: {
  icon: typeof Eye;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (x: boolean) => void;
}) {
  return (
    <div className="flex min-h-[74px] items-center px-1">
      <Icon size={21} strokeWidth={1.8} />
      <div className="ml-4">
        <strong className="text-[15px] font-normal">{title}</strong>
        <p className="mt-0.5 text-[12px] font-normal text-[var(--text-secondary)]">{subtitle}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative ml-auto h-[30px] w-[50px] shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d9bf0] ${checked ? "bg-[#0f1419]" : "bg-[#8b949e]"}`}
      >
        <span className={`absolute left-0 top-[3px] size-6 rounded-full bg-white transition-transform ${checked ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
      </button>
    </div>
  );
}
