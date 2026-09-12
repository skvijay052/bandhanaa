"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CreditCard, MessageCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReferralShareModal } from "@/components/referrals/ReferralShareModal";

const blockedPlaceholder = "Get message credits to continue";

export function MessageCreditBalance({ userId }: { userId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [summary, setSummary] = useState<{
    available_credits: number;
    requires_credit: boolean;
  } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

  const refresh = useCallback(async () => {
    const { data, error } = await createClient().rpc(
      "get_message_credit_summary",
    );
    if (!error && data?.[0]) setSummary(data[0]);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const refreshActive = () => {
      if (active) void refresh();
    };
    const channel = supabase
      .channel(`message-credits:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_credit_wallets",
          filter: `user_id=eq.${userId}`,
        },
        refreshActive,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_credit_access",
          filter: `user_id=eq.${userId}`,
        },
        refreshActive,
      )
      .subscribe(refreshActive);

    refreshActive();
    window.addEventListener("bandhanaa-message-sent", refreshActive);
    window.addEventListener("focus", refreshActive);

    return () => {
      active = false;
      window.removeEventListener("bandhanaa-message-sent", refreshActive);
      window.removeEventListener("focus", refreshActive);
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const credits = summary?.available_credits ?? 0;
  const creditBlocked = Boolean(
    summary?.requires_credit && credits <= 0,
  );
  const shouldShowCreditCard = Boolean(
    summary?.requires_credit && credits < 5,
  );

  useEffect(() => {
    const container = containerRef.current;
    const section = container?.closest("section");
    if (!container || !section) return;

    const input = section.querySelector<HTMLInputElement>(
      'input[placeholder="Type a message..."], input[placeholder="Type your reply..."], input[data-credit-guarded="true"]',
    );
    const sendButton = section.querySelector<HTMLButtonElement>(
      'button[aria-label="Send message"]',
    );
    if (!input || !sendButton) return;

    if (
      input.placeholder !== blockedPlaceholder &&
      !input.dataset.creditOriginalPlaceholder
    ) {
      input.dataset.creditOriginalPlaceholder = input.placeholder;
    }

    input.dataset.creditGuarded = "true";
    input.readOnly = creditBlocked;
    input.setAttribute("aria-disabled", creditBlocked ? "true" : "false");
    input.classList.toggle("message-credit-input-blocked", creditBlocked);

    if (creditBlocked) {
      input.placeholder = blockedPlaceholder;
      sendButton.dataset.creditBlocked = "true";
      sendButton.disabled = true;
      sendButton.setAttribute("aria-disabled", "true");
    } else {
      if (input.placeholder === blockedPlaceholder) {
        input.placeholder =
          input.dataset.creditOriginalPlaceholder || "Type a message...";
      }
      if (sendButton.dataset.creditBlocked === "true") {
        delete sendButton.dataset.creditBlocked;
        sendButton.disabled = !input.value.trim();
        sendButton.removeAttribute("aria-disabled");
      }
    }

    let attentionTimer: number | undefined;
    const blinkCard = () => {
      if (!creditBlocked) return;
      container.classList.remove("message-credit-attention");
      void container.offsetWidth;
      container.classList.add("message-credit-attention");
      if (attentionTimer) window.clearTimeout(attentionTimer);
      attentionTimer = window.setTimeout(() => {
        container.classList.remove("message-credit-attention");
      }, 900);
    };

    const handleBlockedTap = (event: Event) => {
      if (!creditBlocked) return;
      event.preventDefault();
      blinkCard();
    };

    input.addEventListener("pointerdown", handleBlockedTap);
    input.addEventListener("focus", blinkCard);

    return () => {
      input.removeEventListener("pointerdown", handleBlockedTap);
      input.removeEventListener("focus", blinkCard);
      if (attentionTimer) window.clearTimeout(attentionTimer);
    };
  }, [creditBlocked, summary]);

  if (!summary) {
    return (
      <div
        ref={containerRef}
        className="message-credit-compact inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#eadfe4] bg-white px-3 text-[11px] font-semibold text-[#6f6670] shadow-sm"
      >
        <MessageCircle size={13} aria-hidden="true" />
        <span>Checking credits…</span>
      </div>
    );
  }

  if (!shouldShowCreditCard) {
    return (
      <div
        ref={containerRef}
        className="message-credit-compact inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#eadfe4] bg-white px-3 text-[11px] font-semibold text-[#4a4650] shadow-sm"
        aria-label={`${credits} message credits`}
        title={`${credits} message credits`}
      >
        <MessageCircle size={13} className="text-[#8a7d84]" aria-hidden="true" />
        <strong className="font-bold tabular-nums">{credits}</strong>
        <span>credits</span>
      </div>
    );
  }

  const description = creditBlocked
    ? "No credits left. Choose an option below to keep chatting."
    : "Low credits — 1 credit is used for each outgoing message.";

  return (
    <>
      <div
        ref={containerRef}
        className="message-credit-balance w-full overflow-hidden rounded-[16px] border border-[#f4dbe6] bg-[#fff7fa] px-3 py-2.5 text-[#171717] shadow-none"
        data-credit-blocked={String(creditBlocked)}
        data-message-credits={credits}
      >
        <div className="flex items-center gap-2.5">
          <span className="message-credit-icon grid size-8 shrink-0 place-items-center rounded-full bg-[#ffe8f2] text-[#f43f93]">
            <MessageCircle size={15} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                aria-live="polite"
                className="message-credit-title text-[13px] font-semibold"
              >
                <strong className="text-[#f43f93]">{credits}</strong> message credits
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-[#b82e63]">
                Get 10 more messages
              </span>
            </div>
            <p className="message-credit-description mt-0.5 truncate text-[10px] text-[#747076]">
              {description}
            </p>
          </div>
        </div>

        <div className="message-credit-actions mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            aria-haspopup="dialog"
            className="message-credit-invite inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#eadfe4] bg-white px-2.5 text-[11px] font-semibold text-[#171717] transition hover:bg-[#fff8fb] focus-visible:outline-[#e83e78]"
          >
            <Users size={14} className="text-[#f43f93]" aria-hidden="true" />
            <span>Invite &amp; get 10 free</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setPaymentNotice(
                "Online message-credit purchase is not enabled yet.",
              )
            }
            className="message-credit-pay inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#121820] px-2.5 text-[11px] font-semibold text-white transition hover:bg-black"
            aria-describedby="message-credit-payment-notice"
          >
            <CreditCard size={14} aria-hidden="true" />
            <span>₹10 for 10 messages</span>
          </button>
        </div>

        {paymentNotice ? (
          <p
            id="message-credit-payment-notice"
            role="status"
            aria-live="polite"
            className="message-credit-payment-notice mt-1.5 text-center text-[9px] text-[#9a526f]"
          >
            {paymentNotice}
          </p>
        ) : null}
      </div>
      {inviteOpen ? (
        <ReferralShareModal onClose={() => setInviteOpen(false)} />
      ) : null}
    </>
  );
}
