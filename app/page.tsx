import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bandhanaa | Meaningful Matrimony Connections",
  description: "Discover meaningful matrimony connections based on values, compatibility and long-term intentions.",
};

const Pink = ({children}:{children:React.ReactNode}) => <span className="text-[#e83e78]">{children}</span>;
const Eyebrow = ({children}:{children:React.ReactNode}) => <p className="mb-3 text-[10px] font-bold uppercase tracking-[.28em] text-[#e83e78]">{children}</p>;
const serif = "font-serif tracking-[-.035em]";

export default function Home() {
  return <div className="bg-white text-[#1d1d1f]">
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 lg:px-10">
        <Link href="/" className="text-xl font-bold italic tracking-[-.06em]">Bandhanaa<Pink>•</Pink></Link>
        <nav className="hidden items-center gap-9 text-[13px] font-medium md:flex" aria-label="Main navigation">
          <a href="#discover">Discover</a><a href="#how">How it works</a><a href="#safety">Safety</a><a href="#about">About</a>
        </nav>
        <div className="flex items-center gap-3 text-[13px] font-semibold"><Link href="/login" className="hidden px-3 sm:block">Sign in</Link><Link href="/register" className="rounded-full bg-black px-5 py-2.5 text-white">Create profile</Link></div>
      </div>
    </header>

    <main>
      <section className="overflow-hidden bg-[#fbfbfd]" id="about">
        <div className="mx-auto grid min-h-[620px] max-w-[1320px] items-center gap-8 px-5 py-14 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-0">
          <div className="relative z-10 max-w-[570px]">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[.3em] text-[#6e6e73]">Meaningful connections</p>
            <h1 className="text-[clamp(48px,5.4vw,78px)] font-medium leading-[.98] tracking-[-.055em]">Marriage begins<br/>with the right<br/><Pink>connection.</Pink></h1>
            <p className="mt-6 max-w-[520px] text-[15px] leading-6 text-[#6e6e73]">Meet people with compatible values, intentions and life goals. Bandhanaa gives you a simpler, more private way to find someone meaningful.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/register" className="rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white">Create your profile →</Link><a href="#discover" className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3.5 text-sm font-semibold">Explore Bandhanaa</a></div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-xs"><span>♙ Free to register</span><span>♡ Free to connect</span><span>♢ Privacy controls built in</span></div>
          </div>
          <div className="relative h-[430px] lg:h-[620px]">
            <Image src="/bandhanaa-hero.png" alt="Bandhanaa meaningful connections" fill priority className="object-cover object-center" sizes="(max-width:1024px) 100vw, 55vw"/>
            <div className="absolute bottom-10 left-4 rounded-2xl bg-white/95 p-4 shadow-xl sm:left-auto sm:right-6 sm:bottom-24 sm:w-[245px]"><div className="flex gap-3"><Image src="/avatar-female-default.png" width={52} height={52} alt="Profile" className="size-13 rounded-xl object-cover"/><div><b className="text-sm">Ananya, 26 <Pink>♥</Pink></b><p className="mt-1 text-[11px] text-[#6e6e73]">Product Manager<br/>Chennai, Tamil Nadu</p></div></div><div className="mt-3 flex gap-2 text-[9px]"><span>✓ Values</span><span>Family</span><span>Lifestyle</span></div></div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 text-center lg:py-24">
        <Eyebrow>A more meaningful approach</Eyebrow><h2 className={`${serif} text-[clamp(40px,4.5vw,64px)] leading-[.98]`}>Not more profiles.<br/><em><Pink>Better reasons to connect.</Pink></em></h2>
        <p className="mx-auto mt-5 max-w-[760px] text-sm leading-6 text-[#6e6e73]">Bandhanaa helps you discover people based on what truly matters — your values, lifestyle, expectations and long-term goals. Less noise. More relevant connections.</p>
        <div className="mx-auto mt-12 grid max-w-[900px] grid-cols-2 divide-x divide-[#e5e5e7] md:grid-cols-4">{[["♢","Verified Profiles"],["♙","Intentional Matches"],["♡","Privacy Focused"],["♧","A Safer Community"]].map(([i,t])=><div key={t} className="px-4 py-3"><div className="mb-3 text-2xl">{i}</div><b className="text-xs">{t}</b></div>)}</div>
      </section>

      <section id="discover" className="bg-[#fbfbfd] px-5 py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.38fr_.62fr] lg:items-center">
          <div><Eyebrow>A closer look</Eyebrow><h2 className={`${serif} text-[clamp(38px,4vw,58px)] leading-[.98]`}>Thoughtfully designed<br/>for your journey.</h2><p className="mt-5 max-w-[430px] text-sm leading-6 text-[#6e6e73]">Explore, connect and communicate in a clean, modern and distraction-free space built for meaningful relationships.</p><div className="mt-7 border-l border-[#d2d2d7] text-sm">{["Discover","Matches","Profile","Requests","Messages"].map((x,i)=><div key={x} className={`py-2 pl-5 ${i===0?"border-l-2 border-[#e83e78] font-bold text-black":"text-[#6e6e73]"}`}>{x}{i===0&&<Pink> →</Pink>}</div>)}</div></div>
          <div className="relative mx-auto w-full max-w-[800px] rounded-[24px] border-[8px] border-black bg-white p-5 shadow-2xl"><div className="mb-5 flex items-center justify-between text-xs"><b className="italic">Bandhanaa<Pink>•</Pink></b><span>Discover　 Matches　 Requests　 Messages</span></div><h3 className="mb-4 font-semibold">Discover</h3><div className="grid grid-cols-3 gap-3">{[["/avatar-female-default.png","Ananya, 26","95% Match"],["/avatar-male-default.png","Rohit, 28","92% Match"],["/discover-female-default.png","Meera, 27","89% Match"]].map(([src,n,m])=><div key={n} className="overflow-hidden rounded-xl border border-[#e5e5e7] bg-white"><div className="relative aspect-[4/3]"><Image src={src} alt={n} fill className="object-cover" sizes="220px"/></div><div className="p-3"><b className="text-xs">{n}</b><p className="mt-1 text-[9px] text-[#6e6e73]">Professional<br/>Tamil Nadu</p><p className="mt-2 text-[10px] font-bold text-[#e83e78]">{m}</p></div></div>)}</div></div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10"><div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-2 lg:items-center"><div><Eyebrow>Beyond the basics</Eyebrow><h2 className={`${serif} text-[clamp(38px,4vw,58px)] leading-none`}>Compatibility is more<br/>than a photograph.</h2><p className="mt-5 max-w-[470px] text-sm leading-6 text-[#6e6e73]">Find people who align with what truly matters. Set your preferences and discover matches with shared values, background and life goals.</p></div><div className="grid grid-cols-2 gap-y-9 sm:grid-cols-4">{["⌖ Location","♧ Education","♧ Lifestyle","♙ Family","♢ Religion","♙ Mother Tongue","♡ Partner Preferences","⚙ Horoscope"].map(x=><div className="text-center text-xs" key={x}><div className="mb-2 text-xl">{x.split(" ")[0]}</div>{x.substring(x.indexOf(" ")+1)}</div>)}</div></div></section>

      <section id="how" className="bg-[#fbfbfd] px-5 py-20 lg:px-10"><div className="mx-auto max-w-[1320px]"><Eyebrow>A simple process</Eyebrow><h2 className={`${serif} text-[clamp(36px,4vw,56px)]`}>Four steps to a more meaningful connection.</h2><div className="mt-10 grid gap-8 md:grid-cols-4">{[["01","Create your profile","Tell people enough to make an informed introduction."],["02","Discover with context","See people based on what actually matters to you."],["03","Connect privately","Send a request. Chat when there's mutual interest."],["04","Take it forward","Bandhanaa helps with the introduction. What happens next stays yours."]].map(([n,t,d])=><div key={n} className="border-t border-[#d2d2d7] pt-5"><div className={`${serif} text-4xl`}>{n} <Pink>→</Pink></div><h3 className="mt-4 font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-[#6e6e73]">{d}</p></div>)}</div></div></section>

      <section className="overflow-hidden bg-[#fbfbfd] px-5 pb-20 lg:px-10"><div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-2 lg:items-center"><div className="rounded-2xl border border-[#e5e5e7] bg-white p-6 shadow-lg"><div className="flex gap-8 border-b pb-4 text-xs font-semibold"><span>Chart</span><span className="text-[#6e6e73]">Details</span><span className="text-[#6e6e73]">Compatibility</span></div><div className="grid gap-6 pt-6 sm:grid-cols-2"><div className="grid aspect-square grid-cols-3 border border-[#d2d2d7] text-center text-[10px]">{["Ra","Sa","Su","Ve","Me","Ju","Ma","Mo","Ke"].map(x=><span className="grid place-items-center border border-[#eee]" key={x}>{x}</span>)}</div><div className="grid grid-cols-2 gap-3 text-xs">{[["Rasi","Mithuna"],["Nakshatra","Arudra"],["Lagna","Tula"],["Navamsa","Kumbha"]].map(([a,b])=><div key={a}><span className="text-[#6e6e73]">{a}</span><br/><b>{b}</b></div>)}<div className="col-span-2 mt-2"><span className="text-[#6e6e73]">Compatibility</span><br/><b>Good Match</b><div className="mt-2 h-2 rounded-full bg-[#eee]"><div className="h-full w-[82%] rounded-full bg-black"/></div></div></div></div></div><div><Eyebrow>Your choice</Eyebrow><h2 className={`${serif} text-[clamp(40px,4.5vw,62px)] leading-none`}>Tradition, when<br/>it matters to you.</h2><p className="mt-5 max-w-[480px] text-sm leading-6 text-[#6e6e73]">If horoscope is important to you, Bandhanaa makes it easy to include and compare astrological details.</p><ul className="mt-5 space-y-2 text-sm">{["Rasi & Nakshatra","Lagna & Navamsa","Compatibility insights","Optional and always your choice"].map(x=><li key={x}><Pink>✓</Pink>　{x}</li>)}</ul></div></div></section>

      <section id="safety" className="bg-[#090a0b] text-white"><div className="mx-auto grid max-w-[1320px] lg:grid-cols-2"><div className="px-5 py-20 lg:px-10"><Eyebrow>A safer space</Eyebrow><h2 className={`${serif} text-[clamp(44px,5vw,68px)] leading-[.95]`}>Your profile.<br/>Your boundaries.</h2><p className="mt-5 max-w-[500px] text-sm leading-6 text-white/70">We take your privacy seriously. You control what you share and who can see it, with features designed for a safer and more respectful experience.</p><div className="mt-9 grid grid-cols-2 gap-2 sm:grid-cols-5">{["Profile visibility","Verification","Connection controls","Report & Block","Privacy settings"].map(x=><div key={x} className="rounded-lg bg-white/[.07] p-4 text-center text-[11px]">♡<br/><span className="mt-2 block">{x}</span></div>)}</div></div><div className="relative min-h-[360px]"><Image src="/bandhanaa-login-hero-desktop.png" alt="A safer private space" fill className="object-cover grayscale opacity-75" sizes="(max-width:1024px) 100vw, 50vw"/><div className="absolute inset-0 bg-gradient-to-r from-[#090a0b] via-transparent to-transparent"/></div></div></section>

      <section className="px-5 py-16 lg:px-10"><div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-2"><div><Eyebrow>Access for everyone</Eyebrow><h2 className="text-[clamp(42px,4.5vw,62px)] font-medium leading-none tracking-[-.05em]">Start without<br/>a subscription.</h2></div><div className="text-sm leading-6 text-[#6e6e73]"><p>Create your profile for free. Discover people. Send requests. Chat without paying to unlock a conversation.</p><div className="mt-5 grid grid-cols-2 gap-3">{["Free registration","Free to connect","Meaningful conversations","Privacy controls"].map(x=><span key={x}><Pink>✓</Pink>　{x}</span>)}</div></div></div></section>

      <section className="bg-[#fff7fa] px-5 py-20 text-center"><Eyebrow>A brighter tomorrow</Eyebrow><h2 className={`${serif} text-[clamp(38px,4.5vw,62px)]`}>Someone meaningful could start with <em><Pink>hello.</Pink></em></h2><div className="mt-8 flex flex-wrap justify-center gap-5 text-sm"><Link href="/register" className="rounded-full bg-black px-6 py-3.5 font-semibold text-white">Create your Bandhanaa profile →</Link><span className="self-center">Already a member? <Link href="/login" className="font-semibold underline">Sign in</Link></span></div></section>
    </main>

    <footer className="border-t border-[#eee] px-5 py-9"><div className="mx-auto flex max-w-[1320px] flex-col gap-6 text-xs text-[#6e6e73] md:flex-row md:items-center"><Link href="/" className="mr-5 text-xl font-bold italic text-black">Bandhanaa<Pink>•</Pink></Link><div className="flex flex-wrap gap-5"><a href="#about">About</a><a href="#safety">Safety</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><span>Contact</span><span>Help</span></div><div className="md:ml-auto">Instagram　 LinkedIn　 X　 YouTube　　© {new Date().getFullYear()} Bandhanaa. All rights reserved.</div></div></footer>
  </div>;
}
