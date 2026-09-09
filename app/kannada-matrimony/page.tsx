import type { Metadata } from "next";
import { LanguageMatrimonyLanding, type LanguageMatrimonyPageConfig } from "@/components/public/LanguageMatrimonyLanding";
import { getCanonicalUrl } from "@/lib/seo";

const canonicalUrl = getCanonicalUrl("/kannada-matrimony");
const socialImage = getCanonicalUrl("/home/shared-values.png");

export const metadata: Metadata = {
  title: "Kannada Matrimony for Meaningful Marriage Connections | Bandhanaa",
  description:
    "Explore a modern Kannada matrimony experience for serious marriage connections, compatibility, family context, lifestyle, partner preferences, privacy and optional horoscope details.",
  alternates: { canonical: canonicalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Kannada Matrimony for Meaningful Marriage Connections | Bandhanaa",
    description:
      "A modern Kannada matrimony experience built around serious relationships, compatibility context and respectful introductions.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
    images: [{ url: socialImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kannada Matrimony for Meaningful Marriage Connections | Bandhanaa",
    description:
      "Discover Kannada matrimony with serious intent, clearer compatibility, privacy and thoughtful connection requests.",
    images: [socialImage],
  },
};

const config = {
  slug: "/kannada-matrimony",
  language: "Kannada",
  eyebrow: "Kannada matrimony on Bandhanaa",
  heroTitle: "Kannada matrimony with more room for",
  heroAccent: "real compatibility.",
  heroLead:
    "Bandhanaa gives people exploring Kannada matrimony a modern, marriage-focused way to consider language, values, family context, lifestyle, location, expectations and the future they hope to build together.",
  heroBadgeTitle: "More than biodata",
  heroBadgeText:
    "A thoughtful profile can show how someone lives, what they value and what they expect from a serious partnership.",
  introEyebrow: "A considered Kannada matrimony experience",
  introTitle: "Language can create familiarity. Compatibility needs",
  introAccent: "a fuller picture.",
  introParagraphs: [
    "Kannada matrimony can begin with a shared language or cultural connection, but meaningful compatibility often depends on much more: everyday lifestyle, career plans, family relationships, personal beliefs and the way two people imagine married life.",
    "Bandhanaa is designed for people who want to understand those details before starting a conversation. It does not assume every Kannada-speaking person has the same family structure, traditions or priorities.",
    "That makes the experience more flexible for individuals and families who want cultural understanding without reducing a serious marriage decision to a narrow checklist.",
  ],
  contextItems: [
    {
      icon: "language",
      title: "Kannada & communication",
      text: "Shared language can support comfort and family communication, while multilingual preferences can remain part of the conversation too.",
    },
    {
      icon: "location",
      title: "Where you want to build life",
      text: "Current location, relocation flexibility and future plans can matter when careers and families are spread across different cities.",
    },
    {
      icon: "family",
      title: "Family relationships",
      text: "Understand expectations around family involvement, responsibilities and support without assuming one model is right for everyone.",
    },
    {
      icon: "education",
      title: "Education, work & direction",
      text: "Use education and career as context for a broader discussion about ambition, stability, priorities and the future.",
    },
  ],
  traditionEyebrow: "Tradition with flexibility",
  traditionTitle: "Respect tradition without making every decision",
  traditionAccent: "the same way.",
  traditionText:
    "Some Kannada matrimony journeys include horoscope compatibility, religious customs and family traditions; others are led more strongly by personal values and practical fit. Bandhanaa keeps horoscope information optional so tradition can be included when it matters without defining the experience for everyone.",
  decisionEyebrow: "Compatibility on your terms",
  decisionTitle: "A good match should reflect the life you actually want to",
  decisionAccent: "live together.",
  decisionParagraphs: [
    "Compatibility can look different for someone based in Bengaluru than for someone planning life in Mysuru, Mangaluru, Hubballi-Dharwad or outside Karnataka altogether. Geography, career mobility and family proximity may influence the choices people make.",
    "Bandhanaa helps keep these factors visible alongside language, lifestyle, beliefs and partner preferences so the decision can be personal rather than formulaic.",
  ],
  valueItems: [
    {
      icon: "values",
      title: "Values & lifestyle",
      text: "Look at routines, social preferences, habits and personal priorities that can shape everyday compatibility after marriage.",
    },
    {
      icon: "relationship",
      title: "Intentions & future plans",
      text: "Make room for discussions about marriage goals, children, career decisions and the kind of home life each person wants.",
    },
    {
      icon: "family",
      title: "Clear partner preferences",
      text: "Describe the requirements that matter most so both people can approach an introduction with more realistic expectations.",
    },
    {
      icon: "privacy",
      title: "Respectful privacy",
      text: "Keep public SEO content informational while personal matrimony details remain inside the member experience and visibility controls.",
    },
  ],
  locationTitle:
    "Kannada matrimony can connect people across Karnataka's cities, India's technology hubs and communities living around the world.",
  locationText:
    "Whether your plans involve Bengaluru, Mysuru, Mangaluru, Hubballi-Dharwad, Belagavi or another place entirely, location can be weighed together with Kannada language, career plans, family proximity and the practical life you hope to create after marriage.",
  journeyEyebrow: "How Bandhanaa works",
  journeyTitle: "A calmer Kannada matrimony journey from profile to",
  journeyAccent: "private conversation.",
  steps: [
    {
      number: "01",
      title: "Show who you are",
      text: "Build a profile that explains your values, background, work, lifestyle and expectations in a way another person can actually understand.",
    },
    {
      number: "02",
      title: "Choose relevant preferences",
      text: "Set the language, location, family, lifestyle and optional tradition-related preferences that are important to your marriage decision.",
    },
    {
      number: "03",
      title: "Look beyond the photograph",
      text: "Review the wider profile context and decide whether the person's priorities appear compatible with your own.",
    },
    {
      number: "04",
      title: "Connect with intention",
      text: "Send a request when the match feels relevant and move into a private conversation when both people are comfortable continuing.",
    },
  ],
  faqIntro:
    "These answers explain how Bandhanaa approaches Kannada matrimony as useful, human-readable content rather than a public directory of personal member data.",
  faqs: [
    {
      question: "What is Kannada matrimony on Bandhanaa?",
      answer:
        "It is an informational page for people exploring serious marriage connections where Kannada language or cultural context may matter. The Bandhanaa member experience focuses on compatibility, partner preferences, privacy and intentional connection requests.",
    },
    {
      question: "Do Kannada matrimony connections have to be within Karnataka?",
      answer:
        "No. Kannada language and cultural connection can remain important regardless of where someone currently lives. Location is a separate compatibility factor and can be considered together with family, work and long-term plans.",
    },
    {
      question: "Can horoscope information be used for Kannada matrimony?",
      answer:
        "Yes, when it matters to you. Horoscope information is optional, so people who value astrology can consider it while others can focus on different relationship and compatibility factors.",
    },
    {
      question: "Can I use Kannada matrimony if I live in Bengaluru but my family is elsewhere?",
      answer:
        "Yes. Current city, family location, mobility and future plans can all be part of the compatibility conversation. A serious marriage decision can involve several places rather than a single hometown.",
    },
    {
      question: "Are Kannada member profiles publicly listed on this page?",
      answer:
        "No. This public SEO page does not intentionally publish individual member names, personal photos, dates of birth, family details, horoscope information or other private profile data for search-engine indexing.",
    },
    {
      question: "What should I consider beyond Kannada language compatibility?",
      answer:
        "Consider lifestyle, communication, family relationships, education, career plans, geography, beliefs, partner preferences and long-term goals. Shared language can be meaningful without being the only part of compatibility.",
    },
  ],
} satisfies LanguageMatrimonyPageConfig;

export default function KannadaMatrimonyPage() {
  return <LanguageMatrimonyLanding config={config} />;
}
