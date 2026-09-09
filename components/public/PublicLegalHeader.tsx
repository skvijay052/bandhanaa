import Image from "next/image";
import Link from "next/link";

export function PublicLegalHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between px-5 lg:px-10">
        <Link href="/" aria-label="Bandhanaa home" className="inline-flex items-center">
          <Image
            src="/bandhanaa-logo.png"
            alt="Bandhanaa"
            width={116}
            height={38}
            className="h-auto w-auto max-w-[126px] object-contain object-left"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-8 text-[12px] font-medium text-[#1d1d1f] md:flex"
          aria-label="Main navigation"
        >
          <Link href="/discover-matrimony" className="transition-opacity hover:opacity-60">
            Discover
          </Link>
          <Link href="/how-it-works" className="transition-opacity hover:opacity-60">
            How it works
          </Link>
          <Link href="/safety" className="transition-opacity hover:opacity-60">
            Safety
          </Link>
          <Link href="/about" className="transition-opacity hover:opacity-60">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-[12px] font-semibold sm:gap-4">
          <Link href="/login" className="hidden px-2 py-2 sm:inline-flex">
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-10 items-center rounded-full bg-black px-5 text-white transition-transform hover:scale-[1.01]"
          >
            Create profile
          </Link>
        </div>
      </div>
    </header>
  );
}
