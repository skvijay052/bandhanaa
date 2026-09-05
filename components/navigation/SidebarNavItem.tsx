import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  badge = 0,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
  active?: boolean;
}) {
  return (
    <Link
      prefetch
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={badge > 0 ? `${label}, ${badge} unread` : label}
      title={label}
      className={`group flex h-[56px] w-full items-center gap-[18px] rounded-xl px-[14px] text-[#0f1419] outline-none transition-colors duration-150 ease-in-out hover:bg-[#f7f9f9] focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)] ${active ? "bg-[#f2f2f2] font-bold" : "font-normal"}`}
    >
      <span className="relative grid size-[26px] shrink-0 place-items-center">
        <Icon
          className={label === "Shortlist" && active ? "text-black" : undefined}
          size={26}
          strokeWidth={active ? 2 : 1.8}
          fill={active ? "currentColor" : "none"}
          aria-hidden="true"
        />
        {badge > 0 ? (
          <span className="sidebar-notification-badge absolute -right-[7px] -top-[7px] grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-bold leading-none text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="text-[16px] leading-5 max-xl:hidden">{label}</span>
    </Link>
  );
}
