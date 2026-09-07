"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PendingAction = {
  profileId: string;
  profileName: string;
  kind: "requested" | "following";
};

function getProfileContext(button: HTMLButtonElement) {
  const container = button.closest("article, li, [data-profile-id], [data-profile-card], section, div");
  const profileLink = container?.querySelector('a[href^="/profile/"]') as HTMLAnchorElement | null;
  const href = profileLink?.getAttribute("href") ?? "";
  const idFromLink = href.match(/^\/profile\/([^/?#]+)/)?.[1] ?? "";
  const idFromPath = window.location.pathname.match(/^\/profile\/([^/?#]+)/)?.[1] ?? "";
  const profileId = idFromLink || idFromPath;

  const heading = container?.querySelector("h1, h2, h3, strong")?.textContent?.trim() ?? "";
  const profileName = heading.replace(/,\s*\d+.*$/, "").trim() || "this profile";
  return { profileId, profileName };
}

export function MobileRelationshipActionEnhancer() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const normalizeButtons = () => {
      if (window.innerWidth >= 768) return;
      document.querySelectorAll("button").forEach((node) => {
        if (!(node instanceof HTMLButtonElement)) return;
        const label = node.textContent?.trim().toLowerCase();
        if (label === "requested" || label === "following") {
          node.disabled = false;
          node.dataset.relationshipAction = label;
        }
      });
    };

    normalizeButtons();
    const observer = new MutationObserver(normalizeButtons);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const onClick = (event: MouseEvent) => {
      if (window.innerWidth >= 768) return;
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button[data-relationship-action]") as HTMLButtonElement | null;
      if (!button) return;

      const kind = button.dataset.relationshipAction === "following" ? "following" : "requested";
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
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from("profile_likes").delete();
      if (pending.kind === "requested") {
        query = query.eq("liker_id", user.id).eq("liked_id", pending.profileId).eq("status", "pending");
      } else {
        query = query.or(
          `and(liker_id.eq.${user.id},liked_id.eq.${pending.profileId}),and(liker_id.eq.${pending.profileId},liked_id.eq.${user.id})`,
        );
      }

      const { error } = await query;
      if (!error) {
        setPending(null);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (!pending) return null;

  const isFollowing = pending.kind === "following";
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Close relationship action"
        className="fixed inset-0 z-[290] bg-black/35 backdrop-blur-[1px]"
        onClick={() => !busy && setPending(null)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-[300] rounded-t-[28px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_55px_rgba(15,20,25,.18)]"
      >
        <span className="mx-auto mb-4 block h-1.5 w-11 rounded-full bg-[#d9dde4]" />
        <strong className="block text-[17px] font-semibold text-[#0f1419]">
          {isFollowing
            ? `Remove ${pending.profileName} from Following?`
            : "Cancel follow request?"}
        </strong>
        <p className="mt-1.5 text-[13px] leading-5 text-[#687184]">
          {isFollowing
            ? `You will stop following ${pending.profileName}.`
            : `Your request to ${pending.profileName} will be cancelled.`}
        </p>
        <div className="mt-5 grid gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirm()}
            className="h-12 rounded-xl bg-[#fff0f7] text-[14px] font-semibold text-[#e33b91] disabled:opacity-60"
          >
            {busy ? "Please wait…" : isFollowing ? "Remove Following" : "Cancel Request"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPending(null)}
            className="h-12 rounded-xl bg-[#f4f5f6] text-[14px] font-semibold text-[#0f1419] disabled:opacity-60"
          >
            Keep {isFollowing ? "Following" : "Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
