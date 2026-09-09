import Image from "next/image";
import Link from "next/link";
import {
  BookHeart,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { HomeHeader } from "@/components/home/HomeHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import { getCanonicalUrl } from "@/lib/seo";
import styles from "./LanguageMatrimonyLanding.module.css";

export type LanguageMatrimonyContextIcon =
  | "language"
  | "location"
  | "family"
  | "education"
  | "values"
  | "horoscope"
  | "privacy"
  | "relationship";

export type LanguageMatrimonyPageConfig = {
  slug: string;
  language: string;
  eyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroLead: string;
  heroBadgeTitle: string;
  heroBadgeText: string;
  introEyebrow: string;
  introTitle: string;
  introAccent: string;
  introParagraphs: readonly string[];
  contextItems: readonly {
    icon: LanguageMatrimonyContextIcon;
    title: string;
    text: string;
  }[];
  traditionEyebrow: string;
  traditionTitle: string;
  traditionAccent: string;
  traditionText: string;
  decisionEyebrow: string;
  decisionTitle: string;
  decisionAccent: string;
  decisionParagraphs: readonly string[];
  valueItems: readonly {
    icon: LanguageMatrimonyContextIcon;
    title: string;
    text: string;
  }[];
  locationTitle: string;
  locationText: string;
  journeyEyebrow: string;
  journeyTitle: string;
  journeyAccent: string;
  steps: readonly {
    number: string;
    title: string;
    text: string;
  }[];
  faqIntro: string;
  faqs: readonly {
    question: string;
    answer: string;
  }[];
};

const languagePages = [
  { label: "Tamil Matrimony", href: "/tamil-matrimony" },
  { label: "Telugu Matrimony", href: "/telugu-matrimony" },
  { label: "Kannada Matrimony", href: "/kannada-matrimony" },
  { label: "Malayalam Matrimony", href: "/malayalam-matrimony" },
] as const;

const iconMap = {
  language: Languages,
  location: MapPin,
  family: UsersRound,
  education: GraduationCap,
  values: BookHeart,
  horoscope: Settings,
  privacy: ShieldCheck,
  relationship: Heart,
} as const;

export function LanguageMatrimonyLanding({ config }: { config: LanguageMatrimonyPageConfig }) {
  const canonicalUrl = getCanonicalUrl(config.slug);
  const homeUrl = getCanonicalUrl("/");
  const otherLanguages = languagePages.filter((item) => item.href !== config.slug);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${config.language} Matrimony | Bandhanaa`,
      url: canonicalUrl,
      description: config.heroLead,
      isPartOf: {
        "@type": "WebSite",
        name: "Bandhanaa",
        url: homeUrl,
      },
      about: {
        "@type": "Thing",
        name: `${config.language} matrimony`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `${config.language} Matrimony`,
          item: canonicalUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ] as const;

  return (
    <div className={styles.page}>
      <StructuredData data={structuredData} id={`${config.language.toLowerCase()}-matrimony-structured-data`} />
      <HomeHeader />

      <div className={styles.shell}>
        <main>
          <section className={styles.hero} aria-labelledby={`${config.language.toLowerCase()}-matrimony-title`}>
            <div>
              <p className={styles.eyebrow}>{config.eyebrow}</p>
              <h1 id={`${config.language.toLowerCase()}-matrimony-title`}>
                {config.heroTitle} <em>{config.heroAccent}</em>
              </h1>
              <p className={styles.lead}>{config.heroLead}</p>
              <div className={styles.heroActions}>
                <Link href="/register" className={styles.primary}>Create your profile</Link>
                <Link href="/how-it-works" className={styles.secondary}>See how Bandhanaa works</Link>
              </div>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.heroArt}>
                <Image
                  src="/home/shared-values.png"
                  alt=""
                  fill
                  sizes="(max-width: 899px) 92vw, 46vw"
                  quality={90}
                  priority
                />
              </div>
              <div className={styles.heroBadge}>
                <strong>{config.heroBadgeTitle}</strong>
                <p>{config.heroBadgeText}</p>
              </div>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby={`${config.language.toLowerCase()}-approach-title`}>
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>{config.introEyebrow}</p>
                <h2 id={`${config.language.toLowerCase()}-approach-title`} className={styles.sectionTitle}>
                  {config.introTitle} <em>{config.introAccent}</em>
                </h2>
              </div>
              <div className={styles.copy}>
                {config.introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>

            <div className={styles.contextGrid}>
              {config.contextItems.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <article key={item.title} className={styles.contextCard}>
                    <span className={styles.iconWrap} aria-hidden="true"><Icon /></span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.statementWrap} aria-labelledby={`${config.language.toLowerCase()}-tradition-title`}>
            <div>
              <p className={styles.eyebrow}>{config.traditionEyebrow}</p>
              <h2 id={`${config.language.toLowerCase()}-tradition-title`} className={styles.statement}>
                {config.traditionTitle} <em>{config.traditionAccent}</em>
              </h2>
              <p className={styles.statementText}>{config.traditionText}</p>
            </div>
            <div className={styles.statementVisual} aria-hidden="true">
              <Image
                src="/home/horoscope-tablet.png"
                alt=""
                fill
                sizes="(max-width: 899px) 92vw, 38vw"
                quality={90}
              />
            </div>
          </section>

          <section className={styles.section} aria-labelledby={`${config.language.toLowerCase()}-compatibility-title`}>
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>{config.decisionEyebrow}</p>
                <h2 id={`${config.language.toLowerCase()}-compatibility-title`} className={styles.sectionTitle}>
                  {config.decisionTitle} <em>{config.decisionAccent}</em>
                </h2>
              </div>
              <div className={styles.copy}>
                {config.decisionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>

            <div className={styles.valuesGrid}>
              {config.valueItems.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <article key={item.title} className={styles.valueCard}>
                    <span className={styles.iconWrap} aria-hidden="true"><Icon /></span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.locationBand} aria-label={`${config.language} matrimony location context`}>
            <strong>{config.locationTitle}</strong>
            <p>{config.locationText}</p>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby={`${config.language.toLowerCase()}-journey-title`}>
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>{config.journeyEyebrow}</p>
                <h2 id={`${config.language.toLowerCase()}-journey-title`} className={styles.sectionTitle}>
                  {config.journeyTitle} <em>{config.journeyAccent}</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>Bandhanaa keeps the journey intentional: create a useful profile, describe what matters to you, discover with context and move into a private conversation when a connection feels relevant.</p>
              </div>
            </div>

            <div className={styles.steps}>
              {config.steps.map((step) => (
                <article key={step.number} className={styles.stepCard}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby={`${config.language.toLowerCase()}-faq-title`}>
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Common questions</p>
                <h2 id={`${config.language.toLowerCase()}-faq-title`} className={styles.sectionTitle}>
                  Understanding {config.language.toLowerCase()} matrimony on <em>Bandhanaa.</em>
                </h2>
              </div>
              <div className={styles.copy}><p>{config.faqIntro}</p></div>
            </div>

            <div className={styles.faqList}>
              {config.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>

            <div className={styles.otherLanguages} aria-label="Other language matrimony pages">
              {otherLanguages.map((item) => (
                <Link key={item.href} href={item.href} className={styles.languageLink}>
                  <span>{item.label}</span><span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.cta} aria-labelledby={`${config.language.toLowerCase()}-cta-title`}>
            <p className={styles.eyebrow}>Start with intention</p>
            <h2 id={`${config.language.toLowerCase()}-cta-title`}>
              A meaningful {config.language.toLowerCase()} matrimony connection can begin with one <em>thoughtful profile.</em>
            </h2>
            <p>Create your Bandhanaa profile, share the preferences that matter to you and explore serious marriage connections with more context and privacy.</p>
            <div className={styles.ctaActions}>
              <Link href="/register" className={styles.primary}>Create your profile</Link>
              <Link href="/discover-matrimony" className={styles.secondary}>Discover Bandhanaa</Link>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span>© {new Date().getFullYear()} Bandhanaa. Meaningful connections begin here.</span>
            <nav className={styles.footerLinks} aria-label={`${config.language} matrimony footer navigation`}>
              <Link href="/discover-matrimony">Discover</Link>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/safety">Safety</Link>
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
