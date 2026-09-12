"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type CreditTargets = {
  mobileMessagesHeader: Element | null;
  desktopMessagesTitle: Element | null;
  chatHeaderActions: Element | null;
};

const emptyTargets: CreditTargets = {
  mobileMessagesHeader: null,
  desktopMessagesTitle: null,
  chatHeaderActions: null,
};

function sameTargets(a: CreditTargets, b: CreditTargets) {
  return (
    a.mobileMessagesHeader === b.mobileMessagesHeader &&
    a.desktopMessagesTitle === b.desktopMessagesTitle &&
    a.chatHeaderActions === b.chatHeaderActions
  );
}

function findTargets(root: HTMLElement): CreditTargets {
  const sections = Array.from(root.querySelectorAll("section"));
  const conversationSection = sections.find((section) =>
    section.querySelector('input[placeholder="Search messages"]'),
  );
  const chatSection = sections.find((section) =>
    section.querySelector('button[aria-label="Send message"]'),
  );

  const mobileMessagesHeader = conversationSection
    ? Array.from(conversationSection.querySelectorAll("div")).find(
        (element) =>
          element.classList.contains("justify-between") &&
          element.classList.contains("md:hidden") &&
          Boolean(element.querySelector("a, svg")),
      ) ?? null
    : null;

  const desktopMessagesTitle = conversationSection
    ? Array.from(conversationSection.querySelectorAll("h2")).find(
        (element) => element.textContent?.trim() === "Messages",
      ) ?? null
    : null;

  const chatHeaderActions =
    chatSection?.querySelector("header > div.ml-auto") ?? null;

  return {
    mobileMessagesHeader,
    desktopMessagesTitle,
    chatHeaderActions,
  };
}

function CreditPill({
  credits,
  className = "",
  compact = false,
}: {
  credits: number;
  className?: string;
  compact?: boolean;
}) {
  const low = credits < 5;

  return (
    <span
      className={`message-credit-pill inline-flex shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none shadow-sm ${
        low
          ? "border-[#f5cada] bg-[#fff0f6] text-[#c72d68]"
          : "border-[#eadfe4] bg-white text-[#4a4650]"
      } ${className}`}
      title={`${credits} message credits`}
      aria-label={`${credits} message credits`}
    >
      <MessageCircle
        size={compact ? 13 : 14}
        className={low ? "text-[#f43f93]" : "text-[#8a7d84]"}
        aria-hidden="true"
      />
      <strong className="font-bold tabular-nums">{credits}</strong>
      {!compact ? <span className="font-medium">credits</span> : null}
    </span>
  );
}

export function MessageCreditPillEnhancer() {
  const [credits, setCredits] = useState<number | null>(null);
  const [targets, setTargets] = useState<CreditTargets>(emptyTargets);

  const refreshCredits = useCallback(async () => {
    const { data, error } = await createClient().rpc(
      "get_message_credit_summary",
    );
    if (!error && data?.[0]) {
      setCredits(Number(data[0].available_credits ?? 0));
    }
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".messages-mobile-route");
    if (!root) return;

    const refreshTargets = () => {
      const next = findTargets(root);
      setTargets((current) => (sameTargets(current, next) ? current : next));
    };

    const observer = new MutationObserver(refreshTargets);
    observer.observe(root, { childList: true, subtree: true });
    refreshTargets();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const refreshActive = () => {
      if (active) void refreshCredits();
    };

    const subscribe = async () => {
      refreshActive();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) return;

      channel = supabase
        .channel(`message-credit-pill:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "message_credit_wallets",
            filter: `user_id=eq.${user.id}`,
          },
          refreshActive,
        )
        .subscribe();
    };

    void subscribe();
    window.addEventListener("bandhanaa-message-sent", refreshActive);
    window.addEventListener("focus", refreshActive);

    return () => {
      active = false;
      window.removeEventListener("bandhanaa-message-sent", refreshActive);
      window.removeEventListener("focus", refreshActive);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [refreshCredits]);

  if (credits === null) return null;

  return (
    <>
      {targets.mobileMessagesHeader
        ? createPortal(
            <CreditPill credits={credits} className="ml-auto md:hidden" />,
            targets.mobileMessagesHeader,
          )
        : null}
      {targets.desktopMessagesTitle
        ? createPortal(
            <CreditPill
              credits={credits}
              className="ml-2 hidden align-middle md:inline-flex"
            />,
            targets.desktopMessagesTitle,
          )
        : null}
      {targets.chatHeaderActions
        ? createPortal(
            <CreditPill
              credits={credits}
              compact
              className="order-first mr-1"
            />,
            targets.chatHeaderActions,
          )
        : null}
    </>
  );
}
