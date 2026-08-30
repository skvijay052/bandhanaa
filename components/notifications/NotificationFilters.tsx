import { Check, SlidersHorizontal } from "lucide-react";

const filters = ["All", "Unread", "Today", "This Week", "This Month"] as const;

export function NotificationFilters({
  active,
  onChange,
  onMarkAllRead,
}: {
  active: string;
  onChange: (filter: string) => void;
  onMarkAllRead: () => void;
}) {
  return (
    <div className="flex h-[64px] items-center border-b border-[var(--border)] bg-white px-7 md:px-8">
      <div className="flex h-full items-center gap-6 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`relative h-full whitespace-nowrap px-1 text-[14px] font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/40 ${active === filter ? "font-semibold text-[#1d9bf0] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#1d9bf0]" : "text-[var(--text-secondary)] hover:text-[#0f1419]"}`}
          >
            {filter}
          </button>
        ))}
      </div>
      <button
        onClick={onMarkAllRead}
        className="ml-auto flex shrink-0 items-center gap-2 pl-6 text-[13px] font-medium text-[#1d9bf0] hover:text-[#1689df]"
      >
        <Check size={15} /> Mark all as read
      </button>
    </div>
  );
}

export function MobileNotificationFilters({
  active,
  onChange,
}: {
  active: string;
  onChange: (filter: string) => void;
}) {
  return (
    <div className="flex h-[56px] items-center gap-4 overflow-x-auto border-b border-[var(--border)] bg-white px-4">
      {filters.slice(0, 4).map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`relative h-full shrink-0 whitespace-nowrap px-1 text-[13px] font-normal ${active === filter ? "font-semibold text-[#1d9bf0] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#1d9bf0]" : "text-[var(--text-secondary)]"}`}
        >
          {filter}
        </button>
      ))}
      <button
        aria-label="More filters"
        className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--text-secondary)]"
      >
        <SlidersHorizontal size={14} />
      </button>
    </div>
  );
}
