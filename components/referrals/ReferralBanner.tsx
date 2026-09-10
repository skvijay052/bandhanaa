"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";
import { ProfileImage } from "@/components/ui/ProfileImage";

export function ReferralBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group relative col-span-full flex w-full items-center gap-4 overflow-hidden rounded-[20px] border border-[#f5d5e3] bg-[#fff7fb] p-5 text-left shadow-[0_8px_24px_rgba(30,22,26,.035)] transition hover:border-[#e83e78] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e83e78] md:px-7 md:py-6"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[10px] font-semibold tracking-[.17em] text-[#e83e78]">
          <MessageCircle size={15} aria-hidden="true" />
          INVITE &amp; CONNECT
        </span>
        <strong className="mt-2 block max-w-[570px] text-[20px] font-semibold leading-tight tracking-[-.035em] text-[#171717] md:text-[25px]">
          Invite a friend &amp; get{" "}
          <span className="text-[#e83e78]">10 chat messages free.</span>
        </strong>
        <span className="mt-2 block max-w-[540px] text-[12px] leading-relaxed text-[#747076]">
          Share Bandhanaa with a friend. When they join and verify their
          account, you&apos;ll receive 10 message credits.
        </span>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#171717]">
          Invite a friend <ArrowUpRight size={15} aria-hidden="true" />
        </span>
      </span>
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center pr-1 max-sm:absolute max-sm:bottom-5 max-sm:right-4"
      >
        {[
          "/profiles/ananya.png",
          "/profiles/rohan.png",
          "/profiles/priya.png",
        ].map((src, index) => (
          <span
            key={src}
            className={`relative block size-9 overflow-hidden rounded-full border-[3px] border-white shadow-sm sm:h-24 sm:w-20 sm:rounded-[16px] lg:h-28 lg:w-24 ${index ? "-ml-4 sm:-ml-6" : ""} ${index === 1 ? "z-10 sm:-translate-y-2" : "sm:rotate-[-7deg]"}`}
          >
            <ProfileImage
              src={src}
              alt=""
              fill
              sizes="(max-width:639px) 36px, 96px"
              className="object-cover"
            />
          </span>
        ))}
      </span>
    </button>
  );
}
