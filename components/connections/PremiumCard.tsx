import { Crown } from "lucide-react";
export function PremiumCard() {
  return (
    <section className="mt-5 rounded-xl border border-[#eeeef2] bg-white p-5 text-center shadow-[0_2px_10px_rgba(16,24,40,.03)]">
      <Crown size={29} strokeWidth={2} className="mx-auto text-[#ffb000]" />
      <h2 className="mt-3 text-[12px] font-bold">Upgrade to Premium</h2>
      <p className="mt-3 text-[11px] leading-[1.55] text-[#596077]">
        See who viewed you, unlock
        <br />
        advanced filters &amp; more.
      </p>
      <button className="mt-5 h-9 w-full rounded-lg bg-[#1d9bf0] text-[11px] font-semibold text-white hover:bg-[#1689df]">
        Upgrade Now
      </button>
    </section>
  );
}
