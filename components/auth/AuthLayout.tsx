import Image from "next/image";
import Link from "next/link";
import { Brand } from "./Brand";

export function AuthLayout({ children, mode }: { children: React.ReactNode; mode: "login" | "register" }) {
  const login = mode === "login";
  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-white">
      <section className={`relative m-0 grid min-h-dvh w-full grid-cols-1 overflow-x-hidden bg-white ${login ? "md:h-dvh md:grid-cols-[55%_45%] md:overflow-y-hidden" : "md:min-h-dvh md:grid-cols-[56%_44%]"}`}>
        <div className={`absolute z-20 ${login ? "left-1/2 top-[22px] -translate-x-1/2 md:left-[46px] md:top-7 md:translate-x-0" : "left-2.5 top-1 md:left-7 md:top-3"}`}><Brand compact={!login} /></div>

        <p className="absolute right-[42px] top-[34px] z-20 hidden text-[13px] text-muted md:block">
          {login ? "New here? " : "Already have an account? "}
          <Link className="text-accent hover:text-[#8144b5]" href={login ? "/register" : "/login"}>{login ? "Create your profile" : "Sign in"}</Link>
        </p>

        <div className="relative hidden min-h-[700px] overflow-hidden md:block">
          <div className={`absolute top-[13%] z-10 space-y-4 ${login ? "left-[6%]" : "left-[3.2%]"}`}>
            <h1 className={`font-bold leading-[.99] tracking-[-.045em] text-ink ${login ? "text-[clamp(54px,4.2vw,66px)]" : "text-[clamp(45px,3.7vw,64px)]"}`}>Meaningful<br />connections<br />begin here.</h1>
            <p className={`${login ? "max-w-[420px] text-lg" : "max-w-[390px] text-base"} leading-[1.5] text-muted`}>{login ? <>Discover people who share your values,<br />aspirations, and vision for the future.</> : <>Create your profile and take the next step<br />towards finding a meaningful connection.</>}</p>
          </div>
          <div className="absolute inset-0">
            <Image src={login ? "/bandhanaa-register-hero-full.png" : "/bandhanaa-register-onboarding-bg.png"} alt="A couple surrounded by flowing pink, peach, and violet light" fill priority sizes="56vw" className="object-cover object-left" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/5" aria-hidden />
          </div>
          <p className="absolute bottom-[26px] left-[46px] z-10 text-xs text-muted">© 2024 Bandhanaa</p>
        </div>

        <div className={`flex min-w-0 flex-col justify-start pb-7 md:pb-16 ${login ? "items-center px-6 pt-[100px] sm:px-[42px] md:items-start md:justify-center md:pl-[52px] md:pr-10 md:pt-[76px]" : "items-stretch px-2.5 pt-[48px] sm:px-8 md:items-center md:justify-start md:px-12 md:pt-[70px]"}`}>
          {login && <div className="relative mb-2 mt-7 h-[180px] w-[305px] max-w-[90vw] overflow-hidden rounded-2xl md:hidden">
            <Image src="/bandhanaa-register-hero-full.png" alt="A couple surrounded by flowing pastel ribbons" fill priority sizes="305px" className="object-cover object-left-bottom" />
          </div>}
          <div className={`w-full min-w-0 shrink-0 ${login ? "max-w-[430px]" : "max-w-[550px]"}`}>{children}</div>
        </div>

        <nav aria-label="Footer" className="absolute bottom-[26px] right-[42px] hidden items-center gap-10 text-xs text-muted md:flex">
          <Link className="hover:text-ink" href="/privacy">Privacy Policy</Link><Link className="hover:text-ink" href="/terms">Terms of Use</Link><Link className="hover:text-ink" href="/help">Help</Link><Link className="hover:text-ink" href="/contact">Contact</Link>
        </nav>
      </section>
    </main>
  );
}
