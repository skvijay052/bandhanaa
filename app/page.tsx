import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Ban,
  Eye,
  GraduationCap,
  Heart,
  Languages,
  Leaf,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Bandhanaa | Meaningful Matrimony Connections",
  description:
    "Discover meaningful matrimony connections based on values, compatibility and long-term intentions.",
};

const pink = "#e83e78";
const serif = "font-[Georgia,'Times_New_Roman',serif] tracking-[-0.04em]";

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={`mb-3 text-[10px] font-bold uppercase tracking-[0.26em] ${dark ? "text-white/55" : "text-[#e83e78]"}`}
    >
      {children}
    </p>
  );
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="Bandhanaa home" className="inline-flex items-center">
      <Image
        src="/bandhanaa-logo-new.svg"
        alt="Bandhanaa"
        width={compact ? 116 : 132}
        height={38}
        className="h-auto w-auto max-w-[132px] object-contain"
        priority
      />
    </Link>
  );
}

const meaningfulFeatures = [
  { icon: BadgeCheck, label: "Verified\nProfiles" },
  { icon: UsersRound, label: "Intentional\nMatches" },
  { icon: Heart, label: "Privacy\nFocused" },
  { icon: ShieldCheck, label: "A Safer\nCommunity" },
];

const compatibility = [
  { icon: MapPin, label: "Location" },
  { icon: GraduationCap, label: "Education" },
  { icon: Leaf, label: "Lifestyle" },
  { icon: UsersRound, label: "Family" },
  { icon: Heart, label: "Religion" },
  { icon: Languages, label: "Mother Tongue" },
  { icon: UserRound, label: "Partner Preferences" },
  { icon: Settings, label: "Horoscope" },
];

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Create your profile",
    description: "Tell people enough to make an informed introduction.",
  },
  {
    number: "02",
    icon: Search,
    title: "Discover with context",
    description: "See people based on what actually matters to you.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Connect privately",
    description: "Send a request. Chat when there's mutual interest.",
  },
  {
    number: "04",
    icon: Heart,
    title: "Take it forward",
    description:
      "Bandhanaa helps with the introduction. What happens next stays yours.",
  },
];

const privacyItems = [
  { icon: Eye, label: "Profile\nvisibility" },
  { icon: BadgeCheck, label: "Verification" },
  { icon: UsersRound, label: "Connection\ncontrols" },
  { icon: Ban, label: "Report &\nBlock" },
  { icon: LockKeyhole, label: "Privacy settings" },
];

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-white text-[#1d1d1f]">
      <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between px-5 lg:px-10">
          <BrandLogo compact />

          <nav
            className="hidden items-center gap-8 text-[12px] font-medium text-[#1d1d1f] md:flex"
            aria-label="Main navigation"
          >
            <a href="#discover" className="transition-opacity hover:opacity-60">
              Discover
            </a>
            <a href="#how" className="transition-opacity hover:opacity-60">
              How it works
            </a>
            <a href="#safety" className="transition-opacity hover:opacity-60">
              Safety
            </a>
            <a href="#about" className="transition-opacity hover:opacity-60">
              About
            </a>
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

      <main>
        <section id="about" className="bg-[#fbfbfd]">
          <div className="mx-auto grid max-w-[1320px] lg:min-h-[610px] lg:grid-cols-[0.88fr_1.12fr]">
            <div className="relative z-10 flex items-center px-5 py-14 lg:px-10 lg:py-20">
              <div className="max-w-[545px]">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.30em] text-[#6e6e73]">
                  Meaningful connections
                </p>
                <h1 className="text-[clamp(47px,5.1vw,76px)] font-medium leading-[0.97] tracking-[-0.06em]">
                  Marriage begins
                  <br />
                  with the right
                  <br />
                  <span style={{ color: pink }}>connection.</span>
                </h1>
                <p className="mt-6 max-w-[505px] text-[14px] leading-6 text-[#6e6e73] sm:text-[15px]">
                  Meet people with compatible values, intentions and life goals. Bandhanaa gives
                  you a simpler, more private way to find someone meaningful.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex min-h-12 items-center rounded-full bg-black px-6 text-[13px] font-semibold text-white"
                  >
                    Create your profile <span className="ml-2">→</span>
                  </Link>
                  <a
                    href="#discover"
                    className="inline-flex min-h-12 items-center rounded-full border border-[#d2d2d7] bg-white px-6 text-[13px] font-semibold"
                  >
                    Explore Bandhanaa
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-[11px] font-medium text-[#2b2b2d]">
                  <span className="inline-flex items-center gap-2">
                    <UserRound size={15} strokeWidth={1.6} /> Free to register
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Heart size={15} strokeWidth={1.6} /> Free to connect
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck size={15} strokeWidth={1.6} /> Privacy controls built in
                  </span>
                </div>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden lg:min-h-[610px]">
              <Image
                src="/bandhanaa-hero.png"
                alt="Bandhanaa member"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 56vw"
              />
              <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#fbfbfd] to-transparent lg:block" />

              <div className="absolute bottom-7 left-5 w-[235px] rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-[0_16px_45px_rgba(0,0,0,.13)] sm:bottom-20 sm:left-auto sm:right-8">
                <div className="flex items-center gap-3">
                  <Image
                    src="/avatar-female-default.png"
                    width={52}
                    height={52}
                    alt="Ananya profile"
                    className="size-[52px] rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[13px] font-bold">
                      Ananya, 26
                      <BadgeCheck size={14} fill="#e83e78" color="#e83e78" />
                    </div>
                    <p className="mt-1 text-[10px] leading-[1.45] text-[#6e6e73]">
                      Product Manager
                      <br />
                      Chennai, Tamil Nadu
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[9px] font-medium">
                  <span>✓ Values</span>
                  <span>Family</span>
                  <span>Lifestyle</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-[74px] text-center lg:py-[88px]">
          <Eyebrow>A more meaningful approach</Eyebrow>
          <h2 className={`${serif} text-[clamp(39px,4.25vw,62px)] leading-[0.96]`}>
            Not more profiles.
            <br />
            <em className="font-normal text-[#e83e78]">Better reasons to connect.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[760px] text-[13px] leading-6 text-[#6e6e73] sm:text-[14px]">
            Bandhanaa helps you discover people based on what truly matters — your values,
            lifestyle, expectations and long-term goals. Less noise. More relevant connections.
          </p>

          <div className="mx-auto mt-10 grid max-w-[880px] grid-cols-2 md:grid-cols-4">
            {meaningfulFeatures.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className={`px-5 py-3 ${index > 0 ? "border-l border-[#e6e6e9]" : ""}`}
              >
                <Icon className="mx-auto mb-3" size={25} strokeWidth={1.5} />
                <p className="whitespace-pre-line text-[11px] font-semibold leading-[1.35]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="discover" className="bg-[#fbfbfd] px-5 py-[72px] lg:px-10 lg:py-[86px]">
          <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
            <div>
              <Eyebrow>A closer look</Eyebrow>
              <h2 className={`${serif} text-[clamp(39px,4vw,57px)] leading-[0.98]`}>
                Thoughtfully designed
                <br />
                for your journey.
              </h2>
              <p className="mt-5 max-w-[390px] text-[13px] leading-6 text-[#6e6e73] sm:text-[14px]">
                Explore, connect and communicate in a clean, modern and distraction-free space
                built for meaningful relationships.
              </p>

              <div className="mt-7 border-l border-[#d2d2d7] text-[13px]">
                {["Discover", "Matches", "Profile", "Requests", "Messages"].map((item, index) => (
                  <div
                    key={item}
                    className={`relative py-[7px] pl-5 ${index === 0 ? "font-semibold text-black" : "text-[#6e6e73]"}`}
                  >
                    {index === 0 && (
                      <span className="absolute -left-px top-0 h-full w-[2px] bg-[#e83e78]" />
                    )}
                    {item}
                    {index === 0 && <span className="ml-4 text-[#e83e78]">→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[820px] pb-12 pr-0 sm:pr-16">
              <div className="rounded-[22px] border-[7px] border-black bg-white p-4 shadow-[0_22px_55px_rgba(0,0,0,.18)] sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-[#ededf0] pb-3 text-[9px] sm:text-[10px]">
                  <BrandLogo compact />
                  <span className="hidden text-[#6e6e73] sm:inline">Discover　 Matches　 Requests　 Messages</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold">Discover</h3>
                  <div className="flex gap-2 text-[#6e6e73]">
                    <Search size={14} />
                    <Heart size={14} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[8px] sm:text-[9px]">
                  <span className="rounded-full bg-black px-3 py-1 text-white">All</span>
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1">Near you</span>
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1">New members</span>
                  <span className="rounded-full bg-[#f5f5f7] px-3 py-1">Verified</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    ["/avatar-female-default.png", "Ananya, 26", "Product Manager", "95% Match"],
                    ["/avatar-male-default.png", "Rohit, 28", "Software Engineer", "92% Match"],
                    ["/discover-female-default.png", "Meera, 27", "Consultant", "89% Match"],
                  ].map(([src, name, role, match]) => (
                    <article key={name} className="overflow-hidden rounded-xl border border-[#e5e5e7] bg-white">
                      <div className="relative aspect-[4/3]">
                        <Image src={src} alt={name} fill className="object-cover" sizes="220px" />
                      </div>
                      <div className="p-2.5 sm:p-3">
                        <h4 className="text-[9px] font-semibold sm:text-[11px]">{name}</h4>
                        <p className="mt-1 text-[7px] leading-[1.4] text-[#6e6e73] sm:text-[9px]">
                          {role}
                          <br />
                          Tamil Nadu
                        </p>
                        <p className="mt-2 text-[8px] font-bold text-[#e83e78] sm:text-[9px]">{match}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 right-0 hidden w-[170px] rounded-[30px] border-[7px] border-black bg-white p-2 shadow-[0_18px_38px_rgba(0,0,0,.18)] sm:block">
                <div className="mx-auto mb-2 h-2.5 w-16 rounded-full bg-black" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src="/avatar-male-default.png" alt="Karthik profile" fill className="object-cover" sizes="160px" />
                </div>
                <div className="p-2">
                  <h4 className="text-[10px] font-bold">Karthik, 29 <span className="text-[#e83e78]">♥</span></h4>
                  <p className="mt-1 text-[7px] leading-[1.5] text-[#6e6e73]">Product Manager<br/>Coimbatore, TN</p>
                  <div className="my-2 flex gap-1 text-[6px]"><span>Values</span><span>Family Oriented</span></div>
                  <p className="text-[7px] font-semibold">About</p>
                  <p className="mt-1 line-clamp-3 text-[6px] leading-[1.45] text-[#6e6e73]">Kind, honest, values family and meaningful conversations.</p>
                  <button type="button" className="mt-3 w-full rounded-full bg-black py-2 text-[7px] font-semibold text-white">Send Request</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-[70px] lg:px-10">
          <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
            <div>
              <Eyebrow>Beyond the basics</Eyebrow>
              <h2 className={`${serif} text-[clamp(39px,4vw,56px)] leading-[0.98]`}>
                Compatibility is more
                <br />
                than a photograph.
              </h2>
              <p className="mt-5 max-w-[450px] text-[13px] leading-6 text-[#6e6e73] sm:text-[14px]">
                Find people who align with what truly matters. Set your preferences and discover
                matches with shared values, background and life goals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
              {compatibility.map(({ icon: Icon, label }, index) => (
                <div
                  key={label}
                  className={`text-center ${index % 4 !== 0 ? "sm:border-l sm:border-[#e7e7ea]" : ""}`}
                >
                  <Icon className="mx-auto mb-3" size={24} strokeWidth={1.45} />
                  <p className="text-[10px] font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="relative overflow-hidden bg-[#fbfbfd] px-5 py-[70px] lg:px-10">
          <div className="absolute -bottom-24 -right-20 size-[330px] rounded-full bg-[#fff0f6]" aria-hidden />
          <div className="relative mx-auto max-w-[1320px]">
            <Eyebrow>A simple process</Eyebrow>
            <h2 className={`${serif} text-[clamp(37px,4vw,55px)] leading-none`}>
              Four steps to a more meaningful connection.
            </h2>

            <div className="mt-10 grid gap-7 md:grid-cols-4 md:gap-0">
              {steps.map(({ number, icon: Icon, title, description }, index) => (
                <div
                  key={number}
                  className={`relative pr-7 ${index > 0 ? "md:border-l md:border-[#e1e1e4] md:pl-7" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${serif} text-[42px] leading-none`}>{number}</span>
                    <Icon size={30} color={pink} strokeWidth={1.4} />
                  </div>
                  <h3 className="mt-4 text-[13px] font-bold">{title}</h3>
                  <p className="mt-2 max-w-[220px] text-[12px] leading-5 text-[#6e6e73]">{description}</p>
                  {index < 3 && <span className="absolute -right-1 top-5 hidden text-[#e83e78] md:block">→</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fbfbfd] px-5 pb-[78px] pt-2 lg:px-10">
          <div className="absolute -bottom-28 right-[-80px] size-[390px] rounded-full bg-[#fff2f7]" aria-hidden />
          <div className="relative mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.56fr_0.44fr] lg:items-center">
            <div className="rounded-2xl border border-[#e5e5e7] bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,.07)] sm:p-6">
              <div className="flex gap-8 border-b border-[#ededf0] pb-4 text-[11px] font-medium">
                <span className="border-b-2 border-black pb-3">Chart</span>
                <span className="text-[#8a8a8e]">Details</span>
                <span className="text-[#8a8a8e]">Compatibility</span>
              </div>
              <div className="grid gap-6 pt-6 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="relative aspect-square border border-[#d2d2d7]">
                  <div className="absolute inset-0 rotate-45 scale-[0.71] border border-[#d2d2d7]" />
                  {[
                    ["Ra", "left-4 top-4"],
                    ["Sa", "right-4 top-4"],
                    ["Su", "right-4 bottom-4"],
                    ["Ke", "left-4 bottom-4"],
                    ["Me", "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"],
                  ].map(([planet, pos]) => (
                    <span key={planet} className={`absolute ${pos} z-10 text-[9px] font-semibold`}>{planet}</span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] sm:text-[11px]">
                  {[
                    ["Rasi", "Mithuna"],
                    ["Nakshatra", "Arudra"],
                    ["Lagna", "Tula"],
                    ["Navamsa", "Kumbha"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#fbfbfd] p-3">
                      <span className="text-[#8a8a8e]">{label}</span>
                      <br />
                      <strong>{value}</strong>
                    </div>
                  ))}
                  <div className="col-span-2 rounded-lg bg-[#fbfbfd] p-3">
                    <span className="text-[#8a8a8e]">Compatibility</span>
                    <div className="mt-1 flex items-end justify-between"><strong>Good Match</strong><span className="text-[10px]">82%</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7e7ea]"><div className="h-full w-[82%] rounded-full bg-black" /></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Eyebrow>Your choice</Eyebrow>
              <h2 className={`${serif} text-[clamp(40px,4.3vw,61px)] leading-[0.96]`}>
                Tradition, when
                <br />
                it matters to you.
              </h2>
              <p className="mt-5 max-w-[450px] text-[13px] leading-6 text-[#6e6e73] sm:text-[14px]">
                If horoscope is important to you, Bandhanaa makes it easy to include and compare
                astrological details.
              </p>
              <ul className="mt-5 space-y-2 text-[12px] text-[#4f4f53] sm:text-[13px]">
                {["Rasi & Nakshatra", "Lagna & Navamsa", "Compatibility insights", "Optional and always your choice"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="font-bold text-[#e83e78]">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="safety" className="bg-[#090a0b] text-white">
          <div className="mx-auto grid max-w-[1320px] lg:grid-cols-[0.57fr_0.43fr]">
            <div className="px-5 py-[66px] lg:px-10">
              <Eyebrow dark>A safer space</Eyebrow>
              <h2 className={`${serif} text-[clamp(43px,4.6vw,65px)] leading-[0.94]`}>
                Your profile.
                <br />
                Your boundaries.
              </h2>
              <p className="mt-5 max-w-[490px] text-[13px] leading-6 text-white/70 sm:text-[14px]">
                We take your privacy seriously. You control what you share and who can see it,
                with features designed for a safer and more respectful experience.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {privacyItems.map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-lg bg-white/[0.07] px-2 py-4 text-center">
                    <Icon className="mx-auto mb-2" size={20} strokeWidth={1.5} />
                    <span className="whitespace-pre-line text-[9px] font-medium leading-[1.35] text-white/85">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden lg:min-h-full">
              <Image
                src="/bandhanaa-login-hero-desktop.png"
                alt="Private and respectful connection"
                fill
                className="object-cover grayscale opacity-75"
                sizes="(max-width:1024px) 100vw, 43vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090a0b] via-[#090a0b]/20 to-transparent" />
            </div>
          </div>
        </section>

        <section className="px-5 py-[58px] lg:px-10">
          <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
            <div>
              <Eyebrow>Access for everyone</Eyebrow>
              <h2 className="text-[clamp(41px,4vw,58px)] font-medium leading-[0.98] tracking-[-0.055em]">
                Start without
                <br />
                a subscription.
              </h2>
            </div>
            <div className="border-l-0 text-[13px] leading-6 text-[#6e6e73] lg:border-l lg:border-[#e7e7ea] lg:pl-10">
              <p>Create your profile for free. Discover people. Send requests. Chat without paying to unlock a conversation.</p>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {["Free registration", "Free to connect", "Meaningful conversations", "Privacy controls"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="font-bold text-[#e83e78]">✓</span>{item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fff9fb] px-5 py-[72px] text-center">
          <div className="absolute -bottom-28 -left-24 size-[350px] rounded-full bg-[#fde4ef] opacity-60" aria-hidden />
          <div className="relative">
            <Eyebrow>A brighter tomorrow</Eyebrow>
            <h2 className={`${serif} text-[clamp(38px,4.2vw,59px)] leading-none`}>
              Someone meaningful could start with <em className="font-normal text-[#e83e78]">hello.</em>
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[12px]">
              <Link href="/register" className="inline-flex min-h-12 items-center rounded-full bg-black px-6 font-semibold text-white">
                Create your Bandhanaa profile <span className="ml-2">→</span>
              </Link>
              <span>
                Already a member?{" "}
                <Link href="/login" className="font-semibold underline underline-offset-2">Sign in</Link>
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#eeeeef] bg-white px-5 py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 text-[10px] text-[#6e6e73] md:flex-row md:items-center">
          <BrandLogo compact />
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
            <a href="#about">About</a>
            <a href="#safety">Safety</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>Contact</span>
            <span>Help</span>
          </nav>
          <div className="flex items-center gap-4 md:ml-auto">
            <span aria-label="Instagram">◎</span>
            <span aria-label="LinkedIn">in</span>
            <span aria-label="X">X</span>
            <span aria-label="YouTube">▶</span>
            <span className="ml-2">© {new Date().getFullYear()} Bandhanaa. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
