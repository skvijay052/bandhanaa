"use client";

import { useEffect } from "react";

const blockedPlaceholder = "Get message credits to continue";

export function ChatCreditGuard() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".messages-mobile-route");
    if (!root) return;

    let attentionTimer: number | undefined;

    function blinkCreditCard(input: HTMLInputElement) {
      const section = input.closest("section");
      const card = section?.querySelector<HTMLElement>(
        '.message-credit-balance[data-credit-blocked="true"]',
      );
      if (!card) return;

      card.classList.remove("message-credit-attention");
      // Force a reflow so repeated taps restart the attention animation.
      void card.offsetWidth;
      card.classList.add("message-credit-attention");

      if (attentionTimer) window.clearTimeout(attentionTimer);
      attentionTimer = window.setTimeout(() => {
        card.classList.remove("message-credit-attention");
      }, 900);
    }

    function syncComposerState() {
      const inputs = root.querySelectorAll<HTMLInputElement>(
        'input[placeholder="Type a message..."], input[placeholder="Type your reply..."], input[data-credit-guarded="true"]',
      );

      inputs.forEach((input) => {
        const section = input.closest("section");
        const card = section?.querySelector<HTMLElement>(
          ".message-credit-balance[data-credit-blocked]",
        );
        const blocked = card?.dataset.creditBlocked === "true";

        if (
          input.placeholder !== blockedPlaceholder &&
          (!blocked || !input.dataset.creditOriginalPlaceholder)
        ) {
          input.dataset.creditOriginalPlaceholder = input.placeholder;
        }

        input.dataset.creditGuarded = "true";
        input.readOnly = blocked;
        input.setAttribute("aria-disabled", blocked ? "true" : "false");
        input.classList.toggle("message-credit-input-blocked", blocked);

        if (blocked) {
          input.placeholder = blockedPlaceholder;
        } else if (input.placeholder === blockedPlaceholder) {
          input.placeholder =
            input.dataset.creditOriginalPlaceholder || "Type a message...";
        }

        const sendButton = section?.querySelector<HTMLButtonElement>(
          'button[aria-label="Send message"]',
        );
        if (!sendButton) return;

        if (blocked) {
          sendButton.dataset.creditBlocked = "true";
          sendButton.disabled = true;
          sendButton.setAttribute("aria-disabled", "true");
        } else if (sendButton.dataset.creditBlocked === "true") {
          delete sendButton.dataset.creditBlocked;
          sendButton.disabled = !input.value.trim();
          sendButton.removeAttribute("aria-disabled");
        }
      });
    }

    function onPointerDown(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const input = target.closest<HTMLInputElement>(
        'input[data-credit-guarded="true"]',
      );
      if (!input || !input.readOnly) return;

      event.preventDefault();
      blinkCreditCard(input);
    }

    function onFocusIn(event: Event) {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.dataset.creditGuarded !== "true" || !target.readOnly) return;
      blinkCreditCard(target);
    }

    const observer = new MutationObserver(syncComposerState);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-credit-blocked", "placeholder"],
    });

    root.addEventListener("pointerdown", onPointerDown, true);
    root.addEventListener("focusin", onFocusIn, true);
    root.addEventListener("input", syncComposerState);
    syncComposerState();

    return () => {
      observer.disconnect();
      root.removeEventListener("pointerdown", onPointerDown, true);
      root.removeEventListener("focusin", onFocusIn, true);
      root.removeEventListener("input", syncComposerState);
      if (attentionTimer) window.clearTimeout(attentionTimer);
    };
  }, []);

  return null;
}
