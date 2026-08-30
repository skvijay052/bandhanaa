import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { SupportPageShell } from "@/components/settings/SupportPageShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Help Center" };
const faqs = [
  ["How do I edit my profile?", "Open your profile and select Edit Profile. Save each section after updating your information."],
  ["How do follow requests work?", "Follow sends a request. Pending requests appear under Requests, and accepted requests appear under Following."],
  ["How do I shortlist a profile?", "Select the heart icon on a Discover or Matches profile. Shortlisting is private and does not send a follow request."],
  ["How do I update my profile photo?", "Open My Profile and select your profile image, or use the photo menu to set an uploaded photo as your profile picture."],
  ["How do I control profile visibility?", "Open Settings, choose Privacy, and update who can view your profile and activity."],
] as const;

export default async function HelpCenterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/help");
  return <SupportPageShell title="Help Center" description="Find answers about profiles, requests, privacy and account features."><label className="mt-8 flex h-12 items-center gap-3 rounded-full bg-[#f2f3f5] px-4 text-[var(--text-secondary)]"><Search size={18} /><input type="search" placeholder="Search help" aria-label="Search help" className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text-primary)] outline-none" /></label><section className="mt-8"><h2 className="text-[17px] font-semibold">Frequently asked questions</h2><div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">{faqs.map(([question, answer]) => <details key={question} className="group py-1"><summary className="flex min-h-[62px] cursor-pointer list-none items-center text-[15px] font-normal [&::-webkit-details-marker]:hidden">{question}<span className="ml-auto text-xl text-[var(--text-secondary)] group-open:rotate-45">+</span></summary><p className="pb-5 pr-8 text-[14px] leading-6 text-[var(--text-secondary)]">{answer}</p></details>)}</div></section></SupportPageShell>;
}
