"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PendingAction = {
  profileId: string;
  profileName: string;
  kind: "requested" | "following";
};

function getProfileContext(button: HTMLButtonElement) {
  let node: HTMLElement | null = button;
  let profileLink: HTMLAnchorElement | null = null;
  let heading = "";

  while (node && node !== document.body) {
    if (!profileLink) {
      profileLink = node.querySelector('a[href^="/profile/"]') as HTMLAnchorElement | null;
    }
    if (!heading) {
      heading = node.querySelector("h1, h2, h3, strong")?.textContent?.trim() ?? "";
    }
    if (profileLink) break;
    node = node.parentElement;
  }

  const href = profileLink?.getAttribute("href") ?? "";
  const idFromLink = href.match(/^\/profile\/([^/?#]+)/)?.[1] ?? "";
  const idFromPath = window.location.pathname.match(/^\/profile\/([^/?#]+)/)?.[1] ?? "";
  const profileId = idFromLink || idFromPath;
  const profileName = heading.replace(/,\s*\d+.*$/, "").trim() || "this profile";
  return { profileId, profileName };
}

function replaceRelationshipLabel(
  button: HTMLButtonElement,
  label: "Send Request" | "Requested" | "Following",
) {
  const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  let fallback: Text | null = null;

  while (node) {
    if (node instanceof Text) {
      const value = node.textContent?.trim().toLowerCase() ?? "";
      if (value) fallback = node;
      if (
        value === "requested" ||
        value === "following" ||
        value === "send request"
      ) {
        node.textContent = label;
        return;
      }
    }
    node = walker.nextNode();
  }

  if (fallback) fallback.textContent = label;
}

function updateProfileRelationshipButtons(
  profileId: string,
  label: "Send Request" | "Requested" | "Following",
) {
  document.querySelectorAll("button").forEach((node) => {
    if (!(node instanceof HTMLButtonElement)) return;
    if (node.closest(".mobile-matches-type")) return;

    const currentLabel = node.textContent?.trim().toLowerCase();
    if (
      currentLabel !== "requested" &&
      currentLabel !== "following" &&
      currentLabel !== "send request"
    ) {
      return;
    }

    const context = getProfileContext(node);
    if (context.profileId !== profileId) return;

    replaceRelationshipLabel(node, label);
    if (label === "Requested") {
      node.dataset.relationshipAction = "requested";
    } else if (label === "Following") {
      node.dataset.relationshipAction = "following";
    } else {
      delete node.dataset.relationshipAction;
    }
  });
}

export function MobileRelationshipActionEnhancer() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const normalizeButtons = () => {
      if (window.innerWidth >= 768) return;
      document.querySelectorAll("button").forEach((node) => {
        if (!(node instanceof HTMLButtonElement)) return;
        if (
          node.closest(".mobile-matches-type") ||
          node.dataset.nativeRelationshipAction === "true"
        ) {
          delete node.dataset.relationshipAction;
          return;
        }
        const label = node.textContent?.trim().toLowerCase();
        if (label === "requested" || label === "following") {
          node.disabled = false;
          node.dataset.relationshipAction = label;
        }
      });
    };

    normalizeButtons();
    const observer = new MutationObserver(normalizeButtons);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const onClick = (event: MouseEvent) => {
      if (window.innerWidth >= 768) return;
      const target = event.target as HTMLElement | null;
      const button = target?.closest(
        "button[data-relationship-action]",
      ) as HTMLButtonElement | null;
      if (
        !button ||
        button.closest(".mobile-matches-type") ||
        button.dataset.nativeRelationshipAction === "true"
      )
        return;

      const kind =
        button.dataset.relationshipAction === "following"
          ? "following"
          : "requested";
      const { profileId, profileName } = getProfileContext(button);
      if (!profileId) return;

      event.preventDefault();
      event.stopPropagation();
      setPending({ profileId, profileName, kind });
    };

    document.addEventListener("click", onClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  async function confirm() {
    if (!pending || busy) return;

    const action = pending;
    setBusy(true);

    // Optimistic UI update: close the modal and change the profile buttons now,
    // without waiting for the Supabase round trip.
    updateProfileRelationshipButtons(action.profileId, "Send Request");
    setPending(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        updateProfileRelationshipButtons(
          action.profileId,
          action.kind === "following" ? "Following" : "Requested",
        );
        return;
      }

      const result =
        action.kind === "requested"
          ? await supabase
              .from("profile_likes")
              .delete()
              .eq("liker_id", user.id)
              .eq("liked_id", action.profileId)
              .eq("status", "pending")
          : await supabase
              .from("profile_likes")
              .delete()
              .or(
                `and(liker_id.eq.${user.id},liked_id.eq.${action.profileId}),and(liker_id.eq.${action.profileId},liked_id.eq.${user.id})`,
              );

      if (result.error) {
        updateProfileRelationshipButtons(
          action.profileId,
          action.kind === "following" ? "Following" : "Requested",
        );
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!pending || !mounted) return null;

  const isFollowing = pending.kind === "following";
  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="relationship-confirm-title"
      className="fixed inset-0 z-[1000] grid place-items-end bg-black/45 p-4 backdrop-blur-[2px] md:place-items-center"
      onMouseDown={(event) =>
        event.target === event.currentTarget && !busy && setPending(null)
      }
    >
      <div className="w-full max-w-sm rounded-[26px] bg-white p-6 shadow-2xl">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#fff0f5] text-[#e72c6c]">
          <X size={22} />
        </div>
        <h2
          id="relationship-confirm-title"
          className="mt-4 text-center text-[20px] font-bold text-[#0f1419]"
        >
          {isFollowing ? `Unfollow ${pending.profileName}?` : "Cancel request?"}
        </h2>
        <p className="mt-2 text-center text-[14px] leading-5 text-[var(--text-secondary)]">
          {isFollowing
            ? "You’ll stop following this profile."
            : "Are you sure you want to cancel this request?"}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPending(null)}
            disabled={busy}
            className="h-12 rounded-full border border-[#d8d4dc] font-semibold disabled:opacity-60"
          >
            {isFollowing ? "Keep Following" : "Keep Request"}
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={busy}
            className="h-12 rounded-full bg-[#e72c6c] font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Updating…" : isFollowing ? "Unfollow" : "Cancel Request"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
