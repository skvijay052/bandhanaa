import { Crown } from "lucide-react";

export function MessagesPremiumCard() {
  return (
    <section className="mt-5 rounded-xl border border-[#eeeeF2] bg-white p-4 text-center shadow-[0_5px_18px_rgba(20,20,40,.04)]">
      <Crown className="mx-auto text-[#ffb400]" size={34} strokeWidth={1.8} />
      <h2 className="mt-3 text-[13px] font-bold">Upgrade to Premium</h2>
      <p className="mt-2 text-[11px] leading-5 text-[#555a70]">
        See who liked you, read
        <br />
        messages &amp; more.
      </p>
      <button className="mt-4 h-9 w-full rounded-lg bg-[#1d9bf0] text-[12px] font-semibold text-white hover:bg-[#1689df]">
        Upgrade Now
      </button>
    </section>
  );
}
