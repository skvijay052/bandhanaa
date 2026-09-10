"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Share2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { invitationText, normalizeReferralCode } from "@/lib/referrals";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function ReferralShareModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [referralUrl, setReferralUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [nativeShare, setNativeShare] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    setNativeShare(typeof navigator.share === "function");
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError("");
    async function loadCode() {
      try {
        const { data, error: rpcError } = await createClient().rpc(
          "get_or_create_referral_code",
        );
        const code = normalizeReferralCode(data);
        if (cancelled) return;
        if (rpcError || !code) {
          setError(
            "Your invite link is unavailable right now. Please try again.",
          );
          return;
        }
        const url = new URL("/register", getSiteUrl());
        url.searchParams.set("ref", code);
        setReferralUrl(url.toString());
      } catch {
        if (!cancelled) setError("Check your connection and try again.");
      }
    }
    void loadCode();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function manualCopy() {
    linkRef.current?.focus();
    linkRef.current?.select();
    setNotice("Select the link and copy it using your browser’s copy command.");
  }

  async function copyLink() {
    const success = await copyText(referralUrl);
    setCopied(success);
    if (success) setNotice("Link copied.");
    else manualCopy();
  }

  function openInstagram() {
    // Start copying while this page has focus, and reserve the tab in the same
    // user gesture. Awaiting first would let browsers block the new tab.
    const copying = copyText(invitationText(referralUrl));
    const target = window.open("about:blank", "_blank");
    if (target) target.opener = null;
    void copying.then((success) => {
      if (!success) {
        target?.close();
        manualCopy();
        return;
      }
      setNotice("Invitation copied. Paste it into an Instagram message.");
      if (target && !target.closed)
        target.location.replace("https://www.instagram.com/");
      else
        setNotice(
          "Invitation copied. Use Open Instagram below to paste it into a message.",
        );
    });
  }

  async function shareNative() {
    try {
      await navigator.share({
        title: "Join me on Bandhanaa",
        text: invitationText(referralUrl),
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        await copyLink();
    }
  }

  const actionClass =
    "flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#f1dce5] bg-white px-3 text-[13px] font-medium text-[#171717] transition hover:bg-[#fff3f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e83e78]";

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-transparent p-0 text-[#171717] backdrop:bg-black/40"
    >
      <div className="pointer-events-none flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <section className="pointer-events-auto relative w-full max-w-lg rounded-t-[24px] border border-[#f3dce6] bg-[#fffafb] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-[24px] sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invitation"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-[#747076] hover:bg-[#fff0f7] focus-visible:outline-[#e83e78]"
          >
            <X size={21} />
          </button>
          <span className="mb-4 grid size-12 place-items-center rounded-full border border-[#f6cee0] bg-[#fff3f9] text-[#e83e78]">
            <Share2 size={22} aria-hidden="true" />
          </span>
          <h2
            id={titleId}
            className="text-[28px] font-semibold tracking-[-.04em]"
          >
            Invite friends
          </h2>
          <p
            id={descriptionId}
            className="mt-2 pr-3 text-[14px] leading-relaxed text-[#747076]"
          >
            Earn 10 message credits when a friend joins, verifies their email
            and completes their profile.
          </p>
          {error ? (
            <div className="mt-5 text-sm">
              <p role="alert">{error}</p>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className={`${actionClass} mt-3`}
              >
                Try again
              </button>
            </div>
          ) : !referralUrl ? (
            <p role="status" className="mt-6 text-sm text-[#747076]">
              Preparing your invitation…
            </p>
          ) : (
            <>
              <label
                htmlFor={`${titleId}-link`}
                className="mt-6 block text-[12px] font-semibold"
              >
                Your invitation link
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#efd8e2] bg-white p-2">
                <input
                  ref={linkRef}
                  id={`${titleId}-link`}
                  value={referralUrl}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                  className="min-w-0 flex-1 bg-transparent px-1 text-[12px] outline-[#e83e78]"
                />
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#171717] px-3 text-[12px] font-semibold text-white"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}Copy Link
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a
                  className={actionClass}
                  href={`https://wa.me/?text=${encodeURIComponent(invitationText(referralUrl))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={17} className="text-[#e83e78]" />
                  WhatsApp
                </a>
                <button
                  type="button"
                  className={actionClass}
                  onClick={openInstagram}
                >
                  <Camera size={17} className="text-[#e83e78]" />
                  Instagram
                </button>
                <a
                  className={actionClass}
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={17} className="text-[#e83e78]" />
                  Facebook
                </a>
                <a
                  className={actionClass}
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(invitationText(referralUrl))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Share2 size={17} className="text-[#e83e78]" />X
                </a>
              </div>
              {nativeShare ? (
                <button
                  type="button"
                  onClick={() => void shareNative()}
                  className={`${actionClass} mt-3 w-full`}
                >
                  <Share2 size={17} />
                  More sharing options
                </button>
              ) : null}
              <p className="mt-4 text-[11px] leading-relaxed text-[#747076]">
                Instagram opens after copying your invitation. Paste it into a
                message to share.{" "}
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#a92e61] underline underline-offset-2"
                >
                  Open Instagram
                </a>
              </p>
            </>
          )}
          <p
            role="status"
            aria-live="polite"
            className="mt-3 min-h-5 text-[12px] text-[#a92e61]"
          >
            {notice}
          </p>
        </section>
      </div>
    </dialog>,
    document.body,
  );
}
