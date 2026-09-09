import { matchTabs, type MatchTab } from "@/data/matches";

export function MatchesTabs({
  active,
  onChange,
}: {
  active: MatchTab;
  onChange: (tab: MatchTab) => void;
}) {
  return (
    <div className="border-b border-[var(--border)] bg-white">
      <div
        role="tablist"
        aria-label="Match categories"
        className="grid h-[56px] grid-cols-4 md:flex md:h-[64px] md:items-center md:gap-6"
      >
        {matchTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative h-full whitespace-nowrap px-1 text-[13px] font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#f34ca4]/40 md:px-1 md:text-[14px] ${
              active === tab.id
                ? "font-semibold text-[#f34ca4] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#f34ca4]"
                : "text-[var(--text-secondary)] hover:text-[#0f1419]"
            }`}
          >
            <span className="md:hidden">{tab.mobileLabel}</span>
            <span className="hidden md:inline">{tab.desktopLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
