import type { Metadata } from "next";
import { LanguageMatrimonyLanding, type LanguageMatrimonyPageConfig } from "@/components/public/LanguageMatrimonyLanding";
import { getCanonicalUrl } from "@/lib/seo";

const canonicalUrl = getCanonicalUrl("/telugu-matrimony");
const socialImage = getCanonicalUrl("/home/shared-values.png");

export const metadata: Metadata = {
  title: "Telugu Matrimony for Serious Marriage Connections | Bandhanaa",
  description:
    "Explore a modern Telugu matrimony experience focused on serious relationships, compatibility, family expectations, partner preferences, privacy and optional horoscope details.",
  alternates: { canonical: canonicalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Telugu Matrimony for Serious Marriage Connections | Bandhanaa",
    description:
      "A modern Telugu matrimony experience for meaningful marriage introductions with clearer compatibility and privacy-conscious connection controls.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
    images: [{ url: socialImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Telugu Matrimony for Serious Marriage Connections | Bandhanaa",
    description:
      "Discover Telugu matrimony with serious intent, compatibility context, partner preferences and respectful introductions.",
    images: [socialImage],
  },
};

const config = {
  slug: "/telugu-matrimony",
  language: "Telugu",
  eyebrow: "Telugu matrimony on Bandhanaa",
  heroTitle: "Telugu matrimony for people looking for",
  heroAccent: "something serious.",
  heroLead:
    "Bandhanaa offers a modern way to approach Telugu matrimony by bringing language, location, family context, lifestyle, expectations and long-term relationship goals into one thoughtful discovery experience.",
  heroBadgeTitle: "Serious intent, clearer context",
  heroBadgeText:
    "See the factors that matter to you before deciding whether to begin a marriage-focused conversation.",
  introEyebrow: "Beyond a language filter",
  introTitle: "Telugu matrimony works better when compatibility has",
  introAccent: "more context.",
  introParagraphs: [
    "For many people exploring Telugu matrimony, language is one meaningful part of compatibility, but it rarely tells the whole story. Career direction, family expectations, lifestyle, religion, location and plans after marriage may all influence whether a connection feels right.",
    "Bandhanaa is designed to make those considerations easier to understand without assuming every Telugu-speaking person follows the same traditions or has the same priorities.",
    "Instead of treating matrimony as a directory of profiles, the experience encourages a more considered decision: understand the person, review what they choose to share and connect when the match feels relevant.",
  ],
  contextItems: [
    {
      icon: "language",
      title: "Telugu & communication",
      text: "Consider Telugu language preference together with the way you want to communicate at home, with family and in everyday life.",
    },
    {
      icon: "location",
      title: "Location & mobility",
      text: "Current city, relocation plans and the place you hope to build your future can all influence a serious marriage decision.",
    },
    {
      icon: "family",
      title: "Family context",
      text: "Understand family values and expectations as part of a broader conversation rather than assuming every family wants the same arrangement.",
    },
    {
      icon: "education",
      title: "Education & ambition",
      text: "Educational and professional background can provide useful context, while long-term goals reveal more about how two lives may fit together.",
    },
  ],
  traditionEyebrow: "Choice around tradition",
  traditionTitle: "Horoscope and tradition can matter without becoming",
  traditionAccent: "the entire match.",
  traditionText:
    "Some Telugu matrimony decisions include horoscope compatibility, religious customs or family traditions. Others focus more strongly on personal values and practical compatibility. Bandhanaa keeps astrological details optional so each person can decide how much weight tradition should carry.",
  decisionEyebrow: "A wider view of compatibility",
  decisionTitle: "The right match is about how your lives",
  decisionAccent: "fit together.",
  decisionParagraphs: [
    "A strong Telugu matrimony connection may involve shared language and cultural understanding, but a sustainable relationship also depends on communication, lifestyle, expectations and mutual respect.",
    "Partner preferences help make important requirements visible, while profile context can help you avoid making a decision from one field, one photograph or one family expectation alone.",
  ],
  valueItems: [
    {
      icon: "values",
      title: "Everyday lifestyle",
      text: "Think about routines, social life, food preferences, habits and the everyday choices that shape married life.",
    },
    {
      icon: "relationship",
      title: "Long-term intentions",
      text: "Make space for conversations about marriage goals, responsibilities and the future you are both hoping to build.",
    },
    {
      icon: "family",
      title: "Partner expectations",
      text: "State the preferences that genuinely matter so introductions begin with more clarity and less avoidable mismatch.",
    },
    {
      icon: "privacy",
      title: "Private by design",
      text: "Public SEO content stays informational while personal matrimony details remain part of the intended member experience and visibility controls.",
    },
  ],
  locationTitle:
    "Telugu matrimony often connects people across Andhra Pradesh, Telangana and a much wider professional diaspora.",
  locationText:
    "Whether your life is in Hyderabad, Visakhapatnam, Vijayawada, Tirupati, Bengaluru or another city in India or abroad, location can be considered together with Telugu language, family context, career plans and the future you want after marriage.",
  journeyEyebrow: "A more intentional journey",
  journeyTitle: "Move from Telugu matrimony discovery to conversation with",
  journeyAccent: "less guesswork.",
  steps: [
    {
      number: "01",
      title: "Build a complete picture",
      text: "Create a profile that explains your background, lifestyle, values and marriage expectations instead of relying on basic biodata alone.",
    },
    {
      number: "02",
      title: "Define what matters",
      text: "Use partner preferences to identify meaningful criteria such as language, location, family context, lifestyle and optional horoscope considerations.",
    },
    {
      number: "03",
      title: "Evaluate thoughtfully",
      text: "Read the available profile context and decide whether the person appears aligned with the kind of relationship you want.",
    },
    {
      number: "04",
      title: "Take the next step privately",
      text: "Send a request when you are interested and continue the conversation privately when there is mutual willingness to connect.",
    },
  ],
  faqIntro:
    "These questions cover how Bandhanaa approaches Telugu matrimony as a serious relationship experience rather than a keyword directory or public member listing.",
  faqs: [
    {
      question: "What is Telugu matrimony on Bandhanaa?",
      answer:
        "It is an informational landing page for people exploring serious marriage connections where Telugu language or cultural context may be relevant. Bandhanaa's member experience focuses on compatibility, partner preferences, privacy and respectful connection requests.",
    },
    {
      question: "Can Telugu matrimony include people from both Andhra Pradesh and Telangana?",
      answer:
        "Yes. Telugu language and cultural connection are not limited to one state or city. Location can be considered as its own compatibility factor alongside language, family context, lifestyle and long-term plans.",
    },
    {
      question: "Is horoscope matching compulsory for Telugu matrimony on Bandhanaa?",
      answer:
        "No. Horoscope information is optional. People who consider astrology important can include it in their decision, while others can focus on different compatibility factors.",
    },
    {
      question: "Can I use Telugu matrimony if I work in another state or country?",
      answer:
        "Yes. Where you currently live can be part of your profile and compatibility discussion, while Telugu language, family background and cultural understanding may still be meaningful regardless of geography.",
    },
    {
      question: "Does this SEO page expose Telugu member profiles to Google?",
      answer:
        "No. The page is designed as public informational content and does not intentionally publish individual member names, personal photos, dates of birth, family details or horoscope information for search-engine indexing.",
    },
    {
      question: "What should I compare before sending a matrimony request?",
      answer:
        "Look at the combination of communication, lifestyle, location, education, family expectations, beliefs, partner preferences and long-term goals that matter to you. No single profile field should have to carry the whole decision.",
    },
  ],
} satisfies LanguageMatrimonyPageConfig;

export default function TeluguMatrimonyPage() {
  return <LanguageMatrimonyLanding config={config} />;
}
