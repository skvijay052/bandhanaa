import Image from "next/image";
export function DiscoverHero() {
  return (
    <section className="relative mt-6 h-[162px] overflow-hidden rounded-[18px] bg-[linear-gradient(125deg,#1d9bf0_0%,#1689df_50%,#0f6fc6_100%)] px-8 py-7 text-white max-md:mt-5 max-md:h-[120px] max-md:rounded-xl max-md:px-5 max-md:py-6">
      <Image
        src="/dna-helix.svg"
        alt=""
        fill
        priority
        sizes="(max-width:768px) 100vw,800px"
        className="pointer-events-none object-cover object-right opacity-80"
      />
      <div className="relative z-10">
        <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[-.02em] max-md:max-w-[180px] max-md:text-[18px]">
          Every connection
          <br />
          has a beautiful beginning
        </h2>
        <p className="mt-3 text-[12px] leading-5 text-white/90 max-md:hidden">
          Discover compatible matches
          <br />
          who share your values and dreams.
        </p>
      </div>
    </section>
  );
}
