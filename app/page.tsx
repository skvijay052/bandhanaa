import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  BookHeart,
  Check,
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
import styles from "./homepage.module.css";

export const metadata: Metadata = {
  title: "Bandhanaa | Meaningful Matrimony Connections",
  description:
    "Discover meaningful matrimony connections based on values, compatibility and long-term intentions.",
};

const meaningfulFeatures = [
  { icon: ShieldCheck, label: "Verified Profiles" },
  { icon: UsersRound, label: "Intentional Matches" },
  { icon: Heart, label: "Privacy Focused" },
  { icon: Heart, label: "A Safer Community" },
];
const compatibilityItems = [
  { icon: MapPin, label: "Location" },
  { icon: GraduationCap, label: "Education" },
  { icon: Leaf, label: "Lifestyle" },
  { icon: UsersRound, label: "Family" },
  { icon: BookHeart, label: "Religion" },
  { icon: Languages, label: "Mother Tongue" },
  { icon: Heart, label: "Partner Preferences" },
  { icon: Settings, label: "Horoscope" },
];
const steps = [
  {
    number: "01",
    icon: UsersRound,
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
    description: "Send a request. Chat when there’s mutual interest.",
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
  { icon: Eye, label: "Profile visibility" },
  { icon: BadgeCheck, label: "Verification" },
  { icon: UsersRound, label: "Connection controls" },
  { icon: Ban, label: "Report & Block" },
  { icon: LockKeyhole, label: "Privacy settings" },
];
const showcaseMenu = [
  { icon: BookHeart, label: "Discover", href: "/discover" },
  { icon: UsersRound, label: "Matches", href: "/matches" },
  { icon: UserRound, label: "Profile", href: "/my-profile" },
  { icon: MessageSquare, label: "Requests", href: "/requests" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
];

// Each scene has its own high-resolution PNG with a genuine alpha channel.
// Use responsive image delivery without flattening transparency onto a background.
const homeArtwork = {
  hero: {
    src: "/home/hero-woman.png",
    sizes: "(max-width: 899px) 100vw, 53vw",
  },
  values: {
    src: "/home/shared-values.png",
    sizes: "(max-width: 899px) 100vw, 45vw",
  },
  product: {
    src: "/home/product-devices.png",
    sizes: "(max-width: 899px) 100vw, 65vw",
  },
  horoscope: {
    src: "/home/horoscope-tablet.png",
    sizes: "(max-width: 899px) 100vw, 54vw",
  },
  zodiac: { src: "/home/zodiac-disc.png", sizes: "12vw" },
  safety: {
    src: "/home/safety-couple.png",
    sizes: "(max-width: 899px) 100vw, 50vw",
  },
  plant: {
    src: "/home/olive-branch.png",
    sizes: "(max-width: 899px) 120px, 15vw",
  },
} as const;

function HomeArtwork({
  asset,
  alt,
  className = "",
  priority = false,
}: {
  asset: keyof typeof homeArtwork;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const { src, sizes } = homeArtwork[asset];
  return (
    <div className={`${styles.artwork} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={90}
        className={styles.artworkImage}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="Bandhanaa home" className={styles.brand}>
            <Image
              src="/bandhanaa-logo.png"
              alt="Bandhanaa"
              width={240}
              height={80}
              className={styles.logo}
              priority
            />
          </Link>
          <nav className={styles.nav} aria-label="Homepage navigation">
            <a href="#discover">Discover</a>
            <a href="#how">How it works</a>
            <a href="#safety">Safety</a>
            <a href="#about">About</a>
          </nav>
          <div className={styles.headerActions}>
            <Link href="/login">Sign in</Link>
            <Link href="/register" className={styles.pill}>
              Create profile <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content">
        <section
          id="about"
          className={styles.hero}
          aria-labelledby="hero-title"
        >
          <HomeArtwork
            asset="hero"
            priority
            className={styles.heroArtwork}
            alt="A woman in an ivory embroidered outfit, smiling thoughtfully and looking ahead."
          />
          <div className={styles.heroDetails}>
            <p className={styles.handNote}>
              Real people.
              <br />
              Meaningful
              <br />
              connections.
            </p>
            <div
              className={styles.profileFloat}
              aria-label="Illustrative member profile"
            >
              <div className={styles.profileTop}>
                <Image
                  src="/home/hero-woman.png"
                  alt=""
                  width={64}
                  height={72}
                  sizes="64px"
                  quality={90}
                  className={styles.profileThumb}
                />
                <div>
                  <strong>
                    Ananya, 26 <BadgeCheck aria-hidden="true" />
                  </strong>
                  <p>
                    Product Manager
                    <br />
                    Chennai, Tamil Nadu
                  </p>
                </div>
              </div>
              <div className={styles.profileTags}>
                <span>Values</span>
                <span>Family</span>
                <span>Lifestyle</span>
              </div>
            </div>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Meaningful connections</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Marriage begins
              <br />
              with the right
              <br />
              <em>connection.</em>
            </h1>
            <p className={styles.body}>
              Meet people with compatible values, intentions and life goals.
              Bandhanaa gives you a simpler, more private way to find someone
              meaningful.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/register" className={styles.pill}>
                Create your profile <ArrowRight aria-hidden="true" />
              </Link>
              <a href="#discover" className={styles.pillLight}>
                Explore Bandhanaa
              </a>
            </div>
            <ul className={styles.benefits}>
              <li>
                <UserRound aria-hidden="true" />
                Free to register
              </li>
              <li>
                <Heart aria-hidden="true" />
                Free to connect
              </li>
              <li>
                <ShieldCheck aria-hidden="true" />
                Privacy controls built in
              </li>
            </ul>
          </div>
        </section>

        <section
          className={styles.meaningful}
          aria-labelledby="meaningful-title"
        >
          <HomeArtwork
            asset="values"
            className={styles.valuesArtwork}
            alt="Three sculpted tiles: Same Values, Similar Lifestyle and Long-term Goals, with a pink heart."
          />
          <div className={styles.meaningfulCopy}>
            <p className={styles.eyebrow}>A more meaningful approach</p>
            <h2 id="meaningful-title" className={styles.sectionTitle}>
              Not more profiles.
              <br />
              <em>Better reasons to connect.</em>
            </h2>
            <p className={styles.body}>
              Bandhanaa helps you discover people based on what truly matters —
              your values, lifestyle, expectations and long-term goals. Less
              noise. More relevant connections.
            </p>
            <ul className={styles.featureRow}>
              {meaningfulFeatures.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Icon aria-hidden="true" strokeWidth={1.4} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="discover"
          className={styles.showcase}
          aria-labelledby="showcase-title"
        >
          <div className={styles.showcaseCopy}>
            <p className={styles.eyebrow}>A closer look</p>
            <h2 id="showcase-title" className={styles.sectionTitle}>
              Thoughtfully designed
              <br />
              for your journey.
            </h2>
            <p className={styles.body}>
              Explore, connect and communicate in a clean, modern and
              distraction-free space built for meaningful relationships.
            </p>
            <nav
              className={styles.menu}
              aria-label="Explore Bandhanaa features"
            >
              {showcaseMenu.map(({ icon: Icon, label, href }, index) => (
                <Link
                  key={label}
                  href={href}
                  className={`${styles.menuItem} ${index === 0 ? styles.menuItemActive : ""}`}
                >
                  <Icon aria-hidden="true" strokeWidth={1.5} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <HomeArtwork
            asset="product"
            className={styles.productArtwork}
            alt="Illustrative desktop Discover screen and mobile profile, showing three member cards and a profile preview."
          />
        </section>

        <section className={styles.compat} aria-labelledby="compat-title">
          <div className={styles.compatCopy}>
            <p className={styles.eyebrow}>Beyond the basics</p>
            <h2 id="compat-title" className={styles.sectionTitle}>
              Compatibility is more
              <br />
              than a photograph.
            </h2>
            <p className={styles.body}>
              Find people who align with what truly matters. Set your
              preferences and discover matches with shared values, background
              and life goals.
            </p>
          </div>
          <ul className={styles.compatTiles}>
            {compatibilityItems.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className={styles.iconTile}>
                  <Icon aria-hidden="true" strokeWidth={1.4} />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="how" className={styles.how} aria-labelledby="how-title">
          <p className={styles.eyebrow}>A simple process</p>
          <h2 id="how-title" className={styles.sectionTitle}>
            Four steps to a more meaningful connection.
          </h2>
          <ol className={styles.steps}>
            {steps.map(({ number, icon: Icon, title, description }) => (
              <li key={number} className={styles.step}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>{number}</span>
                  <Icon aria-hidden="true" strokeWidth={1.4} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                {number !== "04" && (
                  <ArrowRight className={styles.stepArrow} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.horoscope} aria-labelledby="horoscope-title">
          <HomeArtwork asset="zodiac" className={styles.zodiacArtwork} alt="" />
          <HomeArtwork
            asset="horoscope"
            className={styles.horoscopeArtwork}
            alt="An illustrative horoscope tablet with Rasi, Nakshatra, Lagna and Navamsa panels, beside a green plant."
          />
          <div className={styles.horoscopeCopy}>
            <p className={styles.eyebrow}>Your choice</p>
            <h2 id="horoscope-title" className={styles.sectionTitle}>
              Tradition, when
              <br />
              it matters to you.
            </h2>
            <p className={styles.body}>
              If horoscope is important to you, Bandhanaa makes it easy to
              include and compare astrological details.
            </p>
            <ul className={styles.checks}>
              {[
                "Rasi & Nakshatra",
                "Lagna & Navamsa",
                "Compatibility insights",
                "Optional and always your choice",
              ].map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="safety"
          className={styles.safety}
          aria-labelledby="safety-title"
        >
          <HomeArtwork
            asset="safety"
            className={styles.safetyArtwork}
            alt="A couple smiling at one another in a black and white portrait."
          />
          <div className={styles.safetyCopy}>
            <p className={styles.eyebrow}>A safer space</p>
            <h2 id="safety-title" className={styles.sectionTitle}>
              Your profile.
              <br />
              Your boundaries.
            </h2>
            <p className={styles.body}>
              We take your privacy seriously. You control what you share and who
              can see it, with features designed for a safer and more respectful
              experience.
            </p>
            <ul className={styles.privacyCards}>
              {privacyItems.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Icon aria-hidden="true" strokeWidth={1.4} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.access} aria-labelledby="access-title">
          <HomeArtwork asset="plant" className={styles.accessArtwork} alt="" />
          <div>
            <p className={styles.eyebrow}>Access for everyone</p>
            <h2 id="access-title" className={styles.sectionTitle}>
              Start without
              <br />a subscription.
            </h2>
          </div>
          <div className={styles.accessRight}>
            <p className={styles.body}>
              Create your profile for free. Discover people. Send requests.
              <br />
              Chat without paying to unlock a conversation.
            </p>
            <ul className={styles.accessFeatures}>
              {[
                "Free registration",
                "Free to connect",
                "Meaningful conversations",
                "Privacy controls",
              ].map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-title">
          <div className={styles.finalCtaInner}>
            <p className={styles.eyebrow}>A brighter tomorrow</p>
            <h2 id="final-title" className={styles.sectionTitle}>
              Someone meaningful could start with <em>hello.</em>
            </h2>
            <div className={styles.finalActions}>
              <Link href="/register" className={styles.pill}>
                Create your Bandhanaa profile <ArrowRight aria-hidden="true" />
              </Link>
              <span>
                Already a member? <Link href="/login">Sign in</Link>
              </span>
            </div>
          </div>
          <svg
            className={styles.wave}
            viewBox="0 0 1600 180"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M-20 55 C90 -10 140 30 215 86 C290 141 370 144 500 128 C700 104 850 156 1000 163 C1185 181 1320 165 1425 108 C1495 72 1545 61 1625 62"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <Heart className={styles.heartAccent} aria-hidden="true" />
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" aria-label="Bandhanaa home">
            <Image
              src="/bandhanaa-logo.png"
              alt="Bandhanaa"
              width={240}
              height={80}
              className={styles.logo}
            />
          </Link>
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            <a href="#about">About</a>
            <a href="#safety">Safety</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/settings/contact">Contact</Link>
            <Link href="/settings/help">Help</Link>
          </nav>
          <div className={styles.socials} aria-label="Social channels">
            <span aria-label="Instagram">◎</span>
            <span aria-label="LinkedIn">in</span>
            <span aria-label="X">𝕏</span>
            <span aria-label="YouTube">▶</span>
          </div>
          <p className={styles.copyright}>© Bandhanaa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
