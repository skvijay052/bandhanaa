import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DiscoverMatrimonyHeader } from "@/components/public/DiscoverMatrimonyHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import { getCanonicalUrl } from "@/lib/seo";
import styles from "./discover-matrimony.module.css";

const canonicalUrl = getCanonicalUrl("/discover-matrimony");
const homeUrl = getCanonicalUrl("/");
const productImageUrl = getCanonicalUrl("/home/product-devices.png");

export const metadata: Metadata = {
  title: "Discover Matrimony Connections | Bandhanaa",
  description:
    "Discover meaningful matrimony connections on Bandhanaa with compatibility context, partner preferences, serious relationship intent and privacy-conscious introductions.",
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Discover Matrimony Connections | Bandhanaa",
    description:
      "Explore a modern matrimony experience designed around meaningful marriage connections, compatibility, serious intent and respectful introductions.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
    images: [{ url: productImageUrl }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Matrimony Connections | Bandhanaa",
    description:
      "A modern way to discover serious matrimony connections with more context, compatibility and privacy.",
    images: [productImageUrl],
  },
};

const contextItems = [
  {
    label: "Location",
    title: "Life plans begin somewhere",
    text: "Consider where someone lives and whether geography fits your work, family and long-term plans.",
  },
  {
    label: "Education",
    title: "Understand their background",
    text: "Education can be one useful part of a broader compatibility picture, alongside values, lifestyle and goals.",
  },
  {
    label: "Lifestyle",
    title: "Everyday compatibility matters",
    text: "Think about habits, routines and preferences that can shape how two people may build a life together.",
  },
  {
    label: "Family",
    title: "Context when it matters to you",
    text: "Family background and expectations can be important in matrimony, and different people can weigh them differently.",
  },
  {
    label: "Religion",
    title: "Make important values visible",
    text: "Include faith and religious preferences when they are relevant to your marriage decision and future plans.",
  },
  {
    label: "Mother tongue",
    title: "Language can shape connection",
    text: "Shared or compatible language preferences can support communication with each other and with families.",
  },
  {
    label: "Partner preferences",
    title: "Be clearer about what you seek",
    text: "Use your preferences to focus on the qualities and expectations that matter most in a serious relationship.",
  },
  {
    label: "Horoscope",
    title: "Tradition remains your choice",
    text: "Astrological details can be considered when they matter to you, without making them a requirement for everyone.",
  },
] as const;

const flow = [
  {
    label: "01 · Discover",
    title: "Look beyond the photograph",
    text: "Review a profile with the information the person has chosen to share and consider the context that matters to your marriage journey.",
  },
  {
    label: "02 · Consider",
    title: "Decide with more context",
    text: "Compare preferences, background, lifestyle and long-term expectations before deciding whether a connection feels worth exploring.",
  },
  {
    label: "03 · Connect",
    title: "Take the next step intentionally",
    text: "Send a connection request when there is genuine interest, then continue privately when the connection becomes mutual.",
  },
] as const;

const faqs = [
  {
    question: "What does Discover mean on Bandhanaa?",
    answer:
      "Discover is the part of the Bandhanaa matrimony experience where members can explore relevant profiles and review compatibility context before deciding whether to send a connection request.",
  },
  {
    question: "Is Bandhanaa for serious marriage connections?",
    answer:
      "Yes. Bandhanaa is positioned as a modern matrimony platform for people looking for marriage, long-term partnership and meaningful relationships rather than casual dating.",
  },
  {
    question: "What can I consider when looking for a matrimony match?",
    answer:
      "Different people may consider location, education, lifestyle, family context, religion, mother tongue, partner preferences and optional horoscope details. The importance of each factor is personal.",
  },
  {
    question: "Are horoscope details required to discover matches?",
    answer:
      "No. Horoscope information is optional and is intended for people who want astrology to be part of their marriage compatibility process.",
  },
  {
    question: "Can anyone publicly browse Bandhanaa member profiles from this page?",
    answer:
      "No. This is a public information page about the Bandhanaa discovery experience. Individual member profiles and private matrimony information are not intentionally exposed here for public search indexing.",
  },
  {
    question: "How do I start discovering people on Bandhanaa?",
    answer:
      "Create your Bandhanaa profile, complete the information that matters to you, set your partner preferences and then use the member discovery experience to explore potential connections.",
  },
] as const;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Discover Matrimony Connections on Bandhanaa",
    url: canonicalUrl,
    description:
      "A public guide to discovering meaningful matrimony connections on Bandhanaa through compatibility context, partner preferences and serious relationship intent.",
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
        name: "Discover Matrimony",
        item: canonicalUrl,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
] as const;

export default function DiscoverMatrimonyPage() {
  return (
    <div className={styles.page}>
      <StructuredData data={structuredData} id="discover-matrimony-structured-data" />
      <DiscoverMatrimonyHeader />

      <div className={styles.shell}>
        <main>
          <section className={styles.hero} aria-labelledby="discover-matrimony-title">
            <div>
              <p className={styles.eyebrow}>Discover matrimony differently</p>
              <h1 id="discover-matrimony-title">
                Find more than a profile. Find a reason to <em>connect.</em>
              </h1>
              <p className={styles.lead}>
                Bandhanaa is a modern matrimony platform for people seeking serious marriage connections. Discover potential partners with more context around compatibility, expectations, lifestyle and the values that can shape a long-term relationship.
              </p>
              <div className={styles.heroActions}>
                <Link href="/register" className={styles.primary}>
                  Create your profile
                </Link>
                <Link href="/how-it-works" className={styles.secondary}>
                  See how Bandhanaa works
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
                <strong>Context before connection</strong>
                <p>Explore what matters, understand compatibility and connect with intention.</p>
              </div>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="different-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>A more intentional discovery experience</p>
                <h2 id="different-title" className={styles.sectionTitle}>
                  Not endless browsing. <em>Better reasons to connect.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  A marriage decision usually involves more than attraction. People may care about family, lifestyle, location, language, education, beliefs, future plans and many other details that are difficult to understand from a photograph alone.
                </p>
                <p>
                  Bandhanaa is designed to make those details easier to consider while keeping discovery clean, modern and focused on serious relationship intent.
                </p>
              </div>
            </div>

            <div className={styles.contextGrid}>
              {contextItems.map((item) => (
                <article key={item.label} className={styles.contextCard}>
                  <span>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.productBand} aria-labelledby="experience-title">
            <div>
              <p className={styles.eyebrow}>Designed for clarity</p>
              <h2 id="experience-title" className={styles.statement}>
                A modern matrimony experience that keeps the <em>person</em> at the center.
              </h2>
              <p className={styles.statementText}>
                Discovery should help you understand someone, not overwhelm you with options. Bandhanaa brings profiles, preferences and connection actions into a cleaner experience so you can focus on what may actually matter in a marriage decision.
              </p>
            </div>
            <div className={styles.productVisual} aria-hidden="true">
              <Image
                src="/home/product-devices.png"
                alt=""
                fill
                sizes="(max-width: 899px) 92vw, 52vw"
                quality={90}
              />
            </div>
          </section>

          <section className={styles.section} aria-labelledby="journey-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>From discovery to conversation</p>
                <h2 id="journey-title" className={styles.sectionTitle}>
                  See someone relevant. Understand the context. <em>Connect intentionally.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Bandhanaa separates discovery from private conversation so the first step can feel more deliberate. Review what a person has chosen to share, decide whether the connection aligns with what you are seeking and express interest when it makes sense.
                </p>
              </div>
            </div>

            <div className={styles.flow}>
              {flow.map((item) => (
                <article key={item.label} className={styles.flowCard}>
                  <span>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="privacy-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Discovery with privacy in mind</p>
                <h2 id="privacy-title" className={styles.sectionTitle}>
                  Matrimony is personal. Your information should remain <em>intentional.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Bandhanaa's public marketing pages are designed to explain the product without publishing individual member profiles for search engines. Personal matrimony information belongs inside the member experience, where privacy and connection controls can matter.
                </p>
                <p>
                  Learn more about safer interactions on our <Link href="/safety">Safety page</Link> and how information is handled in our <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="faq-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Common questions</p>
                <h2 id="faq-title" className={styles.sectionTitle}>
                  What to know before you start <em>discovering.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  These answers explain how Bandhanaa approaches matrimony discovery for people comparing serious marriage platforms and looking for a more thoughtful way to meet a potential life partner.
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

          <section className={styles.cta} aria-labelledby="discover-cta-title">
            <p className={styles.eyebrow}>Start with a thoughtful profile</p>
            <h2 id="discover-cta-title">
              Someone meaningful may begin with the right <em>introduction.</em>
            </h2>
            <p>
              Create your Bandhanaa profile, share what matters to you and start discovering people who are looking for a serious relationship too.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/register" className={styles.primary}>
                Create your Bandhanaa profile
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
            <nav className={styles.footerLinks} aria-label="Discover matrimony footer navigation">
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
