import { Crown } from "lucide-react";

export function ProfileStrengthCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <section
      className={`rounded-xl border border-[#ececf0] bg-white p-[18px] shadow-[0_2px_8px_rgba(15,15,30,.03),0_10px_30px_rgba(15,15,30,.025)] ${mobile ? "flex items-center gap-5" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-bold">Profile Strength</h3>
        <p className="mt-3 text-xs text-[#626273]">45% Complete</p>
        <div className="mt-3 h-2 rounded-full bg-[#e4e5eb]">
          <div className="h-full w-[45%] rounded-full bg-[#f32988]" />
        </div>
        <p className="mt-4 text-[11px] leading-5 text-[#626273]">
          Complete your profile to get 3x more matches!
        </p>
        <button className="mt-4 h-10 w-full rounded-lg border border-[#ff78b8] text-xs font-semibold text-[#f32988] transition hover:bg-[#fff3f8]">
          Complete Profile
        </button>
      </div>
      {mobile && (
        <div className="grid size-[78px] shrink-0 place-items-center rounded-full bg-[conic-gradient(#f32988_0_30%,#9b40cb_30%_45%,#f4d6e9_45%)]">
          <div className="grid size-[63px] place-items-center rounded-full bg-white text-lg font-bold">
            45%
          </div>
        </div>
      )}
    </section>
  );
}

export function PremiumCard() {
  return (
    <section className="rounded-xl border border-[#ececf0] bg-white p-[18px] text-center shadow-[0_2px_8px_rgba(15,15,30,.03),0_10px_30px_rgba(15,15,30,.025)] max-md:grid max-md:grid-cols-[auto_1fr] max-md:text-left">
      <Crown
        className="mx-auto text-[#f9b400] max-md:mx-0 max-md:row-span-2"
        size={30}
        strokeWidth={2}
      />
      <h3 className="mt-2 text-[13px] font-bold max-md:mt-0 max-md:ml-3">
        Upgrade to Premium
      </h3>
      <p className="mt-2 text-[11px] leading-5 text-[#626273] max-md:ml-3 max-md:mt-1">
        Unlock advanced filters, see who liked you &amp; more.
      </p>
      <button className="mt-4 h-10 w-full rounded-lg bg-[#1d9bf0] text-xs font-semibold text-white transition hover:bg-[#1689df] max-md:col-span-2">
        Upgrade Now
      </button>
    </section>
  );
}
