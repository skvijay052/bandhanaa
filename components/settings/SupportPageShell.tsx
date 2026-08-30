import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { SettingsNavigation } from "./SettingsNavigation";

export function SupportPageShell({ title, description, children }: { title: "Help Center" | "Contact Us"; description: string; children: React.ReactNode }) {
  return <main className="fixed inset-0 overflow-hidden bg-[var(--app-bg)]"><div className="app-shell edit-profile-shell !h-full"><AppSidebar active="Settings" /><div className="grid h-full min-h-0 min-w-0 flex-1 md:grid-cols-[340px_minmax(0,1fr)]"><SettingsNavigation active={title} /><div className="h-full min-h-0 overflow-y-auto px-6 pb-10 max-md:px-4"><div className="mx-auto w-full max-w-[780px] py-6 md:py-8"><header className="flex items-center md:hidden"><Link href="/settings/privacy" aria-label="Back to settings"><ArrowLeft size={20} /></Link><h1 className="mx-auto pr-5 text-[15px] font-bold">{title}</h1></header><header className="hidden md:block"><h1 className="text-[24px] font-bold tracking-[-.02em]">{title}</h1><p className="mt-1 text-[13px] font-normal text-[var(--text-secondary)]">{description}</p></header>{children}</div></div></div></div></main>;
}
