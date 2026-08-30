import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ContactSupportForm } from "@/components/settings/ContactSupportForm";
import { SupportPageShell } from "@/components/settings/SupportPageShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contact Us" };
export default async function ContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/contact");
  return <SupportPageShell title="Contact Us" description="Tell the Bandhanaa support team how we can help."><ContactSupportForm email={user.email ?? ""} /></SupportPageShell>;
}
