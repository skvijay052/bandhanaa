"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const banners = [
  {
    src: "/discover-banners/discover-match.png",
    alt: "Meet people who truly match through Bandhanaa",
  },
  {
    src: "/discover-banners/meaningful-connections.png",
    alt: "More than matches, meaningful connections",
  },
  {
    src: "/discover-banners/lifelong-connections.png",
    alt: "Built for lifelong connections",
  },
] as const;

export function DiscoverBannerSlider({ mobile = false }: { mobile?: boolean }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const show = useCallback((index: number) => {
    setActive((index + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % banners.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label="Bandhanaa highlights"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance =
          (event.changedTouches[0]?.clientX ?? touchStart.current) -
          touchStart.current;
        if (Math.abs(distance) > 45) {
          show(active + (distance < 0 ? 1 : -1));
        }
        touchStart.current = null;
      }}
      className={`group relative overflow-hidden bg-[#f6efe9] shadow-[0_12px_34px_rgba(44,33,24,0.12)] ${mobile ? "mt-4 block rounded-xl md:hidden" : "mt-5 hidden rounded-2xl md:block"}`}
    >
      <div
        className={`relative w-full ${mobile ? "aspect-[8/3]" : "aspect-[3.7/1]"}`}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.src}
            aria-hidden={active !== index}
            className={`absolute inset-0 transition-all duration-700 ease-out ${active === index ? "visible scale-100 opacity-100" : "invisible scale-[1.015] opacity-0"}`}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority={index === 0}
              sizes={
                mobile
                  ? "100vw"
                  : "(min-width: 1280px) calc(100vw - 320px), (min-width: 768px) calc(100vw - 250px), 0px"
              }
              className="object-fill"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => show(active - 1)}
        aria-label="Show previous banner"
        className={`${mobile ? "hidden" : "grid"} absolute left-3 top-1/2 size-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 shadow-lg backdrop-blur-sm transition hover:bg-black/70 focus:opacity-100 group-hover:opacity-100`}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => show(active + 1)}
        aria-label="Show next banner"
        className={`${mobile ? "hidden" : "grid"} absolute right-3 top-1/2 size-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 shadow-lg backdrop-blur-sm transition hover:bg-black/70 focus:opacity-100 group-hover:opacity-100`}
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
        {banners.map((banner, index) => (
          <button
            key={banner.src}
            type="button"
            onClick={() => show(index)}
            aria-label={`Show banner ${index + 1}`}
            aria-current={active === index ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all ${active === index ? "w-7 bg-white" : "w-1.5 bg-white/60 hover:bg-white"}`}
          />
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        Banner {active + 1} of {banners.length}
      </span>
    </section>
  );
}
