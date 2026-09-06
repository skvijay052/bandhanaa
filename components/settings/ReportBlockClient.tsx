"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  Flag,
  LockKeyhole,
  X,
} from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";
import type { ReportTarget } from "@/data/privacy";
import { createClient } from "@/lib/supabase/client";

const reasons = [
  ["", "Select a reason"],
  ["inappropriate_photos", "Inappropriate Photos"],
  ["abusive_behavior", "Abusive or Offensive Behavior"],
  ["fake_profile", "Fake Profile"],
  ["scam_or_fraud", "Scam or Fraud"],
  ["other", "Other"],
] as const;

type Mode = "report" | "block";
type Notice = { type: "success" | "error"; message: string } | null;

export function ReportBlockClient({
  targets,
  currentUserId,
  initialTargetId,
  initiallyBlockedIds,
}: {
  targets: ReportTarget[];
  currentUserId: string;
  initialTargetId: string;
  initiallyBlockedIds: string[];
}) {
  const [mode, setMode] = useState<Mode>("report");
  const [targetId, setTargetId] = useState(initialTargetId);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [submitting, setSubmitting] = useState(false);
  const [blockedIds, setBlockedIds] = useState(
    () => new Set(initiallyBlockedIds),
  );
  const target = useMemo(
    () => targets.find((member) => member.id === targetId) ?? targets[0],
    [targetId, targets],
  );
  const isBlocked = blockedIds.has(target.id);
  const memberOptions = useMemo(
    () =>
      targets.map((member) => ({
        value: member.id,
        label: member.name,
        description: [member.age || null, member.profession, member.city]
          .filter(Boolean)
          .join(" • "),
        avatar: member.avatar,
      })),
    [targets],
  );

  useEffect(() => {
    if (notice?.type !== "success") return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function selectMode(nextMode: Mode) {
    setMode(nextMode);
    setNotice(null);
  }

  async function report() {
    if (!reason) {
      setNotice({
        type: "error",
        message: "Choose a reason before submitting.",
      });
      return;
    }
    setSubmitting(true);
    setNotice(null);
    const { error } = await createClient()
      .from("member_reports")
      .insert({
        reporter_id: currentUserId,
        reported_id: target.id,
        reason,
        details: details.trim() || null,
      });
    setSubmitting(false);
    if (error) {
      setNotice({
        type: "error",
        message: "We couldn't submit your report. Please try again.",
      });
      return;
    }
    setReason("");
    setDetails("");
    setNotice({
      type: "success",
      message: "Report submitted. Our safety team will review it.",
    });
  }

  async function toggleBlock() {
    setSubmitting(true);
    setNotice(null);
    const supabase = createClient();
    const { error } = isBlocked
      ? await supabase
          .from("blocked_users")
          .delete()
          .eq("blocker_id", currentUserId)
          .eq("blocked_id", target.id)
      : await supabase.from("blocked_users").upsert({
          blocker_id: currentUserId,
          blocked_id: target.id,
        });
    setSubmitting(false);
    if (error) {
      setNotice({
        type: "error",
        message: `We couldn't ${isBlocked ? "unblock" : "block"} this member. Please try again.`,
      });
      return;
    }
    setBlockedIds((current) => {
      const next = new Set(current);
      if (isBlocked) next.delete(target.id);
      else next.add(target.id);
      return next;
    });
    setNotice({
      type: "success",
      message: `${target.name} has been ${isBlocked ? "unblocked" : "blocked"}.`,
    });
  }

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-[#e7e9ef] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f6f7fa] p-1.5">
          <button
            type="button"
            onClick={() => selectMode("report")}
            className={`flex h-11 items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-all ${mode === "report" ? "bg-black text-white shadow-sm" : "text-[#596077] hover:bg-white hover:text-black"}`}
          >
            <Flag size={16} aria-hidden="true" />
            Report a Member
          </button>
          <button
            type="button"
            onClick={() => selectMode("block")}
            className={`flex h-11 items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-all ${mode === "block" ? "bg-black text-white shadow-sm" : "text-[#596077] hover:bg-white hover:text-black"}`}
          >
            <Ban size={16} aria-hidden="true" />
            Block a Member
          </button>
        </div>

        <div className="mt-6">
          <label
            htmlFor="report-member"
            className="text-[13px] font-semibold text-[#151922]"
          >
            1. Select the member
          </label>
          <CustomDropdown
            id="report-member"
            value={targetId}
            options={memberOptions}
            onChange={(value) => {
              setTargetId(value);
              setNotice(null);
            }}
          />
        </div>

        {mode === "report" ? (
          <>
            <label
              htmlFor="report-reason"
              className="mt-6 block text-[13px] font-semibold text-[#151922]"
            >
              2. Why are you reporting this member?
            </label>
            <CustomDropdown
              id="report-reason"
              value={reason}
              options={reasons.map(([value, label]) => ({ value, label }))}
              onChange={setReason}
            />

            <label
              htmlFor="report-details"
              className="mt-6 block text-[13px] font-semibold text-[#151922]"
            >
              3. Additional details{" "}
              <span className="font-normal text-[#68718b]">(optional)</span>
            </label>
            <div className="relative mt-2">
              <textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Tell us anything else we should know..."
                className="w-full resize-none rounded-xl border border-[#dfe3eb] bg-white px-4 py-3 pb-8 text-[13px] outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-[#87909f]">
                {details.length}/500
              </span>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-[#e7e9ef] bg-[#fafafa] p-5">
            <h2 className="text-[14px] font-semibold text-[#151922]">
              {isBlocked ? `Unblock ${target.name}?` : `Block ${target.name}?`}
            </h2>
            <p className="mt-2 text-[12px] leading-5 text-[#68718b]">
              {isBlocked
                ? "This member will be visible to you again across Bandhanaa."
                : "You will no longer see each other in discovery, matches, requests, or messages."}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f7f8fc] px-4 py-3 text-[11px] leading-4 text-[#68718b]">
          <LockKeyhole size={16} className="shrink-0" aria-hidden="true" />
          {mode === "report"
            ? "Your report will remain private and will be reviewed by the Bandhanaa team."
            : "The member will not be notified about this action."}
        </div>

        {notice?.type === "error" ? (
          <p role="alert" className="mt-4 text-[12px] text-[#d92d20]">
            {notice.message}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => history.back()}
            className="h-11 rounded-xl border border-[#dfe3eb] bg-white text-[13px] font-semibold text-[#151922] hover:border-black hover:bg-[#fafafa]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void (mode === "report" ? report() : toggleBlock())}
            className="h-11 rounded-xl bg-black text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[#222] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Please wait…"
              : mode === "report"
                ? "Submit Report"
                : isBlocked
                  ? "Unblock Member"
                  : "Block Member"}
          </button>
        </div>
      </div>

      {notice?.type === "success" ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-4 right-4 top-5 z-[100] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.18)] sm:left-auto sm:right-6 sm:mx-0"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </span>
          <p className="min-w-0 flex-1 pt-2 text-[13px] font-medium text-[#151922]">
            {notice.message}
          </p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="grid size-8 place-items-center rounded-full text-[#68718b] hover:bg-[#f2f2f2]"
          >
            <X size={17} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
type DropdownOption = {
  value: string;
  label: string;
  description?: string;
  avatar?: string;
};

function CustomDropdown({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  const generatedId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={root} className="relative mt-2">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${generatedId}-options`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={`flex min-h-12 w-full items-center rounded-xl border bg-white px-3 text-left outline-none transition-all hover:border-[#aeb4c0] focus:border-black focus:ring-2 focus:ring-black/10 ${open ? "border-black ring-2 ring-black/10" : "border-[#dfe3eb]"}`}
      >
        {selected.avatar ? (
          <span className="relative mr-3 size-9 shrink-0 overflow-hidden rounded-full bg-[#f1f2f5]">
            <ProfileImage
              src={selected.avatar}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <strong
            className={`block truncate text-[13px] font-medium ${selected.value ? "text-[#151922]" : "text-[#68718b]"}`}
          >
            {selected.label}
          </strong>
          {selected.description ? (
            <span className="mt-0.5 block truncate text-[10px] text-[#68718b]">
              {selected.description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={17}
          className={`ml-3 shrink-0 text-[#68718b] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={`${generatedId}-options`}
          role="listbox"
          aria-labelledby={id}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#dfe3eb] bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value || "placeholder"}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left transition-colors ${active ? "bg-[#f2f2f2]" : "hover:bg-[#f7f7f8]"}`}
              >
                {option.avatar ? (
                  <span className="relative mr-3 size-9 shrink-0 overflow-hidden rounded-full bg-[#f1f2f5]">
                    <ProfileImage
                      src={option.avatar}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <strong
                    className={`block truncate text-[13px] font-medium ${option.value ? "text-[#151922]" : "text-[#68718b]"}`}
                  >
                    {option.label}
                  </strong>
                  {option.description ? (
                    <span className="mt-0.5 block truncate text-[10px] text-[#68718b]">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                {active ? (
                  <Check
                    size={16}
                    className="ml-3 shrink-0 text-black"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
