export type Guide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  readTime: string;
  sections: { heading: string; paragraphs: string[]; points?: string[] }[];
  faq: { question: string; answer: string }[];
};

export const guides: Guide[] = [
  {
    slug: "how-to-create-a-matrimony-profile",
    title: "How to Create a Matrimony Profile That Reflects Who You Are",
    description: "Learn how to write a clear, authentic matrimony profile with a strong introduction, practical partner preferences and privacy-conscious photos.",
    intro: "A useful matrimony profile helps someone understand your personality and marriage intentions—not just your age, education or job title. Here is a practical approach to writing yours.",
    readTime: "6 min read",
    sections: [
      { heading: "Start with a personal introduction", paragraphs: ["Write in your own voice. A short introduction can describe your work or studies, interests, everyday routine and the values you bring to relationships. Be specific enough to start a genuine conversation.", "For example, instead of saying only ‘family-oriented and friendly’, explain what family means to you or how you like to spend weekends. Avoid sharing personal contact information in your public introduction."] },
      { heading: "Give helpful context about your life", paragraphs: ["Education, profession and location can be useful, but they do not tell the whole story. Share interests, lifestyle preferences, family context and long-term goals where you feel comfortable. It is fine to keep sensitive details private until trust develops."], points: ["Describe your interests using a real example.", "Explain where you live and whether relocation is a possibility.", "Mention career or family plans that may affect married life.", "Use respectful, accurate information rather than exaggeration."] },
      { heading: "Write partner preferences with care", paragraphs: ["Think about the difference between preferences and non-negotiables. Communication, attitudes to finances, career support, family responsibilities and future goals are often worth discussing. Avoid language that stereotypes or excludes people unnecessarily.", "If language, religion or horoscope considerations are relevant to you, describe them honestly while leaving room for individual differences."] },
      { heading: "Choose photographs thoughtfully", paragraphs: ["Use recent, clear photos that look like you today. A relaxed portrait with natural lighting is often more informative than heavily edited images. Do not post pictures of other people without their permission.", "Review the platform's visibility settings before adding any image, and never use a photograph as proof of identity on its own."] },
      { heading: "Review your profile before sharing", paragraphs: ["Check spelling and clarity, remove phone numbers or addresses, and ask yourself whether a stranger could reasonably understand your values and intentions. Update your information when your circumstances change.", "A complete profile cannot guarantee a compatible match, but it can make the first conversation more meaningful."] }
    ],
    faq: [
      { question: "How long should a matrimony bio be?", answer: "Aim for a few useful paragraphs rather than a fixed word count. Include your interests, values, current life and what you hope for in marriage." },
      { question: "Should I include my phone number in my profile?", answer: "No. Keep direct contact details private and use the platform's communication controls until you feel comfortable and have established trust." },
      { question: "Should I mention partner preferences?", answer: "Yes, but focus on respectful and meaningful compatibility factors, and distinguish firm needs from flexible preferences." }
    ]
  },
  {
    slug: "questions-to-ask-before-arranged-marriage",
    title: "Important Questions to Ask Before an Arranged Marriage",
    description: "Explore thoughtful questions about values, family, finances, lifestyle and future goals before deciding whether a marriage connection feels right.",
    intro: "An introduction is only the beginning. Whether families are involved or you are exploring a match independently, thoughtful conversations can help both people understand expectations and make decisions freely.",
    readTime: "7 min read",
    sections: [
      { heading: "Begin with values and everyday life", paragraphs: ["Ask open-ended questions that invite stories rather than yes-or-no answers. For instance, ‘What does a satisfying weekend look like?’ or ‘How do you usually resolve disagreements?’ can tell you more than generic questions about hobbies.", "Listen as carefully as you speak. Both people should have the space to ask questions and change their minds."] },
      { heading: "Discuss work, location and long-term plans", paragraphs: ["Talk about career aspirations, where you might live after marriage and whether relocation is realistic. Explore how each of you would support career changes, studies or time with family."], points: ["Where would you ideally like to live in the next five years?", "How do you think two careers should be balanced?", "What does work-life balance mean to you?", "How would we approach a major move?"] },
      { heading: "Understand family expectations", paragraphs: ["Families play different roles in different relationships. Ask about family involvement, living arrangements, responsibilities toward parents and approaches to boundaries. Avoid assuming everyone from the same community has the same expectations."] },
      { heading: "Talk about money, health and important choices respectfully", paragraphs: ["Financial habits, savings, debt, spending priorities and big commitments can affect a shared future. Sensitive topics such as health and children should be approached with respect and at a mutually comfortable pace. No one should be pressured to disclose private information immediately.", "You can also discuss whether religious practices, traditions or astrology will influence future decisions."] },
      { heading: "Notice how the conversation feels", paragraphs: ["Good compatibility includes mutual respect, honest answers and the freedom to disagree. Repeated pressure, requests for money, attempts to isolate you or refusal to respect boundaries are warning signs.", "Take your time, verify important claims independently and remember that an introduction does not create an obligation to proceed."] }
    ],
    faq: [
      { question: "What should I ask in the first conversation?", answer: "Start with interests, everyday life, marriage intentions and the person's hopes for the future. Leave more sensitive discussions for when both people are comfortable." },
      { question: "When should we discuss finances?", answer: "Before a serious commitment, once trust and mutual interest are established. Discuss financial expectations openly without demanding access to private accounts." },
      { question: "Is it acceptable to say no after several conversations?", answer: "Yes. A marriage decision requires freely given agreement from both people at every stage." }
    ]
  },
  {
    slug: "online-matrimony-safety-tips",
    title: "Online Matrimony Safety Tips: Protect Your Privacy While Meeting Matches",
    description: "Practical online matrimony safety advice covering profile privacy, identity checks, suspicious requests, first meetings and reporting concerns.",
    intro: "Online matrimonial introductions can connect people who might not otherwise meet. A cautious, privacy-first approach helps you evaluate a connection without placing yourself under unnecessary pressure.",
    readTime: "6 min read",
    sections: [
      { heading: "Protect your personal details", paragraphs: ["Avoid placing your home address, personal phone number, identity documents, financial information or workplace schedule in a public profile. Review privacy and visibility settings and share only what is necessary for an initial introduction.", "Consider keeping early conversations inside the platform until you have established a reason to trust the other person."] },
      { heading: "Verify information gradually", paragraphs: ["A profile photograph, badge or persuasive story is not a guarantee of identity or intentions. Look for consistency over time, use a video call when appropriate and independently verify important information before a major commitment.", "Respect the other person's privacy as well: never demand passwords, identity documents or access to private accounts."] },
      { heading: "Recognize common warning signs", paragraphs: ["Fraudulent accounts may create urgency, refuse reasonable verification or try to move conversations to untraceable channels. Treat requests for money, investments, gift cards or cryptocurrency as major warning signs."], points: ["A new connection asks for a loan, investment or emergency transfer.", "Someone pressures you to share private photographs or documents.", "Stories and personal details change repeatedly.", "A match tries to prevent you from speaking with trusted people.", "You are pressured to commit before you feel ready."] },
      { heading: "Plan safer first meetings", paragraphs: ["For an in-person meeting, choose a public location, arrange your own transportation and tell someone you trust where you will be. Do not feel obliged to share a home address or travel alone to an unfamiliar place.", "If a situation feels unsafe, leave and seek help. Your comfort matters more than politeness."] },
      { heading: "Report concerns and move at your own pace", paragraphs: ["Use available block or report options for suspicious or abusive behavior. Keep relevant evidence, such as messages or transaction details, when safe to do so. If money has been lost or a crime may have occurred, contact the appropriate authorities.", "Safety practices reduce risk but cannot eliminate it. No platform should promise a completely risk-free matchmaking experience."] }
    ],
    faq: [
      { question: "Is a verified profile completely safe?", answer: "No. Verification may help with specific checks, but it cannot guarantee honesty, compatibility or future behavior. Continue to use your own judgment." },
      { question: "Should I send money to someone I met on a matrimony site?", answer: "Treat requests for money, urgent transfers or investment opportunities from new connections as serious warning signs. Do not send funds because someone pressures you." },
      { question: "Where should a first meeting happen?", answer: "Choose a public place, make your own travel arrangements and let someone you trust know your plans." }
    ]
  }
];

export const findGuide = (slug: string) => guides.find((guide) => guide.slug === slug);
