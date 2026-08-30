import Image from "next/image";

export function InterestsHero() {
  return (
    <section className="relative h-[192px] overflow-hidden border-b border-[#f0f0f3] px-9 pt-7 max-md:h-[142px] max-md:px-4 max-md:pt-2">
      <div className="relative z-10">
        <p className="text-[14px] font-semibold text-[#ff1682] max-md:text-xs">
          Interests
        </p>
        <h1 className="mt-2 text-[32px] font-bold leading-[1.08] tracking-[-.025em] text-[#0b0c18] max-md:mt-1.5 max-md:text-[21px]">
          Connections begin
          <br /> with a mutual interest.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.5] text-[#4d5168] max-md:hidden">
          Express interest in people you like and
          <br /> respond to those who are interested in you.
        </p>
      </div>
      <Image
        src="/discover-banner.png"
        alt=""
        fill
        priority
        sizes="(max-width: 767px) 70vw, 560px"
        className="pointer-events-none object-contain object-right opacity-80 max-md:translate-x-16 max-md:translate-y-7 max-md:scale-110"
      />
    </section>
  );
}
