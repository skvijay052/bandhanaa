"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const pillBaseClass =
  "message-credit-pill inline-flex shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none shadow-sm";

function findTargets(root: HTMLElement) {
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
        (element) => element.textContent?.trim().startsWith("Messages"),
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

function ensurePill(
  id: string,
  target: Element | null,
  credits: number,
  compact: boolean,
) {
  if (!target) return;

  let pill = document.getElementById(id) as HTMLSpanElement | null;
  if (!pill) {
    pill = document.createElement("span");
    pill.id = id;
  }

  const low = credits < 5;
  pill.className = `${pillBaseClass} ${
    low
      ? "border-[#f5cada] bg-[#fff0f6] text-[#c72d68]"
      : "border-[#eadfe4] bg-white text-[#4a4650]"
  }`;
  pill.textContent = compact ? `💬 ${credits}` : `💬 ${credits} credits`;
  pill.title = `${credits} message credits`;
  pill.setAttribute("aria-label", `${credits} message credits`);
  pill.dataset.lowCredits = String(low);

  if (pill.parentElement !== target) target.appendChild(pill);
}

export function MessageCreditPillEnhancer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".messages-mobile-route");
    if (!root) return;

    const supabase = createClient();
    let active = true;
    let credits: number | null = null;
    let removeRealtime: (() => void) | undefined;

    const render = () => {
      if (!active || credits === null) return;
      const targets = findTargets(root);
      ensurePill(
        "message-credit-pill-mobile",
        targets.mobileMessagesHeader,
        credits,
        false,
      );
      ensurePill(
        "message-credit-pill-desktop",
        targets.desktopMessagesTitle,
        credits,
        false,
      );
      ensurePill(
        "message-credit-pill-chat",
        targets.chatHeaderActions,
        credits,
        true,
      );
    };

    const refreshCredits = async () => {
      const { data, error } = await supabase.rpc("get_message_credit_summary");
      if (!active || error || !data?.[0]) return;
      credits = Number(data[0].available_credits ?? 0);
      render();
    };

    const observer = new MutationObserver(render);
    observer.observe(root, { childList: true, subtree: true });

    const subscribe = async () => {
      await refreshCredits();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) return;

      const channel = supabase
        .channel(`message-credit-pill:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "message_credit_wallets",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            void refreshCredits();
          },
        )
        .subscribe();

      removeRealtime = () => {
        void supabase.removeChannel(channel);
      };
    };

    const refreshFromEvent = () => {
      void refreshCredits();
    };

    void subscribe();
    window.addEventListener("bandhanaa-message-sent", refreshFromEvent);
    window.addEventListener("focus", refreshFromEvent);

    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener("bandhanaa-message-sent", refreshFromEvent);
      window.removeEventListener("focus", refreshFromEvent);
      removeRealtime?.();
      document.getElementById("message-credit-pill-mobile")?.remove();
      document.getElementById("message-credit-pill-desktop")?.remove();
      document.getElementById("message-credit-pill-chat")?.remove();
    };
  }, []);

  return null;
}
