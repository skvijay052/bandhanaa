"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { ProfileImage } from "@/components/ui/ProfileImage";

type Props = {
  profileName: string;
  profileImage: string;
  photos: string[];
};

function decodeSource(value: string) {
  let decoded = value;
  for (let index = 0; index < 2; index += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

export function ProfilePhotoLightbox({ profileName, profileImage, photos }: Props) {
  const gallery = useMemo(
    () => Array.from(new Set([profileImage, ...photos].filter(Boolean))),
    [photos, profileImage],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    function handleImageClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.closest("main")) return;

      // The mobile hero already has its own full-screen viewer.
      if (target.closest("button")) return;

      if (target.alt === profileName) {
        setActiveIndex(0);
        return;
      }

      const source = decodeSource(`${target.currentSrc} ${target.src}`);
      const index = gallery.findIndex((photo) => source.includes(photo));
      if (index >= 0) setActiveIndex(index);
    }

    document.addEventListener("click", handleImageClick);
    return () => document.removeEventListener("click", handleImageClick);
  }, [gallery, profileName]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft" && gallery.length > 1) {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + gallery.length) % gallery.length,
        );
      }
      if (event.key === "ArrowRight" && gallery.length > 1) {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % gallery.length,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, gallery.length]);

  if (activeIndex === null || typeof document === "undefined") return null;

  const currentPhoto = gallery[activeIndex] ?? profileImage;
  const move = (direction: -1 | 1) =>
    setActiveIndex((current) =>
      current === null
        ? current
        : (current + direction + gallery.length) % gallery.length,
    );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${profileName} photo viewer`}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setActiveIndex(null);
      }}
    >
      <button
        type="button"
        onClick={() => setActiveIndex(null)}
        aria-label="Close photo viewer"
        className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full bg-white/95 text-[#111] shadow-lg transition hover:bg-white md:right-7 md:top-7"
      >
        <X size={22} />
      </button>

      {gallery.length > 1 ? (
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#111] shadow-lg transition hover:bg-white md:left-7"
        >
          <ChevronLeft size={24} />
        </button>
      ) : null}

      <div className="relative flex h-[88dvh] w-full max-w-[1120px] flex-col items-center justify-center gap-4">
        <div className="relative min-h-0 w-full flex-1">
          <ProfileImage
            src={currentPhoto}
            alt={`${profileName} photo ${activeIndex + 1}`}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
            {activeIndex + 1} / {gallery.length}
          </span>
          {gallery.length > 1 ? (
            <div className="hidden max-w-[620px] gap-2 overflow-x-auto [scrollbar-width:none] sm:flex [&::-webkit-scrollbar]:hidden">
              {gallery.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={index === activeIndex}
                  className={`relative size-12 shrink-0 overflow-hidden rounded-lg border-2 bg-[#222] transition ${index === activeIndex ? "border-[#f34ca4]" : "border-white/50 hover:border-white"}`}
                >
                  <ProfileImage
                    src={photo}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {gallery.length > 1 ? (
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#111] shadow-lg transition hover:bg-white md:right-7"
        >
          <ChevronRight size={24} />
        </button>
      ) : null}
    </div>,
    document.body,
  );
}
