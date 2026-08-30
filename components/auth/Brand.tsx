import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative ${compact ? "h-[42px] w-[116px] md:h-[58px] md:w-[160px]" : "h-[58px] w-[160px] md:h-[66px] md:w-[180px]"}`}>
      <Image src="/bandhanaa-logo-new.svg" alt="Bandhanaa" fill priority sizes={compact ? "(max-width: 899px) 116px, 160px" : "(max-width: 899px) 160px, 180px"} className="object-contain object-left" />
    </div>
  );
}
