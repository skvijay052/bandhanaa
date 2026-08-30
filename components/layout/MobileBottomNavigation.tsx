import Link from "next/link";
import {
  Heart,
  HeartHandshake,
  MessageSquare,
  UserRound,
  Users,
} from "lucide-react";

const items = [
  { label: "Discover", href: "/discover", icon: Users },
  { label: "Matches", href: "/matches", icon: Heart },
  { label: "Requests", href: "/requests", icon: HeartHandshake },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Profile", href: "/my-profile", icon: UserRound },
];

export function MobileBottomNavigation({
  active = "Matches",
  connectionsLast = false,
}: {
  active?:
    | "Discover"
    | "Matches"
    | "Interests"
    | "Requests"
    | "Messages"
    | "Profile"
    | "Connections"
    | null;
  connectionsLast?: boolean;
}) {
  const navigationItems = connectionsLast
    ? [
        ...items.slice(0, 4),
        { label: "Profile", href: "/my-profile", icon: Users },
      ]
    : items;
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 grid h-[calc(72px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-[var(--app-border)] bg-[var(--app-surface)] px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {navigationItems.map(({ label, href, icon: Icon }) => {
        const isActive = label === active;
        return (
          <Link
            prefetch
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
          >
            <Icon
              size={20}
              strokeWidth={1.7}
              fill={isActive ? "currentColor" : "none"}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
