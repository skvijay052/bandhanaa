"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function ChatProfilePictureEnhancer() {
  const [photo, setPhoto] = useState<{ src: string; name: string } | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const avatar = target?.closest(
        '.messages-mobile-route section > header span.relative.size-12.overflow-hidden.rounded-full',
      ) as HTMLElement | null;
      if (!avatar) return;

      const image = avatar.querySelector("img") as HTMLImageElement | null;
      if (!image?.src) return;

      const header = avatar.closest("header");
      const name = header?.querySelector("h2")?.textContent?.split(",")[0]?.trim() || "Profile";
      event.preventDefault();
      event.stopPropagation();
      setPhoto({ src: image.currentSrc || image.src, name });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    if (!photo) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhoto(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [photo]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.name}'s profile picture`}
      className="fixed inset-0 z-[400] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setPhoto(null);
      }}
    >
      <button
        type="button"
        aria-label="Close profile picture"
        onClick={() => setPhoto(null)}
        className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md"
      >
        <X size={23} />
      </button>

      <div className="w-full max-w-[430px] overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="relative aspect-square w-full bg-[#eef0f3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={`${photo.name}'s profile picture`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="px-5 py-4 text-center">
          <strong className="block truncate text-[17px] font-semibold text-[#111b21]">
            {photo.name}
          </strong>
        </div>
      </div>
    </div>
  );
}
