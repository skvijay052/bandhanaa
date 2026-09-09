import type { Metadata } from "next";
import { LanguageMatrimonyLanding, type LanguageMatrimonyPageConfig } from "@/components/public/LanguageMatrimonyLanding";
import { getCanonicalUrl } from "@/lib/seo";

const canonicalUrl = getCanonicalUrl("/malayalam-matrimony");
const socialImage = getCanonicalUrl("/home/shared-values.png");

export const metadata: Metadata = {
  title: "Malayalam Matrimony for Serious Marriage Connections | Bandhanaa",
  description:
    "Explore a modern Malayalam matrimony experience focused on serious relationships, compatibility, family context, lifestyle, partner preferences, privacy and optional horoscope details.",
  alternates: { canonical: canonicalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Malayalam Matrimony for Serious Marriage Connections | Bandhanaa",
    description:
      "A modern Malayalam matrimony experience for meaningful marriage introductions with clearer compatibility, privacy and respectful communication.",
    url: canonicalUrl,
    siteName: "Bandhanaa",
    type: "website",
    images: [{ url: socialImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Malayalam Matrimony for Serious Marriage Connections | Bandhanaa",
    description:
      "Discover Malayalam matrimony with serious intent, compatibility context, partner preferences and privacy-conscious introductions.",
    images: [socialImage],
  },
};

const config = {
  slug: "/malayalam-matrimony",
  language: "Malayalam",
  eyebrow: "Malayalam matrimony on Bandhanaa",
  heroTitle: "Malayalam matrimony that puts the person before",
  heroAccent: "the checklist.",
  heroLead:
    "For people exploring Malayalam matrimony with serious relationship intent, Bandhanaa brings language, family context, lifestyle, education, location, partner preferences and future plans into a more thoughtful and private discovery experience.",
  heroBadgeTitle: "Meaningful, not mechanical",
  heroBadgeText:
    "Use compatibility information to understand the person rather than turning marriage into a long list of filters.",
  introEyebrow: "A modern Malayalam matrimony approach",
  introTitle: "Shared background can open the door. A strong relationship needs",
  introAccent: "deeper alignment.",
  introParagraphs: [
    "Malayalam matrimony can involve shared language, family ties and cultural familiarity, but those factors are only part of what makes two people compatible. Daily lifestyle, career decisions, faith, independence, family expectations and plans for the future can be equally important.",
    "Bandhanaa is designed to make those conversations easier to begin. It gives people room to express what matters to them without assuming every Malayali individual or family follows the same customs or wants the same kind of marriage.",
    "The result is a more balanced way to discover serious connections: cultural context when it helps, personal choice where it matters and privacy throughout the journey.",
  ],
  contextItems: [
    {
      icon: "language",
      title: "Malayalam & communication",
      text: "Shared language can create comfort while still allowing for bilingual or multilingual relationships and different family communication patterns.",
    },
    {
      icon: "location",
      title: "Location & global mobility",
      text: "Current city, overseas work, relocation and long-term plans can be important when families and careers are spread across different places.",
    },
    {
      icon: "family",
      title: "Family & independence",
      text: "Understand how each person thinks about family involvement, independence, responsibilities and the balance they want after marriage.",
    },
    {
      icon: "education",
      title: "Education & career direction",
      text: "Use education and professional background as context for a broader conversation about ambition, stability and future choices.",
    },
  ],
  traditionEyebrow: "Tradition as a choice",
  traditionTitle: "Keep culture and tradition meaningful without making them",
  traditionAccent: "automatic rules.",
  traditionText:
    "Malayalam matrimony can include horoscope compatibility, religious practices and family traditions, but different people give those factors different importance. Bandhanaa keeps horoscope information optional and leaves room for individuals to decide how tradition fits into their own marriage journey.",
  decisionEyebrow: "Compatibility across real life",
  decisionTitle: "The right match should make sense for the life you are",
  decisionAccent: "building next.",
  decisionParagraphs: [
    "For many Malayali professionals, marriage decisions may involve questions about Kerala, another Indian city or life abroad. Career opportunities, family proximity, lifestyle and future location can all affect compatibility.",
    "Bandhanaa helps keep those practical considerations visible alongside language, values, beliefs and partner preferences so a connection can be evaluated in a more complete way.",
  ],
  valueItems: [
    {
      icon: "values",
      title: "Lifestyle & everyday fit",
      text: "Compare routines, personal habits, social preferences and the everyday choices that can shape life together after marriage.",
    },
    {
      icon: "relationship",
      title: "Faith & personal values",
      text: "Include religion or spiritual practice where it matters while respecting that people may follow the same tradition in very different ways.",
    },
    {
      icon: "family",
      title: "Partner preferences",
      text: "Be clear about what you are seeking before conversations become serious, especially when families may become involved later.",
    },
    {
      icon: "privacy",
      title: "Privacy-conscious discovery",
      text: "Keep public SEO content informational while personal matrimony details remain inside the intended member experience and privacy controls.",
    },
  ],
  locationTitle:
    "Malayalam matrimony often connects people across Kerala, India's major cities and a large global Malayali community.",
  locationText:
    "Whether your plans involve Kochi, Thiruvananthapuram, Kozhikode, Thrissur, Bengaluru, another Indian city or life abroad, location can be considered together with Malayalam language, family ties, career direction and the future both people want after marriage.",
  journeyEyebrow: "How the journey works",
  journeyTitle: "From Malayalam matrimony search to a conversation with",
  journeyAccent: "more clarity.",
  steps: [
    {
      number: "01",
      title: "Create a thoughtful profile",
      text: "Share enough about your background, lifestyle, values and expectations to help another person understand the life behind the biodata.",
    },
    {
      number: "02",
      title: "Describe your priorities",
      text: "Set preferences around language, location, family, lifestyle and optional tradition-related factors that genuinely matter to you.",
    },
    {
      number: "03",
      title: "Review the wider context",
      text: "Look beyond a photograph or one qualification and consider whether the person's overall priorities align with your own.",
    },
    {
      number: "04",
      title: "Connect privately",
      text: "Send a request when the profile feels relevant and continue the conversation privately when both people want to take the next step.",
    },
  ],
  faqIntro:
    "These answers explain how Bandhanaa approaches Malayalam matrimony as useful public information while keeping individual member details out of public SEO content.",
  faqs: [
    {
      question: "What is Malayalam matrimony on Bandhanaa?",
      answer:
        "It is an informational page for people exploring serious marriage connections where Malayalam language or Malayali cultural context may be relevant. Bandhanaa's member experience focuses on compatibility, partner preferences, privacy and intentional introductions.",
    },
    {
      question: "Can Malayalam matrimony include people who live outside Kerala?",
      answer:
        "Yes. Malayalam language and cultural connection can remain important wherever someone lives. Current location, relocation flexibility and future plans can be considered as separate compatibility factors.",
    },
    {
      question: "Is horoscope matching required for Malayalam matrimony?",
      answer:
        "No. Horoscope details are optional. People who consider astrology important can include it, while others can focus on different relationship, lifestyle and family compatibility factors.",
    },
    {
      question: "Can location abroad be part of Malayalam matrimony preferences?",
      answer:
        "Yes. Location and future plans can be part of the compatibility discussion whether someone lives in Kerala, another Indian city or abroad. The goal is to understand how both people's practical plans fit together.",
    },
    {
      question: "Does this page publicly list Malayalam matrimony member profiles?",
      answer:
        "No. This public SEO page does not intentionally publish individual member names, personal photos, dates of birth, family details, horoscope information or other private profile data for search-engine indexing.",
    },
    {
      question: "What should I consider beyond Malayalam language when choosing a match?",
      answer:
        "Consider communication, lifestyle, family expectations, education, career plans, geography, beliefs, partner preferences and long-term goals. Shared language can create familiarity, but a sustainable relationship usually depends on a much wider fit.",
    },
  ],
} satisfies LanguageMatrimonyPageConfig;

export default function MalayalamMatrimonyPage() {
  return <LanguageMatrimonyLanding config={config} />;
}
