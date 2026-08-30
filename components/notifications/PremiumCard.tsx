import { Crown } from "lucide-react";

export function PremiumCard() {
  return (
    <section className="mt-5 rounded-xl border border-[#f0f0f3] bg-white px-4 py-5 text-center shadow-[0_5px_18px_rgba(20,20,40,.025)]">
      <Crown className="mx-auto text-[#ffb000]" size={30} strokeWidth={2} />
      <h2 className="mt-3 text-[12px] font-bold">Upgrade to Premium</h2>
      <p className="mt-2 text-[11px] leading-[1.55] text-[#596077]">
        See who viewed you, read
        <br />
        messages &amp; more.
      </p>
      <button className="mt-5 h-9 w-full rounded-lg bg-[#1d9bf0] text-[11px] font-semibold text-white outline-none hover:bg-[#1689df] focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/40">
        Upgrade Now
      </button>
    </section>
  );
}
