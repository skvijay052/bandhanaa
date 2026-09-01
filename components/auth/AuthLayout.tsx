import Image from "next/image";
import Link from "next/link";
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
        className={`relative m-0 grid min-h-dvh w-full grid-cols-1 overflow-x-hidden bg-transparent md:bg-white ${login ? "md:h-dvh md:grid-cols-[55%_45%] md:overflow-y-hidden" : "md:min-h-dvh md:grid-cols-[56%_44%]"}`}
      >
        <div className="pointer-events-none absolute -left-28 -top-24 size-[430px] rounded-full bg-[#dff9f3]/80 blur-2xl md:hidden" />
        <div className="pointer-events-none absolute -right-40 top-8 size-[420px] rounded-full bg-[#eee7ff]/80 blur-2xl md:hidden" />
        <div
          className={`absolute z-20 max-md:left-4 max-md:top-5 ${login ? "md:left-[46px] md:top-7" : "md:left-7 md:top-3"}`}
        >
          <Brand compact />
        </div>
        <Link
          href={login ? "/register" : "/login"}
          className="absolute right-4 top-5 z-20 flex h-11 items-center rounded-full bg-white/90 px-5 text-[12px] font-semibold text-[#8b3de8] shadow-[0_7px_22px_rgba(63,38,110,.10)] md:hidden"
        >
          {login ? "Create account" : "Sign in"}
        </Link>

        <p className="absolute right-[42px] top-[34px] z-20 hidden text-[13px] text-muted md:block">
          {login ? "New here? " : "Already have an account? "}
          <Link
            className="text-accent hover:text-[#8144b5]"
            href={login ? "/register" : "/login"}
          >
            {login ? "Create your profile" : "Sign in"}
          </Link>
        </p>

        <div className="relative hidden min-h-[700px] overflow-hidden md:block">
          <div
            className={`absolute top-[13%] z-10 space-y-4 ${login ? "left-[6%]" : "left-[3.2%]"}`}
          >
            <h1
              className={`font-bold leading-[.99] tracking-[-.045em] text-ink ${login ? "text-[clamp(54px,4.2vw,66px)]" : "text-[clamp(45px,3.7vw,64px)]"}`}
            >
              Meaningful
              <br />
              connections
              <br />
              begin here.
            </h1>
            <p
              className={`${login ? "max-w-[420px] text-lg" : "max-w-[390px] text-base"} leading-[1.5] text-muted`}
            >
              {login ? (
                <>
                  Discover people who share your values,
                  <br />
                  aspirations, and vision for the future.
                </>
              ) : (
                <>
                  Create your profile and take the next step
                  <br />
                  towards finding a meaningful connection.
                </>
              )}
            </p>
          </div>
          <div className="absolute inset-0">
            <Image
              src={
                login
                  ? "/bandhanaa-register-hero-full.png"
                  : "/bandhanaa-register-onboarding-bg.png"
              }
              alt="A couple surrounded by flowing pink, peach, and violet light"
              fill
              priority
              sizes="56vw"
              className="object-cover object-left"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/5"
              aria-hidden
            />
          </div>
          <p className="absolute bottom-[26px] left-[46px] z-10 text-xs text-muted">
            © 2024 Bandhanaa
          </p>
        </div>

        <div
          className={`relative flex min-w-0 flex-col justify-start px-4 pb-8 pt-[96px] md:pb-16 ${login ? "items-center sm:px-[42px] md:items-start md:justify-center md:pl-[52px] md:pr-10 md:pt-[76px]" : "items-stretch sm:px-8 md:items-center md:justify-start md:px-12 md:pt-[70px]"}`}
        >
          <div
            className={`w-full min-w-0 shrink-0 rounded-[26px] border border-white/90 bg-white/95 px-5 py-6 shadow-[0_14px_38px_rgba(63,38,110,.10)] md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none ${login ? "max-w-[430px]" : "max-w-[550px]"}`}
          >
            {children}
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="absolute bottom-[26px] right-[42px] hidden items-center gap-10 text-xs text-muted md:flex"
        >
          <Link className="hover:text-ink" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-ink" href="/terms">
            Terms of Use
          </Link>
          <Link className="hover:text-ink" href="/help">
            Help
          </Link>
          <Link className="hover:text-ink" href="/contact">
            Contact
          </Link>
        </nav>
      </section>
    </main>
  );
}
