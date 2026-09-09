import type { Metadata } from "next";
import { LanguageMatrimonyLanding, type LanguageMatrimonyPageConfig } from "@/components/public/LanguageMatrimonyLanding";
import { getCanonicalUrl } from "@/lib/seo";

const canonicalUrl = getCanonicalUrl("/tamil-matrimony");
const socialImage = getCanonicalUrl("/home/shared-values.png");

export const metadata: Metadata = {
  title: "Tamil Matrimony for Meaningful Marriage Connections | Bandhanaa",
  description:
    "Explore a modern Tamil matrimony experience focused on serious marriage connections, compatibility, family context, partner preferences, privacy and optional horoscope details.",
  alternates: { canonical: canonicalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Tamil Matrimony for Meaningful Marriage Connections | Bandhanaa",
    description:
      "A modern Tamil matrimony experience for people seeking serious relationships, clearer compatibility and respectful introductions.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
    images: [{ url: socialImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamil Matrimony for Meaningful Marriage Connections | Bandhanaa",
    description:
      "Discover a privacy-conscious Tamil matrimony experience built around serious intent, compatibility and meaningful introductions.",
    images: [socialImage],
  },
};

const config = {
  slug: "/tamil-matrimony",
  language: "Tamil",
  eyebrow: "Tamil matrimony on Bandhanaa",
  heroTitle: "Tamil matrimony, designed for more than",
  heroAccent: "matching a profile.",
  heroLead:
    "For people exploring Tamil matrimony with serious marriage intent, Bandhanaa brings language, lifestyle, family context, partner preferences and personal values into a cleaner, more private way to discover meaningful connections.",
  heroBadgeTitle: "Context before connection",
  heroBadgeText:
    "Understand what matters to someone before deciding whether you want to take the introduction forward.",
  introEyebrow: "A modern Tamil matrimony experience",
  introTitle: "Shared language can matter. So can everything",
  introAccent: "around it.",
  introParagraphs: [
    "Tamil matrimony can involve more than finding someone who speaks the same language. Lifestyle, family expectations, education, career plans, faith, location and long-term goals can all shape whether two people feel genuinely compatible.",
    "Bandhanaa is designed to give those details room without assuming every Tamil individual or family wants the same kind of match. You decide which preferences matter, which traditions are important and what you are comfortable sharing.",
    "The aim is a more thoughtful introduction: less emphasis on endless profile volume and more emphasis on the information that can help you decide whether a conversation is worth starting.",
  ],
  contextItems: [
    {
      icon: "language",
      title: "Language & communication",
      text: "Tamil language preferences can be part of compatibility while still leaving room for multilingual households and different communication styles.",
    },
    {
      icon: "location",
      title: "Location & future plans",
      text: "Where someone lives today and where they hope to build their future can matter as much as where they grew up.",
    },
    {
      icon: "family",
      title: "Family & expectations",
      text: "Use family context as one part of a wider conversation about values, responsibilities and the kind of marriage you both want.",
    },
    {
      icon: "education",
      title: "Education & career",
      text: "Understand educational background and professional direction without reducing a person to a qualification or job title.",
    },
  ],
  traditionEyebrow: "Tradition, when it matters to you",
  traditionTitle: "Tradition can guide the conversation without",
  traditionAccent: "taking away your choice.",
  traditionText:
    "Some Tamil families consider horoscope details, religious practices or family traditions important in a marriage decision; others give them less weight. Bandhanaa keeps horoscope information optional so astrology can be part of the process when it is meaningful to you, rather than a requirement for everyone.",
  decisionEyebrow: "Compatibility without a fixed formula",
  decisionTitle: "Your priorities should stay",
  decisionAccent: "personal.",
  decisionParagraphs: [
    "There is no single definition of the right Tamil matrimony match. One person may prioritize language and family values, another may care more about lifestyle, education, geography or future plans.",
    "Bandhanaa is built around that reality. Partner preferences can help narrow what is relevant, while the profile gives enough context to see the person behind the filters.",
  ],
  valueItems: [
    {
      icon: "values",
      title: "Lifestyle & values",
      text: "Compare everyday priorities, habits and long-term outlook instead of relying only on basic demographic fields.",
    },
    {
      icon: "relationship",
      title: "Religion & beliefs",
      text: "Include faith and personal beliefs where they matter to your marriage decision, with respect for different levels of practice.",
    },
    {
      icon: "family",
      title: "Partner preferences",
      text: "Be clearer about what you are seeking before an introduction becomes a conversation involving two families.",
    },
    {
      icon: "privacy",
      title: "Privacy & control",
      text: "Share thoughtfully, use connection controls and keep individual member details inside the intended matrimony experience rather than public SEO pages.",
    },
  ],
  locationTitle:
    "Tamil matrimony today can cross cities, states and countries while still keeping language and cultural understanding important.",
  locationText:
    "Whether your plans are centered around Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Bengaluru or somewhere much farther away, location can sit alongside language, family, lifestyle and future plans as one part of the compatibility picture.",
  journeyEyebrow: "How it works",
  journeyTitle: "A simpler path from Tamil matrimony search to",
  journeyAccent: "meaningful conversation.",
  steps: [
    {
      number: "01",
      title: "Create a useful profile",
      text: "Share the background, values, lifestyle and expectations that can help another person understand you beyond a photograph.",
    },
    {
      number: "02",
      title: "Set your preferences",
      text: "Choose the language, location, lifestyle, family and other compatibility factors that genuinely matter to you.",
    },
    {
      number: "03",
      title: "Discover with context",
      text: "Review profiles with enough information to decide whether a connection may be relevant before sending a request.",
    },
    {
      number: "04",
      title: "Connect respectfully",
      text: "Move into a private conversation when interest feels mutual and take the next step at a pace that suits both people.",
    },
  ],
  faqIntro:
    "These answers explain how Bandhanaa approaches Tamil matrimony without turning a language-based search into a stereotype or a public directory of personal profiles.",
  faqs: [
    {
      question: "What does Tamil matrimony mean on Bandhanaa?",
      answer:
        "Tamil matrimony on Bandhanaa is a public discovery page for people interested in serious marriage connections where Tamil language or cultural context may be relevant. The actual member experience focuses on compatibility, partner preferences, privacy and respectful introductions.",
    },
    {
      question: "Do I have to speak only Tamil to use this matrimony experience?",
      answer:
        "No. Tamil can be an important language preference without being the only language in a household or relationship. People can consider language alongside location, lifestyle, family expectations and other compatibility factors.",
    },
    {
      question: "Can horoscope details be part of Tamil matrimony compatibility?",
      answer:
        "Yes, horoscope details can be included when astrology matters to you. Bandhanaa treats horoscope information as optional rather than making it mandatory for every person seeking a marriage connection.",
    },
    {
      question: "Can I look for Tamil matrimony if I live outside Tamil Nadu?",
      answer:
        "Yes. Location and future plans can be part of compatibility regardless of where you currently live. Tamil language or cultural connection can remain relevant for people living elsewhere in India or abroad.",
    },
    {
      question: "Are individual Tamil matrimony profiles published on this SEO page?",
      answer:
        "No. This page is informational and does not intentionally publish individual member names, photos, dates of birth, horoscope details or other private matrimony profile information for search-engine indexing.",
    },
    {
      question: "How should I decide whether a Tamil matrimony profile is compatible?",
      answer:
        "Use more than one signal. Consider communication, values, lifestyle, family context, education, location, partner preferences, long-term plans and optional traditions such as horoscope where relevant to you.",
    },
  ],
} satisfies LanguageMatrimonyPageConfig;

export default function TamilMatrimonyPage() {
  return <LanguageMatrimonyLanding config={config} />;
}
