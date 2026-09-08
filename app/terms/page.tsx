import type { Metadata } from "next";
import Link from "next/link";
import { PublicLegalHeader } from "@/components/public/PublicLegalHeader";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing access to and use of the Bandhanaa matrimony platform.",
};

const sections = [
  ["1. Eligibility", <><p>You may use Bandhanaa only if you are legally eligible to enter into marriage under the laws applicable to you and are legally capable of entering into these Terms. Bandhanaa is not intended for children or for anyone prohibited by law from using a matrimony service.</p><p>By creating an account, you confirm that you satisfy these requirements and that your use of Bandhanaa is for a genuine matrimonial purpose.</p></>],
  ["2. Matrimonial purpose only", <><p>Bandhanaa is a matrimony platform intended to help people discover and communicate with prospective marriage partners. It is not a dating, casual relationship, escort, solicitation or adult-content service.</p><p>You must not use Bandhanaa to advertise goods or services, solicit money, recruit people, promote unrelated businesses, conduct surveys, distribute spam or pursue any purpose unrelated to a genuine matrimonial search.</p></>],
  ["3. Your account", <><p>You are responsible for the information submitted through your account and for activity carried out while you are signed in. Keep your password, email account and devices secure and do not permit another person to use your account in a misleading or unauthorized manner.</p><p>Unless a feature expressly permits a profile to be managed on another person's behalf, you should maintain only an account that accurately identifies the person seeking a matrimonial alliance. You must notify us if you believe your account has been accessed without authorization.</p></>],
  ["4. Profile information and accuracy", <><p>You agree to provide information that is accurate to the best of your knowledge and to keep material profile information reasonably current. This includes, where supplied, your identity and contact information, age or date of birth, marital status, location, education, profession, annual income, family and lifestyle details, photographs, horoscope information and matrimonial preferences.</p><p>You must not impersonate another person, create a deceptive identity, misrepresent your age, marital status, profession, income or other material facts, use another person's photograph without authority, or knowingly provide false information to obtain another member's trust.</p></>],
  ["5. Profiles, discovery and matching", <><p>Bandhanaa may use profile information, preferences and activity to provide search, discovery, filtering, recommendations and match-related features. A recommendation, match, compatibility indicator, profile ranking or search result is a discovery aid only. It is not an endorsement, verification, guarantee of compatibility or representation that a member is suitable for marriage.</p><p>You are responsible for deciding whom to contact, whether to continue a conversation and whether to pursue a relationship.</p></>],
  ["6. Interests, requests, favourites and profile activity", <p>Features such as connection requests, interests, favourites or shortlists, profile visits, follows and similar activity are intended to help members manage matrimonial interactions. Depending on the feature, your action or status may be visible to the relevant member. You must not use these features to harass, intimidate, repeatedly contact or monitor another person.</p>],
  ["7. Messaging and communication", <><p>Bandhanaa may allow eligible members to communicate through in-app messaging. Communications must remain lawful, respectful and consistent with a genuine matrimonial purpose.</p><p>Do not send threats, abuse, sexual or obscene material, discriminatory harassment, unsolicited promotions, malicious links, requests for passwords or authentication codes, or messages designed to deceive another member. If another member asks you to stop contacting them, you must respect that request.</p></>],
  ["8. Member safety and due diligence", <><p>Bandhanaa provides a platform for introductions; we are not a party to relationships, meetings, engagements, marriages or transactions between members. You should independently verify information that is important to your decision before relying on it.</p><p>Use particular care before sharing your home address, financial information, identity documents or other highly sensitive information. Do not send money, transfer assets, provide banking credentials or make financial commitments merely because someone has contacted you through Bandhanaa. When meeting a member in person, use reasonable personal-safety precautions.</p></>],
  ["9. Verification", <p>Bandhanaa may offer or introduce email, mobile, identity, photograph or other verification measures. A verification indicator means only that the specified verification step was completed at the relevant time. It does not constitute a background check, character reference, financial verification, guarantee of identity in every respect, or endorsement of a member.</p>],
  ["10. Prohibited conduct and content", <><p>You must not upload, publish, transmit, store or share content that you do not have the right to use; infringes intellectual-property or privacy rights; is obscene, sexually explicit, exploitative or harmful to children; is threatening, defamatory or unlawfully discriminatory; facilitates fraud, money laundering or other unlawful activity; impersonates another person; intentionally deceives or misleads others; contains malware; or otherwise violates applicable law.</p><p>You must not scrape profiles, harvest member information, operate bots or automated accounts, probe or circumvent security measures, reverse engineer protected parts of the service, interfere with Bandhanaa's operation, bypass access restrictions or use member information to build another database, directory or service.</p></>],
  ["11. Photographs and content you provide", <><p>You retain your rights in photographs, text and other content you submit. You grant Bandhanaa a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, process, adapt for technical display, and show that content only as reasonably necessary to operate, secure, improve and provide the service in accordance with your settings and our Privacy Policy.</p><p>You represent that you have the rights and permissions necessary to submit the content. Removing content or closing an account ends this licence except to the extent copies must reasonably remain in backups, safety records, legal records or content already shared with another member through a feature such as messaging.</p></>],
  ["12. Reporting, blocking and enforcement", <><p>Bandhanaa may provide tools to report or block members. We may review reports, account activity and relevant content where reasonably necessary to investigate misuse, protect members, enforce these Terms or comply with law.</p><p>We may warn a member, limit features, remove content, restrict visibility, suspend or terminate an account, or take other proportionate action where we reasonably believe these Terms, our policies or applicable law have been violated, or where action is necessary to protect Bandhanaa or its members.</p></>],
  ["13. Privacy", <p>Our collection and handling of personal information is described in the Bandhanaa Privacy Policy. By using the service, you acknowledge that your profile and interactions involve information being processed and, where the relevant feature requires it, displayed to other members. Please review the Privacy Policy together with these Terms.</p>],
  ["14. Third-party services", <p>Bandhanaa may rely on third-party services for functions such as authentication, hosting, infrastructure or communications and may provide links or sign-in options associated with third parties. Third-party products and services are governed by their own terms and policies. Bandhanaa is not responsible for a third party's independent services, content or practices.</p>],
  ["15. Availability and changes to the service", <p>We may maintain, modify, add, remove or discontinue features as the service develops. We do not promise that Bandhanaa, a particular feature, or access to stored content will always be available without interruption or error. Where practical, we will seek to avoid unnecessary disruption to members.</p>],
  ["16. No guarantee of a match or marriage", <p>Bandhanaa does not guarantee that you will receive a particular number of matches, requests or responses, meet a compatible person, become engaged or marry. Outcomes depend on individual members, their preferences, choices and circumstances. Bandhanaa does not make decisions on behalf of members and is not responsible for a member's decision to accept, decline or discontinue an interaction.</p>],
  ["17. Disclaimers", <p>To the extent permitted by applicable law, Bandhanaa is provided on an “as available” basis. We do not warrant the truth or completeness of every statement made by a member, the conduct of members on or outside the service, or the suitability of any person for a matrimonial alliance. Nothing in these Terms excludes a right or remedy that cannot lawfully be excluded.</p>],
  ["18. Limitation of responsibility", <p>To the extent permitted by applicable law, Bandhanaa is not responsible for indirect, incidental, special or consequential loss arising from interactions between members, reliance on member-supplied information, conduct occurring outside the platform, or events outside our reasonable control. This provision does not limit liability that cannot lawfully be limited.</p>],
  ["19. Suspension and termination", <><p>You may stop using Bandhanaa at any time and may request account deletion through available account controls or support channels. We may suspend or terminate access where reasonably necessary for safety, security, legal compliance, prolonged misuse, fraud, material breach of these Terms or protection of other members.</p><p>Provisions that by their nature should continue after account closure—including provisions concerning content already shared, safety records, intellectual property, disclaimers, liability and dispute-related obligations—may survive termination.</p></>],
  ["20. Changes to these Terms", <p>We may revise these Terms when Bandhanaa's services, safety practices or legal obligations change. The updated Terms will be published on this page with a revised effective date. Where a material change requires additional notice or consent under applicable law, we will provide it.</p>],
  ["21. Governing law", <p>These Terms are governed by the laws of India, subject to any mandatory rights or jurisdiction that applicable law provides to you. Any dispute concerning Bandhanaa should first be raised through our available support or grievance channel so that we have a reasonable opportunity to address it.</p>],
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-white text-[#151515]">
      <PublicLegalHeader />

      <article className="mx-auto max-w-[820px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="border-b border-[#e8e8eb] pb-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">Legal</p>
          <h1 className="mt-3 text-[38px] font-bold tracking-[-0.045em] sm:text-[48px]">Terms of Use</h1>
          <p className="mt-4 max-w-[690px] text-[16px] leading-7 text-[#5f6368]">These Terms set the rules for using Bandhanaa and are intended to keep the platform focused on genuine, respectful and safe matrimonial connections.</p>
          <p className="mt-5 text-[13px] font-medium text-[#6e6e73]">Effective: 8 September 2026</p>
        </div>

        <section className="py-9 text-[15px] leading-7 text-[#404247]">
          <p>These Terms of Use (“Terms”) apply when you access or use the Bandhanaa website, account, profile, discovery, matching, messaging and related services (collectively, “Bandhanaa” or the “Service”).</p>
          <p className="mt-4">By creating an account or using the Service, you agree to these Terms and our <Link href="/privacy" className="font-semibold text-[#171719] underline underline-offset-4">Privacy Policy</Link>. If you do not agree, do not create an account or continue using Bandhanaa.</p>
        </section>

        <div className="space-y-10">
          {sections.map(([title, body]) => (
            <section key={title} className="border-t border-[#ededf0] pt-9">
              <h2 className="text-[22px] font-bold tracking-[-0.025em] text-[#171719]">{title}</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#4c4e53]">{body}</div>
            </section>
          ))}

          <section className="border-t border-[#ededf0] pt-9">
            <h2 className="text-[22px] font-bold tracking-[-0.025em] text-[#171719]">22. Contact, complaints and grievances</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#4c4e53]">
              <p>If you need help with your account, want to report a member or content, or wish to raise a complaint about Bandhanaa, use the support, report or contact option provided on the Service. Please provide enough information for us to understand and investigate the issue.</p>
              <p>Do not include passwords, one-time passwords, banking credentials or other authentication secrets in a complaint or support message.</p>
            </div>
          </section>
        </div>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e8eb] pt-7 text-[12px] leading-6 text-[#777980]">
          <p>© {new Date().getFullYear()} Bandhanaa. Meaningful connections begin here.</p>
          <Link href="/privacy" className="font-medium text-[#4c4e53] hover:text-black">Privacy Policy</Link>
        </footer>
      </article>
    </main>
  );
}
