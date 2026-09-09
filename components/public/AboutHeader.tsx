import Image from "next/image";
import Link from "next/link";

export function AboutHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[70px] w-full max-w-[1400px] items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="Bandhanaa home" className="inline-flex items-center">
          <Image
            src="/bandhanaa-logo.png"
            alt="Bandhanaa"
            width={122}
            height={41}
            className="h-auto w-auto max-w-[126px] object-contain object-left"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-8 text-[13px] font-semibold text-[#1d1d1f] md:flex"
          aria-label="Main navigation"
        >
          <Link href="/#discover" className="transition-colors hover:text-[#e83e78]">
            Discover
          </Link>
          <Link href="/#how" className="transition-colors hover:text-[#e83e78]">
            How it works
          </Link>
          <Link href="/#safety" className="transition-colors hover:text-[#e83e78]">
            Safety
          </Link>
          <Link href="/about" aria-current="page" className="text-[#e83e78]">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-[13px] font-semibold sm:gap-4">
          <Link href="/login" className="hidden px-2 py-2 sm:inline-flex">
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-10 items-center rounded-full bg-black px-5 text-white transition-transform hover:-translate-y-px"
          >
            Create profile
          </Link>
        </div>
      </div>
    </header>
  );
}
