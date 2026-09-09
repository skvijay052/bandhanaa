import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader } from "@/components/home/HomeHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import { getCanonicalUrl } from "@/lib/seo";
import styles from "./about.module.css";

const canonicalUrl = getCanonicalUrl("/about");

export const metadata: Metadata = {
  title: "About Bandhanaa | Modern Matrimony for Meaningful Marriage Connections",
  description:
    "Learn about Bandhanaa, a modern matrimony platform designed for serious relationships, meaningful marriage connections, compatibility, privacy and respectful introductions.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "About Bandhanaa | Modern Matrimony for Meaningful Marriage Connections",
    description:
      "Discover why Bandhanaa is building a simpler, privacy-conscious matrimony experience for people seeking serious, meaningful marriage connections.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Bandhanaa | Modern Matrimony for Meaningful Marriage Connections",
    description:
      "A modern matrimony platform focused on serious relationships, compatibility, privacy and meaningful introductions.",
  },
};

const principles = [
  {
    number: "01",
    title: "Meaning before volume",
    text: "Bandhanaa is designed to help people understand why a connection may be relevant, instead of encouraging endless profile browsing.",
  },
  {
    number: "02",
    title: "Privacy by intention",
    text: "Matrimony profiles can contain deeply personal information. We believe people should have clear choices around what they share and how they connect.",
  },
  {
    number: "03",
    title: "Serious relationships first",
    text: "The product is built for people exploring marriage and long-term partnership, with a tone and experience that respects that intent.",
  },
] as const;

const values = [
  {
    title: "Compatibility with context",
    text: "Location, education, lifestyle, family background, religion, mother tongue, partner preferences and optional horoscope details can all matter differently to different people.",
  },
  {
    title: "Respectful communication",
    text: "Connection requests and private conversations are designed to make introductions feel considered rather than casual or intrusive.",
  },
  {
    title: "Tradition without pressure",
    text: "Bandhanaa can support traditional considerations such as horoscope compatibility when they matter to you, while keeping those choices optional.",
  },
  {
    title: "A cleaner matrimony experience",
    text: "We aim to reduce noise, unnecessary friction and outdated portal patterns so people can focus on the person, the context and the next meaningful step.",
  },
] as const;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Bandhanaa",
    url: canonicalUrl,
    description:
      "About Bandhanaa, a modern matrimony platform for serious relationships and meaningful marriage connections.",
    isPartOf: {
      "@type": "WebSite",
      name: "Bandhanaa",
      url: getCanonicalUrl("/"),
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
        item: getCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: canonicalUrl,
      },
    ],
  },
] as const;

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <StructuredData data={structuredData} id="about-page-structured-data" />
      <HomeHeader />

      <div className={styles.shell}>
        <main>
          <section className={styles.hero} aria-labelledby="about-title">
            <div>
              <p className={styles.eyebrow}>About Bandhanaa</p>
              <h1 id="about-title">
                Matrimony should feel more <em>meaningful.</em>
              </h1>
              <p className={styles.lead}>
                Bandhanaa is a modern matrimony platform for people who are serious about marriage and long-term relationships. We are building a simpler, more private way to discover compatible people, understand what matters, and begin a respectful conversation.
              </p>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.heroCard}>
                <Image
                  src="/home/shared-values.png"
                  alt=""
                  fill
                  sizes="(max-width: 899px) 92vw, 44vw"
                  quality={90}
                  priority
                />
              </div>
              <div className={styles.heroNote}>
                <strong>Built around intention</strong>
                <p>Less noise, clearer context and more respectful introductions.</p>
              </div>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="why-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Why Bandhanaa exists</p>
                <h2 id="why-title" className={styles.sectionTitle}>
                  Finding a life partner deserves more than a <em>profile feed.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Traditional matrimony portals can feel crowded, transactional and difficult to navigate. Dating-style experiences can feel too casual for people who are looking specifically for marriage. Bandhanaa is designed to sit in a different place: modern in experience, serious in intent and respectful in how people are introduced.
                </p>
                <p>
                  We focus on the information that can help people make thoughtful decisions: compatibility, expectations, lifestyle, family context, communication preferences and the values that influence a long-term relationship.
                </p>
                <p>
                  The goal is not to show you more people. It is to help you understand which connections may deserve your attention.
                </p>
              </div>
            </div>

            <div className={styles.principles}>
              {principles.map((principle) => (
                <article key={principle.number} className={styles.card}>
                  <span className={styles.cardNumber}>{principle.number}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.statementWrap} aria-labelledby="purpose-title">
            <p className={styles.eyebrow}>Our purpose</p>
            <h2 id="purpose-title" className={styles.statement}>
              Help people move from browsing profiles to understanding <em>real compatibility.</em>
            </h2>
            <p className={styles.statementText}>
              Marriage is personal. Culture, family, lifestyle, beliefs and future plans can all shape what compatibility means. Bandhanaa is built to give those factors space without turning people into a checklist.
            </p>
          </section>

          <section className={styles.section} aria-labelledby="approach-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Our approach</p>
                <h2 id="approach-title" className={styles.sectionTitle}>
                  Modern technology. Human decisions.
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Bandhanaa can help organize information, surface relevant profiles and make communication easier, but the most important decisions remain yours. We believe technology should support better introductions, not pressure people into faster choices.
                </p>
                <p>
                  That means keeping the experience understandable, giving members control over their profile and interactions, and designing around the reality that serious relationships take context, trust and time.
                </p>
              </div>
            </div>

            <div className={styles.valuesGrid}>
              {values.map((value) => (
                <article key={value.title} className={styles.value}>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="privacy-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Privacy and safety</p>
                <h2 id="privacy-title" className={styles.sectionTitle}>
                  Personal information should come with <em>personal control.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Matrimony profiles may contain information people would not normally publish broadly. Bandhanaa is designed with profile visibility, connection controls, reporting and blocking, and privacy settings as important parts of the member experience.
                </p>
                <p>
                  We also believe respectful behavior matters as much as product controls. A serious matrimony community works best when people communicate with clarity, consent and consideration for each other.
                </p>
                <p>
                  You can read more about how Bandhanaa handles information in our <Link href="/privacy">Privacy Policy</Link> and review the rules for using the service in our <Link href="/terms">Terms of Use</Link>.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.cta} aria-labelledby="about-cta-title">
            <p className={styles.eyebrow}>Meaningful connections begin with context</p>
            <h2 id="about-cta-title">Ready to discover someone with the right intentions?</h2>
            <p>
              Create your Bandhanaa profile, share what matters to you, and explore a modern matrimony experience built for serious relationships.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/register" className={styles.primary}>Create your profile</Link>
              <Link href="/#discover" className={styles.secondary}>Explore Bandhanaa</Link>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span>© {new Date().getFullYear()} Bandhanaa. Meaningful connections begin here.</span>
            <nav className={styles.footerLinks} aria-label="About page footer navigation">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/settings/contact">Contact</Link>
              <Link href="/settings/help">Help</Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
