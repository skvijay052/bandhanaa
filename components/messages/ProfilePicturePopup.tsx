"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProfileImage } from "@/components/ui/ProfileImage";

export function ProfilePicturePopup({
  src,
  name,
  size = 48,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${name}'s profile picture`}
        className="relative block shrink-0 overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#8b3de8] focus-visible:ring-offset-2"
        style={{ width: size, height: size }}
      >
        <ProfileImage
          src={src}
          alt={`${name}'s profile picture`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name}'s profile picture`}
          className="fixed inset-0 z-[300] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close profile picture"
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md"
          >
            <X size={23} strokeWidth={2} />
          </button>

          <div className="w-full max-w-[430px] overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="relative aspect-square w-full bg-[#eef0f3]">
              <ProfileImage
                src={src}
                alt={`${name}'s profile picture`}
                fill
                priority
                sizes="(max-width: 767px) calc(100vw - 32px), 430px"
                className="object-cover"
              />
            </div>
            <div className="px-5 py-4 text-center">
              <strong className="block truncate text-[17px] font-semibold text-[#111b21]">
                {name}
              </strong>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
