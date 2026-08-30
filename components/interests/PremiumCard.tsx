import { Crown } from "lucide-react";

export function InterestsPremiumCard() {
  return (
    <section className="mt-5 rounded-xl border border-[#eeeef2] bg-white px-3.5 py-[18px] text-center shadow-[0_8px_24px_rgba(15,20,40,.03)]">
      <Crown size={33} strokeWidth={1.8} className="mx-auto text-[#ffad00]" />
      <h2 className="mt-3 text-[13px] font-bold">Upgrade to Premium</h2>
      <p className="mt-2 text-[11px] leading-[1.65] text-[#565b73]">
        See who liked you, read messages
        <br /> &amp; more.
      </p>
      <button className="mt-4 h-9 w-full rounded-lg bg-[#1d9bf0] text-xs font-semibold text-white transition hover:bg-[#1689df]">
        Upgrade Now
      </button>
    </section>
  );
}
