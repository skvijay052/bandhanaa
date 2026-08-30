import { Bell, Menu } from "lucide-react";

export function MobileMatchesHeader() {
  return (
    <header className="grid h-16 grid-cols-[40px_1fr_40px] items-center px-4 md:hidden">
      <button
        aria-label="Open menu"
        className="grid size-10 place-items-center"
      >
        <Menu size={22} strokeWidth={1.7} />
      </button>
      <h1 className="text-center text-[17px] font-semibold">Matches</h1>
      <button
        aria-label="Notifications, 12 unread"
        className="relative grid size-10 place-items-center"
      >
        <Bell size={21} strokeWidth={1.7} />
        <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#f00079] text-[9px] font-bold text-white">
          12
        </span>
      </button>
    </header>
  );
}
