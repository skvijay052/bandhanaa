"use client";
import { ProfileImage } from "@/components/ui/ProfileImage";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Flag, UserRoundX } from "lucide-react";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { ReportTarget } from "@/data/privacy";
import { createClient } from "@/lib/supabase/client";
const reasons = [
  ["inappropriate_photos", "Inappropriate Photos"],
  ["abusive_behavior", "Abusive or Offensive Behavior"],
  ["fake_profile", "Fake Profile"],
  ["scam_or_fraud", "Scam or Fraud"],
  ["other", "Other"],
] as const;
export function ReportBlockClient({
  target,
  currentUserId,
}: {
  target: ReportTarget;
  currentUserId: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function report() {
    if (!reason) {
      setNotice("Choose a reason before submitting.");
      return;
    }
    setSubmitting(true);
    const { error } = await createClient()
      .from("member_reports")
      .insert({
        reporter_id: currentUserId,
        reported_id: target.id,
        reason,
        details: details.trim() || null,
      });
    setSubmitting(false);
    setNotice(
      error
        ? error.message
        : "Report submitted. Our safety team will review it.",
    );
  }
  async function block() {
    const { error } = await createClient()
      .from("blocked_users")
      .upsert({ blocker_id: currentUserId, blocked_id: target.id });
    setNotice(error ? error.message : `${target.name} has been blocked.`);
  }
  return (
    <main className="h-dvh bg-[var(--background)] pb-[72px] md:pb-0">
      <div className="app-shell">
        <AppSidebar active="Settings" />
      <div className="mx-auto h-dvh w-full max-w-[720px] overflow-y-auto border-x border-[var(--border)] bg-[var(--surface)]">
        <header className="flex h-[64px] items-center border-b border-[#eeeef2] px-4">
          <button onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="mx-auto pr-5 text-[15px] font-bold">Report / Block</h1>
        </header>
        <div className="px-4 pb-8">
          <section className="mt-5 flex rounded-xl border border-[#eeeef2] p-4">
            <span className="relative size-[105px] shrink-0 overflow-hidden rounded-lg">
              <ProfileImage
                src={target.avatar}
                alt={target.name}
                fill
                sizes="105px"
                className="object-cover"
              />
            </span>
            <div className="ml-4">
              <h2 className="text-[14px] font-bold">{target.name}</h2>
              <p className="mt-2 text-[10px] text-[#596077]">
                {target.age} &nbsp;•&nbsp; {target.city}
              </p>
              <p className="mt-3 text-[10px] text-[#596077]">
                {target.profession}
                {target.company ? ` at ${target.company}` : ""}
              </p>
              <Link
                href={`/profile/${target.id}`}
                className="mt-4 inline-flex h-8 items-center rounded-lg border border-[#cfd2dc] px-3 text-[10px] font-semibold"
              >
                View Profile
              </Link>
            </div>
          </section>
          <h2 className="mt-8 text-[15px] font-bold">
            What would you like to do?
          </h2>
          <section className="mt-3 overflow-hidden rounded-xl border border-[#eeeef2]">
            <button
              onClick={() =>
                document
                  .getElementById("report-reasons")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex min-h-[78px] w-full items-center px-4 text-left"
            >
              <span className="grid size-12 place-items-center rounded-full bg-[#fff0f7] text-[#ff1682]">
                <Flag />
              </span>
              <span className="ml-3">
                <strong className="text-[11px]">Report</strong>
                <span className="mt-1 block text-[9px] leading-4 text-[#596077]">
                  Report this profile or member
                  <br />
                  for inappropriate behavior.
                </span>
              </span>
              <ChevronRight className="ml-auto" size={16} />
            </button>
            <button
              onClick={() => void block()}
              className="flex min-h-[78px] w-full items-center border-t border-[#eeeef2] px-4 text-left"
            >
              <span className="grid size-12 place-items-center rounded-full bg-[#fff0f7] text-[#ff1682]">
                <UserRoundX />
              </span>
              <span className="ml-3">
                <strong className="text-[11px]">Block</strong>
                <span className="mt-1 block text-[9px] leading-4 text-[#596077]">
                  Block this member. You won't see
                  <br />
                  them in your matches or messages.
                </span>
              </span>
              <ChevronRight className="ml-auto" size={16} />
            </button>
          </section>
          <section id="report-reasons" className="mt-7">
            <h2 className="text-[13px] font-bold">
              Why are you reporting this member?
            </h2>
            <div className="mt-3 space-y-3">
              {reasons.map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 text-[10px]"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="size-4 accent-[#ff1682]"
                  />
                  {label}
                </label>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              placeholder="Write details (optional)"
              className="mt-4 h-12 w-full rounded-lg border border-[#d9dce5] p-3 text-[10px] outline-none focus:border-[#ff1682]"
            />
            <button
              onClick={() => void report()}
              disabled={submitting}
              className="mt-4 h-11 w-full rounded-lg bg-[#1d9bf0] text-[11px] font-semibold text-white hover:bg-[#1689df] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
            {notice ? (
              <p
                role="status"
                className="mt-4 text-center text-[10px] text-[#596077]"
              >
                {notice}
              </p>
            ) : null}
            <p className="mt-4 text-center text-[9px] leading-4 text-[#596077]">
              We take all reports seriously and will review
              <br />
              this profile.
            </p>
          </section>
        </div>
        <MobileBottomNavigation active="Profile" />
      </div></div>
    </main>
  );
}
