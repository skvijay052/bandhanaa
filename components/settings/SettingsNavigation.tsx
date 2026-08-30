import Link from "next/link";
import {
  Bell,
  CircleHelp,
  Heart,
  LockKeyhole,
  Pencil,
  Search,
  Settings,
  Shield,
} from "lucide-react";
const groups = [
  {
    title: "Account",
    items: [
      [Pencil, "Edit Profile", "/settings/edit-profile"],
      [Settings, "Account Settings", "/settings"],
      [Shield, "Verification", "/settings/edit-profile"],
    ],
  },
  {
    title: "Preferences",
    items: [
      [Heart, "Partner Preferences", "/settings/edit-profile?section=Partner%20Preferences"],
      [LockKeyhole, "Privacy", "/settings/edit-profile?section=Profile%20Visibility"],
    ],
  },
  {
    title: "Safety & Privacy",
    items: [[Shield, "Settings & Privacy", "/settings/privacy"]],
  },
  {
    title: "Support",
    items: [
      [CircleHelp, "Help Center", "/settings/help"],
      [Bell, "Contact Us", "/settings/contact"],
    ],
  },
] as const;
export function SettingsNavigation({ active = "Settings & Privacy" }: { active?: string }) {
  return (
    <aside className="hidden h-full min-h-0 overflow-y-auto border-r border-[var(--border)] bg-white px-6 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block">
      <h2 className="px-2 text-[24px] font-bold tracking-[-0.02em]">Settings</h2>
      <label className="mt-7 flex h-12 items-center gap-3 rounded-full bg-[#f2f3f5] px-4 text-[var(--text-secondary)]">
        <Search size={19} aria-hidden="true" />
        <input type="search" aria-label="Search settings" placeholder="Search" className="min-w-0 flex-1 bg-transparent text-[15px] font-normal text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]" />
      </label>
      {groups.map((group) => (
        <section key={group.title} className="mt-8">
          <h3 className="mb-2 px-3 text-[13px] font-medium text-[var(--text-secondary)]">
            {group.title}
          </h3>
          <nav className="space-y-1">
            {group.items.map(([Icon, label, href]) => (
              <Link
                key={label}
                href={href}
                className={`flex min-h-[56px] items-center gap-[18px] rounded-xl px-4 text-[16px] text-[#0f1419] transition-colors duration-150 hover:bg-[#f7f9f9] ${label === active ? "bg-[#f2f3f5] font-semibold" : "font-normal"}`}
              >
                <Icon size={23} strokeWidth={label === active ? 2.4 : 1.8} />
                {label}
              </Link>
            ))}
          </nav>
        </section>
      ))}
    </aside>
  );
}
