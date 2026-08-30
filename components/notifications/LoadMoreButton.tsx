import { ChevronDown } from "lucide-react";
export function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mx-auto flex h-10 items-center gap-3 rounded-lg border border-[#cfd9de] bg-white px-5 text-[13px] font-medium text-[#0f1419] outline-none hover:bg-[#f7f9f9] focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/40"
    >
      Load more <ChevronDown size={14} />
    </button>
  );
}
