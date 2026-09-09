import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Ban,
  BadgeCheck,
  Eye,
  Flag,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { SafetyHeader } from "@/components/public/SafetyHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import { getCanonicalUrl } from "@/lib/seo";
import styles from "./safety.module.css";

const canonicalUrl = getCanonicalUrl("/safety");
const homeUrl = getCanonicalUrl("/");
const safetyImageUrl = getCanonicalUrl("/home/safety-couple.png");

export const metadata: Metadata = {
  title: "Matrimony Safety & Privacy | Bandhanaa",
  description:
    "Learn how Bandhanaa approaches matrimony safety, privacy, respectful communication, profile controls, reporting and safer online-to-offline marriage introductions.",
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Matrimony Safety & Privacy | Bandhanaa",
    description:
      "Practical safety guidance and privacy principles for people using Bandhanaa to explore serious marriage connections and meaningful introductions.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
    images: [{ url: safetyImageUrl }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matrimony Safety & Privacy | Bandhanaa",
    description:
      "Safety, privacy and respectful communication guidance for serious matrimony connections on Bandhanaa.",
    images: [safetyImageUrl],
  },
};

const safetyFeatures = [
  {
    icon: Eye,
    title: "Profile visibility",
    text: "Use visibility choices to decide how much of your profile you want to share and keep personal details intentional.",
  },
  {
    icon: BadgeCheck,
    title: "Verification",
    text: "Verification is part of Bandhanaa's safety approach and can provide an additional signal when you are evaluating a profile.",
  },
  {
    icon: UserRoundCheck,
    title: "Connection controls",
    text: "Choose who you want to connect with instead of treating every profile view as permission for direct contact.",
  },
  {
    icon: Ban,
    title: "Report & block",
    text: "Use reporting and blocking tools when a person behaves inappropriately, pressures you or makes you feel uncomfortable.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy settings",
    text: "Review privacy settings regularly and share sensitive information only when you are comfortable doing so.",
  },
] as const;

const safetyTips = [
  {
    number: "01",
    title: "Keep sensitive details private at first",
    text: "Avoid sharing passwords, one-time codes, financial information, identity-document numbers or other sensitive personal details with someone you have just met online.",
  },
  {
    number: "02",
    title: "Take time to verify who you are speaking with",
    text: "Ask sensible questions, look for consistency in what a person shares and do not let anyone rush you into trust, commitment or moving the conversation elsewhere.",
  },
  {
    number: "03",
    title: "Never send money because of a new online connection",
    text: "Be cautious of urgent financial requests, investment opportunities, medical emergencies, travel stories or any situation that asks you to transfer money or reveal banking information.",
  },
  {
    number: "04",
    title: "Meet in a public place when you are ready",
    text: "For a first in-person meeting, choose a public location, arrange your own transport and tell a trusted friend or family member where you are going.",
  },
  {
    number: "05",
    title: "Respect boundaries — including your own",
    text: "You can slow down, stop responding or end a connection at any time. Pressure, intimidation, repeated unwanted contact or disrespectful behavior are reasons to disengage.",
  },
  {
    number: "06",
    title: "Report concerning behavior early",
    text: "If something feels unsafe, deceptive, threatening or inappropriate, use the available report and block controls rather than continuing the interaction to gather more proof yourself.",
  },
] as const;

const connectionPrinciples = [
  {
    label: "Before you connect",
    title: "Review the profile with context",
    text: "Look beyond the photograph. Consider whether the person's information, intentions and communication style feel consistent with what you are seeking.",
  },
  {
    label: "While you communicate",
    title: "Keep the pace comfortable",
    text: "Serious relationships do not require instant trust. Ask questions, protect sensitive information and give yourself time to evaluate the connection.",
  },
  {
    label: "When you meet",
    title: "Move offline carefully",
    text: "Choose a public place, keep someone you trust informed and leave if the situation feels uncomfortable or different from what you expected.",
  },
] as const;

const faqs = [
  {
    question: "How does Bandhanaa support safer matrimony connections?",
    answer:
      "Bandhanaa's public product experience includes profile visibility, verification, connection controls, reporting and blocking, and privacy settings. These tools are designed to support more intentional and respectful interactions, but no online platform can remove every risk.",
  },
  {
    question: "Should I share my phone number immediately?",
    answer:
      "There is no need to share personal contact information before you feel comfortable. Take time to understand the person, use the platform's connection flow and avoid sharing information that could expose your privacy too early.",
  },
  {
    question: "What should I do if someone asks me for money?",
    answer:
      "Do not send money, banking details, gift cards, cryptocurrency or other financial value to a new online connection. Financial pressure or an urgent money request is a strong reason to stop the interaction and consider reporting the account.",
  },
  {
    question: "What is a safer way to meet someone in person for the first time?",
    answer:
      "Meet in a public place, use your own transportation, tell a trusted person where you will be, keep your phone available and leave if anything makes you uncomfortable.",
  },
  {
    question: "Can verification guarantee that a person is trustworthy?",
    answer:
      "No. Verification can be one useful signal, but it should not replace your own judgment. Take time to evaluate consistency, behavior and whether a person's actions match what they tell you.",
  },
  {
    question: "What should I do if a member makes me uncomfortable?",
    answer:
      "You can stop the conversation, use available block controls and report concerning behavior. You do not need to continue a conversation simply because a connection was started earlier.",
  },
] as const;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Bandhanaa Matrimony Safety and Privacy",
    url: canonicalUrl,
    description:
      "Safety and privacy guidance for people using Bandhanaa to explore serious matrimony and marriage connections.",
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
        name: "Safety",
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

export default function SafetyPage() {
  return (
    <div className={styles.page}>
      <StructuredData data={structuredData} id="safety-page-structured-data" />
      <SafetyHeader />

      <div className={styles.shell}>
        <main>
          <section className={styles.hero} aria-labelledby="safety-title">
            <div>
              <p className={styles.eyebrow}>Safety at Bandhanaa</p>
              <h1 id="safety-title">
                Meaningful connections should also feel <em>safe and respectful.</em>
              </h1>
              <p className={styles.lead}>
                Matrimony can involve deeply personal information, family conversations and important life decisions. Bandhanaa is designed to give you more control over what you share, who you connect with and how you respond when something does not feel right.
              </p>
              <div className={styles.heroActions}>
                <Link href="/register" className={styles.primary}>
                  Create your profile
                </Link>
                <Link href="/privacy" className={styles.secondary}>
                  Read our Privacy Policy
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroArt}>
                <Image
                  src="/home/safety-couple.png"
                  alt="A couple smiling at one another in a black and white portrait."
                  fill
                  sizes="(max-width: 899px) 92vw, 44vw"
                  quality={90}
                  priority
                />
              </div>
              <div className={styles.heroBadge}>
                <strong>Control matters</strong>
                <p>Share intentionally, connect thoughtfully and use safety controls whenever you need them.</p>
              </div>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="tools-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Built-in safety choices</p>
                <h2 id="tools-title" className={styles.sectionTitle}>
                  Your profile. Your boundaries. <em>Your decision.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  A serious matrimony platform should make it easier to control your interactions, not harder. Bandhanaa's safety approach includes profile visibility, verification, connection controls, reporting and blocking, and privacy settings.
                </p>
                <p>
                  These controls can help reduce unwanted interactions and give you clearer options when deciding who you want to know better. They are tools to support your judgment — not a substitute for taking reasonable care online and offline.
                </p>
              </div>
            </div>

            <div className={styles.safetyGrid}>
              {safetyFeatures.map(({ icon: Icon, title, text }) => (
                <article key={title} className={styles.safetyCard}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.statementWrap} aria-labelledby="trust-title">
            <div>
              <p className={styles.eyebrow}>Trust develops over time</p>
              <h2 id="trust-title" className={styles.statement}>
                Verification can help. Your <em>judgment still matters.</em>
              </h2>
              <p className={styles.statementText}>
                A verified profile can provide an additional signal, but no badge, profile field or online conversation can guarantee a person's intentions. Look for consistency, respect and behavior that matches what someone tells you.
              </p>
            </div>
            <ul className={styles.statementList}>
              <li>Do not let anyone pressure you into sharing sensitive information.</li>
              <li>Be cautious when stories change or important details do not add up.</li>
              <li>Take more time when someone asks for secrecy, urgency or money.</li>
              <li>Trust discomfort as a reason to slow down or end the interaction.</li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="tips-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Safer matrimony habits</p>
                <h2 id="tips-title" className={styles.sectionTitle}>
                  Simple precautions can protect your <em>privacy and peace of mind.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Online matrimony can be a meaningful way to meet a potential life partner, but serious intent does not remove the need for sensible safety habits. Use these steps whether you are at the first-message stage or preparing to meet someone in person.
                </p>
              </div>
            </div>

            <div className={styles.tips}>
              {safetyTips.map((tip) => (
                <article key={tip.number} className={styles.tip}>
                  <span className={styles.tipNumber}>{tip.number}</span>
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="communication-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>From online to offline</p>
                <h2 id="communication-title" className={styles.sectionTitle}>
                  Let every next step happen at a pace that feels <em>comfortable.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Moving from a profile to a conversation — and eventually to an in-person meeting — should be gradual. You do not owe someone access to your phone number, home address, workplace, family details or private photos simply because you have matched or exchanged messages.
                </p>
              </div>
            </div>

            <div className={styles.flow}>
              {connectionPrinciples.map((item) => (
                <article key={item.label} className={styles.flowCard}>
                  <span className={styles.flowLabel}>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.warning}>
              <strong>Money requests are a major warning sign.</strong>
              <p>
                Never send money, gift cards, banking credentials, cryptocurrency, one-time passwords or financial documents because of a new matrimony connection. Urgent emergencies, investment opportunities and requests to keep a transfer secret should be treated with particular caution.
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="report-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>When something feels wrong</p>
                <h2 id="report-title" className={styles.sectionTitle}>
                  You can stop the interaction. <em>No explanation required.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  Repeated unwanted contact, harassment, threats, impersonation, requests for money, pressure for intimate material or deliberately misleading information are reasons to disengage. Use Bandhanaa's report and block controls when appropriate.
                </p>
                <p>
                  If you believe you are in immediate danger or a crime may have occurred, contact the relevant local authorities or emergency services in your area. Platform reporting is not a replacement for emergency assistance.
                </p>
              </div>
            </div>

            <div className={styles.safetyGrid}>
              <article className={styles.safetyCard}>
                <span className={styles.iconWrap} aria-hidden="true"><Ban /></span>
                <h3>Block unwanted contact</h3>
                <p>End access when you no longer want to continue an interaction.</p>
              </article>
              <article className={styles.safetyCard}>
                <span className={styles.iconWrap} aria-hidden="true"><Flag /></span>
                <h3>Report concerning behavior</h3>
                <p>Use reporting controls for behavior that appears abusive, deceptive, unsafe or inappropriate.</p>
              </article>
              <article className={styles.safetyCard}>
                <span className={styles.iconWrap} aria-hidden="true"><MessageCircle /></span>
                <h3>Keep conversations respectful</h3>
                <p>Clear consent and respectful communication should remain part of every stage of a serious introduction.</p>
              </article>
              <article className={styles.safetyCard}>
                <span className={styles.iconWrap} aria-hidden="true"><ShieldCheck /></span>
                <h3>Use your own judgment</h3>
                <p>Safety features can support good decisions, but you should still evaluate every connection for yourself.</p>
              </article>
            </div>
          </section>

          <section className={`${styles.section} ${styles.sectionSoft}`} aria-labelledby="faq-title">
            <div className={styles.twoCol}>
              <div>
                <p className={styles.eyebrow}>Safety questions</p>
                <h2 id="faq-title" className={styles.sectionTitle}>
                  Practical answers for safer <em>matrimony connections.</em>
                </h2>
              </div>
              <div className={styles.copy}>
                <p>
                  These answers cover common safety and privacy questions for people using a modern matrimony platform to meet someone for marriage or a long-term relationship.
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

          <section className={styles.cta} aria-labelledby="safety-cta-title">
            <p className={styles.eyebrow}>Connect with intention</p>
            <h2 id="safety-cta-title">
              Serious relationships deserve both <em>meaning and boundaries.</em>
            </h2>
            <p>
              Create your Bandhanaa profile, share what matters to you and keep control over how your matrimony journey moves forward.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/register" className={styles.primary}>
                Create your profile
              </Link>
              <Link href="/how-it-works" className={styles.secondary}>
                See how Bandhanaa works
              </Link>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span>© {new Date().getFullYear()} Bandhanaa. Meaningful connections begin here.</span>
            <nav className={styles.footerLinks} aria-label="Safety page footer navigation">
              <Link href="/about">About</Link>
              <Link href="/how-it-works">How it works</Link>
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
