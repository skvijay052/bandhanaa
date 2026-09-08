import type { Metadata } from "next";
import { PublicLegalHeader } from "@/components/public/PublicLegalHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Bandhanaa, including how account, profile, communication and usage information is handled.",
};

const sections = [
  ["1. Information we collect", <><p>We collect information that you provide when you create and use a Bandhanaa account. Depending on the features you use, this may include your name, email address, date and time of birth, gender, religion, mother tongue, marital status, height, weight, location, education, profession, company, annual income, photographs, profile description, lifestyle and family details, horoscope information, partner preferences and profile-visibility choices.</p><p>We also process information created through your use of the service, such as interests or connection requests, shortlists and favourites, profile visits, matches, messages, notifications, privacy settings, reports, blocks, account activity and information needed to maintain your authenticated session.</p></>],
  ["2. How we use your information", <><p>We use personal information to create and maintain your account, build and display your matrimony profile, provide search and discovery, recommend relevant profiles, apply partner preferences, support interests and connections, enable messaging, deliver notifications, maintain privacy and safety features, provide account support and operate the service.</p><p>We may also use information to protect Bandhanaa and its members, investigate reports or suspected misuse, prevent fraud and abuse, troubleshoot technical issues, enforce our terms and comply with applicable legal obligations.</p></>],
  ["3. Profile information and visibility", <><p>Bandhanaa is designed to help members discover and evaluate potential matches. Information you add to your profile may therefore be visible to other Bandhanaa members according to the product's visibility controls and the context in which a feature is provided.</p><p>You should only add information or photographs that you are comfortable sharing for matrimony purposes. The service includes controls for profile visibility and selected profile details. Where available, you can also manage last-seen visibility, online status, read receipts and whether your age is displayed.</p></>],
  ["4. Matching, discovery and interactions", <p>We use profile details and preferences to support discovery, filtering and match recommendations. Your actions—such as viewing a profile, sending or responding to a request, shortlisting a member, accepting a connection or exchanging messages—may be reflected in the relevant member's experience where the feature requires it.</p>],
  ["5. Messages and member communications", <p>Messages and related conversation information are processed so that Bandhanaa can provide in-app communication and associated features such as conversation history and read status. Please use care when sharing phone numbers, addresses, financial information or other sensitive details with another member. Bandhanaa cannot control information that a recipient copies, records or shares outside the service.</p>],
  ["6. Authentication and service providers", <><p>Bandhanaa uses Supabase for authentication and application data services. If you choose a third-party sign-in option such as Google, the authentication provider may send us information necessary to sign you in, such as your account identifier and email address, subject to that provider's settings and policies.</p><p>We may use hosting, infrastructure, email and other technical service providers where necessary to operate Bandhanaa. These providers may process information on our behalf for the services they supply. We do not authorize service providers to use Bandhanaa member information for their own unrelated purposes.</p></>],
  ["7. When information may be disclosed", <><p>We do not sell member profile information as part of operating Bandhanaa. Information may be disclosed to other members as part of the matrimony service, to service providers that help us operate the platform, when you direct or consent to a disclosure, or when disclosure is reasonably necessary to comply with law, legal process, protect rights or safety, investigate abuse or secure the service.</p><p>If the ownership or operation of Bandhanaa changes through a merger, acquisition, restructuring or transfer of business assets, information may be transferred as part of that transaction subject to applicable law and appropriate safeguards.</p></>],
  ["8. Data security", <p>We use reasonable technical and organizational measures intended to protect personal information against unauthorized access, alteration, disclosure and loss. No internet service or storage system can be guaranteed to be completely secure. You are responsible for keeping your password and access to your email account and devices secure and for notifying us if you believe your Bandhanaa account has been compromised.</p>],
  ["9. Data retention", <p>We retain personal information for as long as it is reasonably needed to provide Bandhanaa, maintain account and safety records, resolve disputes, enforce agreements and meet legal obligations. Retention periods can differ depending on the type of information and why it is held. Information may remain for a limited period in backups, security records or records that we are legally required to retain after an account is closed or data is deleted from active systems.</p>],
  ["10. Your privacy choices and rights", <><p>Bandhanaa provides settings that allow you to manage aspects of your profile and privacy. Depending on the feature, you may edit profile information, manage visibility, control selected activity indicators, block or report members, review activity and request a copy of your account data.</p><p>You may also have rights under applicable data-protection law to request access to, correction of or erasure of personal data, to withdraw consent where processing relies on consent, and to raise a grievance. Requests may be subject to identity verification and lawful exceptions.</p></>],
  ["11. Account deletion", <p>If you request deletion of your account through an available account control or by contacting us, we will process the request in accordance with applicable law. Certain information may be retained where necessary for legal compliance, fraud and abuse prevention, dispute resolution, security, or other legitimate record-keeping requirements.</p>],
  ["12. Cookies and similar technologies", <p>Bandhanaa may use cookies, browser storage and similar technologies that are necessary for sign-in, session management, security, preferences and core site functionality. If we introduce optional analytics, advertising or other non-essential technologies that require additional notice or consent, we will provide the appropriate choices where required.</p>],
  ["13. Children's privacy", <p>Bandhanaa is a matrimony service intended for adults who are legally eligible to use such a service. It is not intended for children. If we learn that an account was created by a person who is not legally eligible to use Bandhanaa, we may restrict or remove the account and associated information as appropriate.</p>],
  ["14. International processing", <p>Our technology providers may operate infrastructure in more than one country. Where personal information is processed or transferred across jurisdictions, we take steps intended to ensure that the handling of the information is consistent with applicable data-protection requirements.</p>],
  ["15. Changes to this policy", <p>We may update this Privacy Policy when Bandhanaa's features, practices or legal obligations change. We will publish the revised policy on this page and update the effective date. If a change materially affects how we use personal information, we will provide additional notice when required.</p>],
] as const;

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-dvh bg-white text-[#151515]">
      <PublicLegalHeader />

      <article className="mx-auto max-w-[820px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="border-b border-[#e8e8eb] pb-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">Legal</p>
          <h1 className="mt-3 text-[38px] font-bold tracking-[-0.045em] sm:text-[48px]">Privacy Policy</h1>
          <p className="mt-4 max-w-[680px] text-[16px] leading-7 text-[#5f6368]">Your profile contains information that matters to you. This policy explains what Bandhanaa collects, why we use it, when it may be shared, and the choices available to you.</p>
          <p className="mt-5 text-[13px] font-medium text-[#6e6e73]">Effective: 8 September 2026</p>
        </div>

        <section className="py-9 text-[15px] leading-7 text-[#404247]">
          <p>Bandhanaa is an online matrimony platform that helps people create profiles, discover potential matches and communicate with other members. This Privacy Policy applies to the Bandhanaa website and related services that link to it.</p>
          <p className="mt-4">By using Bandhanaa, you acknowledge the practices described here. Where applicable law requires consent for a particular use of personal data, we will seek that consent separately rather than treating this policy itself as consent.</p>
        </section>

        <div className="space-y-10">
          {sections.map(([title, body]) => (
            <section key={title} className="border-t border-[#ededf0] pt-9">
              <h2 className="text-[22px] font-bold tracking-[-0.025em] text-[#171719]">{title}</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#4c4e53]">{body}</div>
            </section>
          ))}

          <section className="border-t border-[#ededf0] pt-9">
            <h2 className="text-[22px] font-bold tracking-[-0.025em] text-[#171719]">16. Contact and privacy requests</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#4c4e53]">
              <p>If you have a privacy question, believe information associated with your account is inaccurate, or want to exercise a privacy right, please use the support or contact option provided within Bandhanaa. Include enough information for us to identify the account and understand the request, but do not send passwords or other authentication secrets.</p>
              <p>For account-specific requests, we may need to verify that the request comes from the account holder before taking action.</p>
            </div>
          </section>
        </div>

        <footer className="mt-14 border-t border-[#e8e8eb] pt-7 text-[12px] leading-6 text-[#777980]">
          <p>© {new Date().getFullYear()} Bandhanaa. Meaningful connections begin here.</p>
        </footer>
      </article>
    </main>
  );
}
