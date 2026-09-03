import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md ${compact ? "h-[50px] w-[150px] md:h-[54px] md:w-[180px]" : "h-[56px] w-[180px] md:h-[64px] md:w-[210px]"}`}
    >
      <Image
        src="/bandhanaa-logo.png"
        alt="Bandhanaa"
        fill
        priority
        sizes={
          compact
            ? "(max-width: 899px) 140px, 180px"
            : "(max-width: 899px) 180px, 210px"
        }
        className="object-contain object-left"
      />
    </div>
  );
}
