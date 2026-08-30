import { Crown } from "lucide-react";

export function PremiumCard() {
  return (
    <section className="rounded-xl border border-[#ececf2] bg-white px-3.5 py-[18px] text-center shadow-[0_8px_24px_rgba(15,20,40,.035)]">
      <Crown size={34} strokeWidth={1.8} className="mx-auto text-[#ff9d00]" />
      <h2 className="mt-3 text-[13px] font-bold text-[#11121d]">
        Upgrade to Premium
      </h2>
      <p className="mt-2 text-[11px] leading-[1.7] text-[#555a73]">
        Unlock advanced features
        <br /> and connect without limits.
      </p>
      <button className="mt-4 h-9 w-full rounded-lg bg-[#1d9bf0] text-xs font-semibold text-white transition hover:bg-[#1689df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/40">
        Upgrade Now
      </button>
    </section>
  );
}
