import { HeartHandshake } from "lucide-react";
export function CompleteProfileCTA({ mobile = false }: { mobile?: boolean }) {
  return (
    <section
      className={`flex items-center rounded-xl bg-[linear-gradient(90deg,#e8f5fe,#f5fbff)] ${mobile ? "p-4" : "px-6 py-5"}`}
    >
      {mobile ? null : <HeartHandshake size={42} className="text-[#df1a99]" />}
      <div className={mobile ? "" : "ml-5"}>
        <h2 className={`${mobile ? "text-[11px]" : "text-[16px]"} font-bold`}>
          Complete your profile
        </h2>
        <p className="mt-1 text-[9px] leading-4 text-[#596077]">
          Adding more details helps you
          <br className={mobile ? "" : "hidden"} /> get better matches.
        </p>
      </div>
      <button
        className={`ml-auto rounded-lg ${mobile ? "h-9 border border-[#1d9bf0] bg-white px-4 text-[#1d9bf0]" : "h-11 bg-[#1d9bf0] px-8 text-white hover:bg-[#1689df]"} text-[10px] font-semibold`}
      >
        Complete Now
      </button>
    </section>
  );
}
