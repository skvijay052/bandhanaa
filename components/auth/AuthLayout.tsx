import Image from "next/image";
import Link from "next/link";
import { Heart, ShieldCheck, UsersRound } from "lucide-react";
import { Brand } from "./Brand";

export function AuthLayout({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "login" | "register";
}) {
  const login = mode === "login";
  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-[#fbfcff] md:bg-white">
      <section
        className={`relative m-0 grid min-h-dvh w-full grid-cols-1 overflow-x-hidden bg-transparent md:bg-white ${login ? "lg:h-dvh lg:grid-cols-[50%_50%] lg:overflow-hidden" : "lg:h-dvh lg:grid-cols-[50%_50%] lg:overflow-hidden"}`}
      >
        <div className="pointer-events-none absolute -left-28 -top-24 size-[430px] rounded-full bg-[#dff9f3]/80 blur-2xl md:hidden" />
        <div className="pointer-events-none absolute -right-40 top-8 size-[420px] rounded-full bg-[#eee7ff]/80 blur-2xl md:hidden" />
        <div className="absolute left-4 top-5 z-20 lg:left-[5.5%] lg:top-10 lg:[&_img]:brightness-0 lg:[&_img]:invert">
          <Brand compact />
        </div>
        <Link
          href={login ? "/register" : "/login"}
          className="absolute right-4 top-5 z-20 flex h-11 items-center rounded-full bg-white/90 px-5 text-[12px] font-semibold text-[#8b3de8] shadow-[0_7px_22px_rgba(63,38,110,.10)] md:hidden"
        >
          {login ? "Create account" : "Sign in"}
        </Link>

        <div className="relative hidden min-h-dvh overflow-hidden lg:block">
          <div className="absolute inset-0">
            <Image
              src="/register-couple-sunset.png"
              alt="A couple looking toward a warm sunset"
              fill
              priority
              sizes={login ? "42vw" : "36vw"}
              className="object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80"
              aria-hidden
            />
          </div>

          <div className="absolute inset-x-[8%] bottom-[6%] z-10 text-white">
            <h1 className="font-serif text-[clamp(40px,3.3vw,58px)] leading-[1.02] tracking-[-.03em]">
              More than profiles.
              <br />
              <span className="text-[#f472b6]">Real possibilities.</span>
            </h1>
            <div className="mt-8 space-y-4 text-sm">
              <Feature
                icon={<Heart />}
                title="Trusted Community"
                text="Verified & genuine profiles"
              />
              <Feature
                icon={<UsersRound />}
                title="Meaningful Matches"
                text="Based on your preferences"
              />
              <Feature
                icon={<ShieldCheck />}
                title="Your Privacy First"
                text="Your information is always protected"
              />
            </div>
            <div className="mt-7 h-px w-14 bg-fuchsia-400" />
            <p className="mt-5 font-serif text-base italic">
              “Better people. Brighter futures.”
            </p>
          </div>
        </div>

        <div
          className={`relative flex min-w-0 flex-col justify-start px-4 pb-8 pt-[96px] items-stretch sm:px-8 lg:h-dvh lg:items-center lg:overflow-y-auto lg:bg-[radial-gradient(circle_at_85%_40%,#f8eefe_0,transparent_38%),radial-gradient(circle_at_15%_20%,#fdf2f8_0,transparent_32%),#faf9ff] lg:px-[5%] lg:pb-12 lg:pt-20`}
        >
          <p
            className={`absolute right-[9%] top-[34px] z-20 hidden text-[13px] text-muted lg:block`}
          >
            {login ? "New here? " : "Already have an account? "}
            <Link
              className="font-semibold text-[#6d28d9] hover:text-[#4c1d95]"
              href={login ? "/register" : "/login"}
            >
              {login ? "Create your profile" : "Sign in"}
            </Link>
          </p>

          <div
            className={`w-full min-w-0 shrink-0 rounded-[26px] border border-white/90 bg-white/95 px-5 py-6 shadow-[0_14px_38px_rgba(63,38,110,.10)] mx-auto max-w-[820px] lg:px-9 lg:py-7 lg:shadow-[0_18px_60px_rgba(66,32,104,.10)]`}
          >
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-full bg-white/15 text-fuchsia-300 [&_svg]:size-5">
        {icon}
      </span>
      <span>
        <strong className="block text-sm">{title}</strong>
        <small className="mt-0.5 block text-white/70">{text}</small>
      </span>
    </div>
  );
}
