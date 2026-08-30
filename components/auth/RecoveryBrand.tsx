import Image from "next/image";

export function BrandIdentity({ compact = false }: { compact?: boolean }) {
  return (
    <div className="text-center text-[#15162a]">
      <div
        className={`relative mx-auto overflow-hidden ${compact ? "h-12 w-12" : "h-[66px] w-[62px]"}`}
      >
        <Image
          src="/bandhanaa-logo.png"
          alt=""
          width={228}
          height={76}
          priority
          className={`absolute left-0 top-0 max-w-none object-contain ${compact ? "h-12 w-[144px]" : "h-[66px] w-[198px]"}`}
        />
      </div>
      <p
        className={`font-semibold tracking-[.26em] text-black ${compact ? "mt-1 text-[16px]" : "mt-3 text-[20px]"}`}
      >
        BANDHANAA
      </p>
      <p
        className={`mt-3 leading-[1.65] text-[#3c3f61] ${compact ? "text-[11px]" : "text-[13px]"}`}
      >
        Meaningful connections.
        <br />
        Lifelong bonds.
      </p>
    </div>
  );
}

export function RecoveryIllustration({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={`relative mx-auto ${mobile ? "h-[155px] w-[250px]" : "h-[370px] w-full max-w-[410px]"}`}
    >
      <Image
        src="/images/forgot-password-envelope.png"
        alt="Pink envelope secured with a padlock"
        fill
        priority
        sizes={mobile ? "250px" : "410px"}
        className="object-contain"
      />
    </div>
  );
}

export function DesktopBrandPanel() {
  return (
    <aside className="relative hidden w-[35%] shrink-0 border-r border-[#eeeef3] bg-[radial-gradient(circle_at_50%_55%,rgba(255,225,242,.55),transparent_38%),linear-gradient(180deg,#fff_0%,#fff8fc_100%)] md:block">
      <div className="pt-[92px]">
        <BrandIdentity />
      </div>
      <div className="mt-16">
        <RecoveryIllustration />
      </div>
      <p className="absolute bottom-12 left-9 text-[13px] leading-7 text-[#3a3d60]">
        © 2026 Bandhanaa
        <br />
        All rights reserved.
      </p>
    </aside>
  );
}
