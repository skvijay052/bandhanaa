import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Brand } from "@/components/auth/Brand";
import { SettingsNavigation } from "./SettingsNavigation";

export function SupportPageShell({
  title,
  description,
  children,
}: {
  title: "Help Center" | "Contact Us" | "Report & Block";
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[var(--app-bg)] max-md:bg-white">
      <div className="app-shell edit-profile-shell !h-full">
        <AppSidebar active="Settings" />
        <div className="grid h-full min-h-0 min-w-0 flex-1 md:grid-cols-[340px_minmax(0,1fr)]">
          <SettingsNavigation active={title} />
          <div className="h-full min-h-0 overflow-y-auto bg-white px-6 pb-10 max-md:px-0">
            <header className="sticky top-0 z-[90] grid h-16 grid-cols-[44px_1fr_44px] items-center bg-white px-4 md:hidden">
              <Link
                href="/settings/privacy"
                aria-label="Back to settings"
                className="grid size-10 place-items-center rounded-[13px] bg-white shadow-[0_7px_22px_rgba(15,20,25,.07)]"
              >
                <ArrowLeft size={19} />
              </Link>
              <div className="flex justify-center">
                <Brand compact />
              </div>
              <Link
                href="/matches?tab=shortlisted"
                aria-label="Shortlisted profiles"
                className="grid size-10 place-items-center rounded-[13px] bg-white shadow-[0_7px_22px_rgba(15,20,25,.07)]"
              >
                <Heart size={18} strokeWidth={1.8} />
              </Link>
            </header>
            <div className="mx-auto w-full max-w-[780px] px-4 py-5 md:px-0 md:py-8">
              <header className="hidden md:block">
                <h1 className="text-[24px] font-bold tracking-[-.02em]">
                  {title}
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[var(--text-secondary)]">
                  {description}
                </p>
              </header>
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
