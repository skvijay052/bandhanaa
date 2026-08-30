import { Ban, Clock3, Heart } from "lucide-react";
const tabs = ["All", "Active", "Our Connections", "Pending", "Blocked"];
export function ConnectionTabs({
  active,
  onChange,
  mobile = false,
}: {
  active: string;
  onChange: (x: string) => void;
  mobile?: boolean;
}) {
  return (
    <div
      className={`${mobile ? "h-[52px] overflow-x-auto px-4 [scrollbar-width:none]" : "h-[58px] px-8"} flex items-center gap-3 border-y border-[#f0f0f2]`}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex h-[34px] shrink-0 items-center justify-center gap-2 rounded-full border text-[11px] font-medium ${tab === active ? "w-[96px] border-transparent bg-[#1d9bf0] text-white" : mobile ? "px-4 border-[#ececf1]" : "min-w-[120px] px-5 border-[#ececf1]"}`}
        >
          {index === 1 ? (
            <span className="size-2 rounded-full bg-[#49c98b]" />
          ) : index === 2 ? (
            <Heart size={14} className="text-[#7a46f5]" />
          ) : index === 3 ? (
            <Clock3 size={14} className="text-[#f59e0b]" />
          ) : index === 4 ? (
            <Ban size={14} className="text-[#f04438]" />
          ) : null}
          {tab}
        </button>
      ))}
    </div>
  );
}
