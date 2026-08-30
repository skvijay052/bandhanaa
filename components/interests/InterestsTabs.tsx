import type { InterestTab } from "@/data/interests";

const tabs: Array<{ id: InterestTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "sent", label: "Sent" },
  { id: "received", label: "Received" },
  { id: "responded", label: "Responded" },
];

export function InterestsTabs({
  active,
  onChange,
}: {
  active: InterestTab;
  onChange: (tab: InterestTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Interest categories"
      className="flex gap-2.5 max-md:grid max-md:grid-cols-4 max-md:gap-2"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`h-[34px] min-w-[100px] rounded-full border px-4 text-xs font-semibold transition max-md:min-w-0 max-md:px-2 ${active === tab.id ? "border-transparent bg-[#1d9bf0] text-white" : "border-[#ececf1] bg-white text-[#26283f] hover:border-[#1d9bf0]"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
