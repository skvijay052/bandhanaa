import { matchTabs, type MatchTab } from "@/data/matches";

export function MatchesTabs({
  active,
  onChange,
}: {
  active: MatchTab;
  onChange: (tab: MatchTab) => void;
}) {
  return (
    <div className="border-b border-[#eeeef2]">
      <div
        role="tablist"
        aria-label="Match categories"
        className="grid h-[52px] grid-cols-4 md:flex md:h-[58px] md:items-end md:gap-14"
      >
        {matchTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative h-full px-1 text-xs font-semibold outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition md:h-[46px] md:px-4 md:text-[14px] ${active === tab.id ? "text-[#0f1419] after:bg-[#1d9bf0]" : "text-[var(--text-secondary)] after:bg-transparent hover:text-[#1d9bf0]"}`}
          >
            <span className="md:hidden">{tab.mobileLabel}</span>
            <span className="hidden md:inline">{tab.desktopLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
