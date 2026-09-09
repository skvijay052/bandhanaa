import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HowItWorksHeader } from "@/components/public/HowItWorksHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import { getCanonicalUrl } from "@/lib/seo";
import styles from "./how-it-works.module.css";

const canonicalUrl = getCanonicalUrl("/how-it-works");
const homeUrl = getCanonicalUrl("/");
const productImageUrl = getCanonicalUrl("/home/product-devices.png");

export const metadata: Metadata = {
  title: "How Bandhanaa Works | Modern Matrimony for Meaningful Connections",
  description:
    "Learn how Bandhanaa helps people create a thoughtful matrimony profile, discover compatible marriage connections, send requests and continue conversations privately when interest is mutual.",
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "How Bandhanaa Works | Modern Matrimony for Meaningful Connections",
    description:
      "See how Bandhanaa supports serious marriage introductions through thoughtful profiles, compatibility context, connection requests and private conversations.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
    images: [{ url: productImageUrl }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Bandhanaa Works | Modern Matrimony for Meaningful Connections",
    description:
      "A simple, privacy-conscious matrimony journey from creating your profile to discovering compatible people and connecting privately.",
    images: [productImageUrl],
  },
};

const steps = [
  {
    number: "01",
    title: "Create a thoughtful profile",
    text: "Start with the information that helps another person understand you beyond a photograph: your background, lifestyle, education, location, expectations and the details you choose to share.",
  },
  {
    number: "02",
    title: "Set what matters to you",
    text: "Define your partner preferences and the factors that matter in a serious relationship. Compatibility can include lifestyle, family context, language, religion and optional horoscope considerations.",
  },
  {
    number: "03",
    title: "Discover with context",
    text: "Explore profiles with enough context to make a considered decision. Bandhanaa is designed to help you focus on relevant marriage connections instead of endless, casual browsing.",
  },
  {
    number: "04",
    title: "Connect when it feels right",
    text: "Send a connection request when a profile feels relevant. When interest is mutual, continue the conversation privately and decide together what the next step should be.",
  },
] as const;

const compatibility = [
  {
    title: "Location",
    text: "Understand where someone lives and whether geography fits your plans.",
  },
  {
    title: "Education",
    text: "See educational background as one part of the wider compatibility picture.",
  },
  {
    title: "Lifestyle",
    text: "Compare everyday preferences, habits and the way you want to live.",
  },
  {
    title: "Family",
    text: "Consider family context when it is important to your marriage decision.",
  },
  {
    title: "Religion",
    text: "Include faith and religious preferences where they matter to you.",
  },
  {
    title: "Mother tongue",
    text: "Find people who share, understand or are comfortable with your language preferences.",
  },
  {
    title: "Partner preferences",
    text: "Make your long-term expectations clearer before starting a conversation.",
  },
  {
    title: "Horoscope",
    text: "Use astrological information as an optional compatibility input when tradition matters to you.",
  },
] as const;

const connectionFlow = [
  {
    label: "Discover",
    title: "See someone relevant",
    text: "Review the profile, compatibility context and the information they have chosen to share.",
  },
  {
    label: "Request",
    title: "Express your interest",
    text: "Send a connection request instead of beginning with an unsolicited private conversation.",
  },
  {
    label: "Connect",
    title: "Continue privately",
    text: "When interest is mutual, move into a private conversation and take the relationship forward at your own pace.",
  },
] as const;

const faqs = [
  {
    question: "What is Bandhanaa?",
    answer:
      "Bandhanaa is a modern matrimony platform for people looking for serious relationships and meaningful marriage connections. It is designed around compatibility, privacy and respectful introductions.",
  },
  {
    question: "Is Bandhanaa a dating app?",
    answer:
      "No. Bandhanaa is designed for people exploring marriage and long-term partnership. The product experience is built around serious intent rather than casual dating or swipe-style discovery.",
  },
  {
    question: "What information can help with compatibility?",
    answer:
      "Compatibility can include location, education, lifestyle, family context, religion, mother tongue, partner preferences and optional horoscope details. Different people can give different weight to each factor.",
  },
  {
    question: "Is horoscope information required?",
    answer:
      "No. Horoscope information is optional. It is available for people who consider astrology important in a marriage decision, but it does not need to be part of every person's journey.",
  },
  {
    question: "How do connection requests and messages work?",
    answer:
      "You can send a connection request when you are interested in someone. When interest is mutual, you can continue the conversation privately instead of receiving unsolicited messages from every profile viewer.",
  },
  {
    question: "Can I start using Bandhanaa without a subscription?",
    answer:
      "Bandhanaa is designed so you can create your profile, discover people and begin making meaningful connections without first paying to unlock a conversation.",
  },
] as const;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "How Bandhanaa Works",
    url: canonicalUrl,
    description:
      "How Bandhanaa helps people create a matrimony profile, discover compatible marriage connections, send requests and connect privately.",
    isPartOf: {
      "@type": "WebSite",
      name: "Bandhanaa",
      url: homeUrl,
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
        name: "How it works",
        item: canonicalUrl,
      },
    ],
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className={styles.page}>
      <StructuredData data={structuredData} id="how-it-works-structured-data" />
      <HowItWorksHeader />

      <div className={styles.shell}>
        <main>
          <section className={styles.hero} aria-labelledby="how-it-works-title">
            <div>
              <p className={styles.eyebrow}>How Bandhanaa works</p>
              <h1 id="how-it-works-title">
                From profile to a more <em>meaningful connection.</em>
              </h1>
              <p className={styles.lead}>
                Bandhanaa keeps the matrimony journey simple: create a thoughtful profile, define what matters to you, discover compatible people and connect privately when the interest is mutual.
              </p>
              <div className={styles.heroActions}>
                <Link href="/register" className={styles.primary}>
                  Create your profile
                </Link>
                <Link href="/about" className={styles.secondary}>
                  Why Bandhanaa
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.heroArt}>
                <Image
                  src="/home/product-devices.png"
                  alt=""
                  fill
                  sizes="(max-width: 899px) 92vw, 52vw"
                  quality={90}
                  priority
                />
              </div>
              <div className={styles.heroBadge}>
                <strong>Simple by design</strong>
                <p>Clear profiles, relevant discovery, intentional requests and private conversations.</p>
              </div>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="journey-title">
            <div className={styles.introGrid}>
              <div>
                <p className={styles.eyebrow}>The Bandhanaa journey</p>
                <h2 id="journey-title" className={styles.sectionTitle}>
                  Four steps. Less noise. <em>More intention.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Marriage decisions are personal and usually involve more context than a typical social or dating profile can provide. Bandhanaa is designed to make that context easier to understand without turning the experience into a long, complicated process.
                </p>
                <p>
                  You remain in control of what you share, who you choose to contact and how quickly you want to take a connection forward.
                </p>
              </div>
            </div>

            <div className={styles.steps}>
              {steps.map((step, index) => (
                <article key={step.number} className={styles.step}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  {index < steps.length - 1 ? <span className={styles.stepArrow}>→</span> : null}
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="compatibility-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Compatibility with context</p>
                <h2 id="compatibility-title" className={styles.sectionTitle}>
                  A photograph can start interest. Context helps you decide <em>what comes next.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  There is no single formula for compatibility. Some people care most about lifestyle and long-term goals. Others may consider family background, language, religion or horoscope compatibility important.
                </p>
                <p>
                  Bandhanaa brings these details into one clearer experience so you can make a more informed decision before sending a request.
                </p>
              </div>
            </div>

            <div className={styles.compatGrid}>
              {compatibility.map((item) => (
                <article key={item.title} className={styles.compatItem}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.statementWrap} aria-labelledby="privacy-title">
            <div>
              <p className={styles.eyebrow}>Privacy and control</p>
              <h2 id="privacy-title" className={styles.statement}>
                Serious introductions should still respect your <em>boundaries.</em>
              </h2>
              <p className={styles.statementText}>
                Matrimony profiles can include personal information. Bandhanaa is designed around profile visibility choices, connection controls, reporting and blocking, and a more intentional path to private conversation.
              </p>
            </div>
            <div className={styles.statementVisual} aria-hidden="true">
              <Image
                src="/home/safety-couple.png"
                alt=""
                fill
                sizes="(max-width: 899px) 92vw, 40vw"
                quality={90}
              />
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="connection-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>From interest to conversation</p>
                <h2 id="connection-title" className={styles.sectionTitle}>
                  A clearer way to move from discovery to <em>hello.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Bandhanaa uses connection requests to make the first step more intentional. Instead of treating every profile view as permission to message, you can express interest and continue privately when the connection is mutual.
                </p>
              </div>
            </div>

            <div className={styles.flow}>
              {connectionFlow.map((item) => (
                <article key={item.label} className={styles.flowCard}>
                  <span>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="faq-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Common questions</p>
                <h2 id="faq-title" className={styles.sectionTitle}>
                  Understand Bandhanaa before you <em>begin.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  These answers explain the core Bandhanaa experience for people comparing modern matrimony platforms and looking for a serious, privacy-conscious way to meet a potential life partner.
                </p>
              </div>
            </div>

            <div className={styles.faqList}>
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.cta} aria-labelledby="how-cta-title">
            <p className={styles.eyebrow}>Start your journey</p>
            <h2 id="how-cta-title">
              A meaningful marriage connection can begin with one thoughtful <em>profile.</em>
            </h2>
            <p>
              Create your Bandhanaa profile, share what matters to you and start discovering people who are looking for something serious too.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/register" className={styles.primary}>
                Create your profile
              </Link>
              <Link href="/about" className={styles.secondary}>
                Learn about Bandhanaa
              </Link>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span>© {new Date().getFullYear()} Bandhanaa. Meaningful connections begin here.</span>
            <nav className={styles.footerLinks} aria-label="How it works footer navigation">
              <Link href="/about">About</Link>
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
