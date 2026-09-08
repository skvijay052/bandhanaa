import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
import { HomeReveal } from "@/components/home/HomeReveal";
import styles from "./homepage.module.css";

export const metadata: Metadata = {
  title: "Bandhanaa | Meaningful Matrimony Connections",
  description:
    "Discover meaningful matrimony connections based on values, compatibility and long-term intentions.",
};

const meaningfulFeatures = [
  { icon: BadgeCheck, label: "Verified Profiles" },
  { icon: UsersRound, label: "Intentional Matches" },
  { icon: Heart, label: "Privacy Focused" },
  { icon: ShieldCheck, label: "A Safer Community" },
];

const compatibilityItems = [
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
  { number: "01", icon: UserRound, title: "Create your profile", description: "Tell people enough to make an informed introduction." },
  { number: "02", icon: Search, title: "Discover with context", description: "See people based on what actually matters to you." },
  { number: "03", icon: MessageSquare, title: "Connect privately", description: "Send a request. Chat when there’s mutual interest." },
  { number: "04", icon: Heart, title: "Take it forward", description: "Bandhanaa helps with the introduction. What happens next stays yours." },
];

const privacyItems = [
  { icon: Eye, label: "Profile visibility" },
  { icon: BadgeCheck, label: "Verification" },
  { icon: UsersRound, label: "Connection controls" },
  { icon: Ban, label: "Report & Block" },
  { icon: LockKeyhole, label: "Privacy settings" },
];

const showcaseProfiles = [
  { src: "/profiles/ananya.png", name: "Ananya, 26", role: "Product Manager", city: "Chennai, Tamil Nadu", match: "95% Match" },
  { src: "/profiles/rohan.png", name: "Rohit, 28", role: "Software Engineer", city: "Bengaluru, Karnataka", match: "92% Match" },
  { src: "/profiles/priya.png", name: "Meera, 27", role: "Consultant", city: "Hyderabad, Telangana", match: "89% Match" },
];

const showcaseMenu = [
  { icon: Search, label: "Discover" },
  { icon: Heart, label: "Matches" },
  { icon: UserRound, label: "Profile" },
  { icon: MessageSquare, label: "Requests" },
  { icon: MessageSquare, label: "Messages" },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HomeReveal />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="Bandhanaa home">
            <Image src="/bandhanaa-logo.png" alt="Bandhanaa" width={240} height={84} className={styles.logo} priority />
          </Link>
          <nav className={styles.nav} aria-label="Homepage navigation">
            <a href="#discover">Discover</a>
            <a href="#how">How it works</a>
            <a href="#safety">Safety</a>
            <a href="#about">About</a>
          </nav>
          <div className={styles.headerActions}>
            <Link href="/login">Sign in</Link>
            <Link href="/register" className={styles.pill}>Create profile <span>→</span></Link>
          </div>
        </div>
      </header>

      <main>
        <section id="about" className={styles.hero}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.heroCopyInner} data-home-reveal>
                <p className={styles.eyebrow}>Meaningful connections</p>
                <h1 className={`${styles.serif} ${styles.heroTitle}`}>Marriage begins<br />with the right<br /><em>connection.</em></h1>
                <p className={styles.body}>Meet people with compatible values, intentions and life goals. Bandhanaa gives you a simpler, more private way to find someone meaningful.</p>
                <div className={styles.ctaRow}>
                  <Link href="/register" className={styles.pill}>Create your profile <span>→</span></Link>
                  <a href="#discover" className={styles.pillLight}>Explore Bandhanaa</a>
                </div>
                <div className={styles.benefits}>
                  <span className={styles.benefit}><UserRound size={15} strokeWidth={1.7} /> Free to register</span>
                  <span className={styles.benefit}><Heart size={15} strokeWidth={1.7} /> Free to connect</span>
                  <span className={styles.benefit}><ShieldCheck size={15} strokeWidth={1.7} /> Privacy controls built in</span>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Image src="/bandhanaa-register-hero-full.png" alt="Bandhanaa member" fill priority sizes="(max-width: 1023px) 100vw, 56vw" />
              <div className={styles.heroFade} />
              <div className={styles.handNote}>Real ♡{"\n"}People{"\n"}Meaningful{"\n"}Connections</div>
              <div className={styles.profileFloat}>
                <div className={styles.profileTop}>
                  <Image src="/profiles/ananya.png" width={100} height={100} alt="Ananya profile" className={styles.profileThumb} />
                  <div>
                    <div className={styles.profileName}>Ananya, 26 <BadgeCheck size={13} color="#e83e78" /></div>
                    <div className={styles.profileMeta}>Product Manager<br />Chennai, Tamil Nadu</div>
                  </div>
                </div>
                <div className={styles.tags}><span className={styles.tag}>♡ Values</span><span className={styles.tag}>Family</span><span className={styles.tag}>Lifestyle</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.meaningful}>
          <div className={styles.sectionCopy} data-home-reveal>
            <p className={styles.eyebrow}>A more meaningful approach</p>
            <h2 className={`${styles.serif} ${styles.sectionTitle}`}>Not more profiles.<br /><em>Better reasons to connect.</em></h2>
            <p className={styles.body}>Bandhanaa helps you discover people based on what truly matters — your values, lifestyle, expectations and long-term goals. Less noise. More relevant connections.</p>
            <div className={styles.featureRow}>
              {meaningfulFeatures.map(({ icon: Icon, label }) => <div key={label} className={styles.feature}><Icon size={23} strokeWidth={1.5} />{label}</div>)}
            </div>
          </div>
          <div className={styles.tiles} aria-hidden="true" data-home-reveal>
            <div className={`${styles.tile} ${styles.tile1}`}>Same Values</div>
            <div className={`${styles.tile} ${styles.tile2}`}>Long-term Goals</div>
            <div className={`${styles.tile} ${styles.tile3}`}>Similar Lifestyle</div>
            <div className={`${styles.tile} ${styles.tile4}`}>Shared Intentions</div>
          </div>
        </section>

        <section id="discover" className={styles.showcase}>
          <div className={styles.showcaseGrid}>
            <div data-home-reveal>
              <p className={styles.eyebrow}>A closer look</p>
              <h2 className={`${styles.serif} ${styles.sectionTitle}`}>Thoughtfully designed<br />for your journey.</h2>
              <p className={styles.body}>Explore, connect and communicate in a clean, modern and distraction-free space built for meaningful relationships.</p>
              <div className={styles.menu}>
                {showcaseMenu.map(({ icon: Icon, label }, index) => (
                  <div key={label} className={`${styles.menuItem} ${index === 0 ? styles.menuItemActive : ""}`}>
                    <Icon size={17} strokeWidth={1.6} /><span>{label}</span>{index === 0 && <span style={{ marginLeft: "auto" }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.deviceStage} data-home-reveal>
              <div className={styles.laptop}>
                <div className={styles.deviceTop}>
                  <Image src="/bandhanaa-logo.png" alt="Bandhanaa" width={180} height={62} className={styles.miniLogo} />
                  <span>Discover　 Matches　 Requests　 Messages</span>
                </div>
                <div className={styles.filters}><span className={`${styles.filter} ${styles.filterActive}`}>All</span><span className={styles.filter}>Near you</span><span className={styles.filter}>New members</span><span className={styles.filter}>Verified</span></div>
                <div className={styles.profileCards}>
                  {showcaseProfiles.map((profile) => (
                    <article key={profile.name} className={styles.profileCard}>
                      <div className={styles.profilePhotoWrap}><Image src={profile.src} alt={profile.name} fill sizes="220px" /></div>
                      <div className={styles.profileCardBody}><h4>{profile.name}</h4><p>{profile.role}<br />{profile.city}</p><p className={styles.match}>{profile.match}</p></div>
                    </article>
                  ))}
                </div>
              </div>

              <div className={styles.phone}>
                <div className={styles.phoneNotch} />
                <div className={styles.phoneImage}><Image src="/profiles/rohan.png" alt="Karthik profile" fill sizes="180px" /></div>
                <div className={styles.phoneBody}>
                  <h4>Karthik, 29 ♡</h4><p>Product Manager<br />Coimbatore, Tamil Nadu</p>
                  <div className={styles.tags}><span className={styles.tag}>Values</span><span className={styles.tag}>Family</span><span className={styles.tag}>Travel</span></div>
                  <p><strong>About</strong><br />Kind, honest, and values family and meaningful conversations…</p>
                  <button type="button" className={styles.send}>Send Request</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.compat}>
          <div className={styles.compatGrid}>
            <div data-home-reveal><p className={styles.eyebrow}>Beyond the basics</p><h2 className={`${styles.serif} ${styles.sectionTitle}`}>Compatibility is more<br />than a photograph.</h2><p className={styles.body}>Find people who align with what truly matters. Set your preferences and discover matches with shared values, background and life goals.</p></div>
            <div className={styles.compatTiles} data-home-reveal>{compatibilityItems.map(({ icon: Icon, label }) => <div key={label} className={styles.compatTile}><Icon size={24} strokeWidth={1.5} />{label}</div>)}</div>
          </div>
        </section>

        <section id="how" className={styles.how}>
          <div className={styles.howInner}>
            <div data-home-reveal><p className={styles.eyebrow}>A simple process</p><h2 className={`${styles.serif} ${styles.sectionTitle}`}>Four steps to a more meaningful connection.</h2></div>
            <div className={styles.steps}>{steps.map(({ number, icon: Icon, title, description }) => <article key={number} className={styles.step} data-home-reveal><div className={styles.stepTop}><span className={styles.stepNumber}>{number}</span><Icon size={25} strokeWidth={1.5} /></div><h3>{title}</h3><p>{description}</p></article>)}</div>
          </div>
        </section>

        <section className={styles.horoscope}>
          <div className={`${styles.decorLeaf} ${styles.leaf1}`} aria-hidden="true" /><div className={`${styles.decorLeaf} ${styles.leaf2}`} aria-hidden="true" /><div className={styles.zodiacDisc} aria-hidden="true" />
          <div className={styles.horoscopeGrid}>
            <div className={styles.tabletStage} data-home-reveal>
              <div className={styles.tablet}>
                <div className={styles.tabs}><span className={styles.tabActive}>Chart</span><span>Details</span><span>Compatibility</span></div>
                <div className={styles.horoscopeContent}>
                  <div className={styles.chart} aria-label="Horoscope chart preview"><span className={styles.chartLabel}>Ra</span><span className={styles.chartLabel}>Sa</span><span className={styles.chartLabel}>Me</span><span className={styles.chartLabel}>Ke</span><span className={styles.chartLabel}>Su</span></div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detail}>Rasi<strong>Mithuna</strong></div><div className={styles.detail}>Nakshatra<strong>Arudra</strong></div><div className={styles.detail}>Lagna<strong>Tula</strong></div><div className={styles.detail}>Navamsa<strong>Kumbha</strong></div>
                    <div className={styles.compatBar}>Compatibility <strong>Good Match</strong><div className={styles.bar}><span /></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div data-home-reveal>
              <p className={styles.eyebrow}>Your choice</p><h2 className={`${styles.serif} ${styles.sectionTitle}`}>Tradition, when<br />it matters to you.</h2><p className={styles.body}>If horoscope is important to you, Bandhanaa makes it easy to include and compare astrological details.</p>
              <ul className={styles.checks}>{["Rasi & Nakshatra", "Lagna & Navamsa", "Compatibility insights", "Optional and always your choice"].map((item) => <li key={item}><span className={styles.check}>✓</span>{item}</li>)}</ul>
            </div>
          </div>
        </section>

        <section id="safety" className={styles.safety}>
          <div className={styles.safetyGrid}>
            <div className={styles.safetyCopy} data-home-reveal>
              <p className={styles.eyebrow}>A safer space</p><h2 className={`${styles.serif} ${styles.safetyTitle}`}>Your profile.<br />Your boundaries.</h2><p className={styles.safetyBody}>We take your privacy seriously. You control what you share and who can see it, with features designed for a safer and more respectful experience.</p>
              <div className={styles.privacyCards}>{privacyItems.map(({ icon: Icon, label }) => <div key={label} className={styles.privacyCard}><Icon size={20} strokeWidth={1.5} />{label}</div>)}</div>
            </div>
            <div className={styles.safetyVisual}><Image src="/bandhanaa-login-hero-desktop.png" alt="Couple in conversation" fill sizes="(max-width: 1023px) 100vw, 44vw" /><div className={styles.safetyNote}>Good{"\n"}People{"\n"}Brighter{"\n"}Tomorrows</div></div>
          </div>
        </section>

        <section className={styles.access}>
          <div className={styles.accessGrid} data-home-reveal>
            <div><p className={styles.eyebrow}>Access for everyone</p><h2 className={`${styles.serif} ${styles.sectionTitle}`}>Start without<br />a subscription.</h2></div>
            <div className={styles.accessRight}><p>Create your profile for free. Discover people, send requests and start meaningful conversations when there’s mutual interest.</p><div className={styles.accessFeatures}>{["Free registration", "Free to connect", "Meaningful conversations", "Privacy controls"].map((item) => <span key={item}><span className={styles.check}>✓</span> {item}</span>)}</div></div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.finalCtaInner} data-home-reveal>
            <p className={styles.eyebrow}>A brighter tomorrow</p><h2 className={`${styles.serif} ${styles.finalTitle}`}>Someone meaningful could start with <em>hello.</em></h2>
            <div className={styles.finalActions}><Link href="/register" className={styles.pill}>Create your Bandhanaa profile <span>→</span></Link><span>Already a member? <Link href="/login" style={{ textDecoration: "underline" }}>Sign in</Link></span></div>
          </div>
          <svg className={styles.wave} viewBox="0 0 1600 120" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 65 C95 0,150 15,215 62 C290 118,370 108,500 90 C700 63,850 90,1000 103 C1185 121,1320 106,1425 58 C1495 27,1545 14,1625 42" fill="none" stroke="#f06b8c" strokeWidth="2.2" /></svg>
          <div className={styles.heartDot}>♥</div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Image src="/bandhanaa-logo.png" alt="Bandhanaa" width={220} height={76} className={styles.footerLogo} />
          <div className={styles.footerLinks}><a href="#about">About</a><a href="#safety">Safety</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/settings/contact">Contact</Link><Link href="/settings/help">Help</Link></div>
          <div className={styles.socials} aria-label="Social channels"><span aria-label="Instagram">◎</span><span aria-label="LinkedIn">in</span><span aria-label="X">𝕏</span><span aria-label="YouTube">▶</span></div>
          <div className={styles.copyright}>© Bandhanaa. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
