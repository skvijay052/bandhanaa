function Ribbon() {
  return (
    <svg viewBox="0 0 560 190" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id="connections-ribbon">
          <stop stopColor="#ffadc9" stopOpacity=".35" />
          <stop offset=".5" stopColor="#f19ee0" stopOpacity=".5" />
          <stop offset="1" stopColor="#8959ee" stopOpacity=".65" />
        </linearGradient>
        <filter id="connections-glow">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path
        d="M18 129C105 43 180 43 268 116c70 59 120 42 169-5 56-54 45-96-8-94-65 3-88 91-138 123-75 48-149 24-218-29"
        fill="none"
        stroke="url(#connections-ribbon)"
        strokeWidth="25"
        strokeLinecap="round"
        filter="url(#connections-glow)"
        opacity=".35"
      />
      <path
        d="M18 129C105 43 180 43 268 116c70 59 120 42 169-5 56-54 45-96-8-94-65 3-88 91-138 123-75 48-149 24-218-29"
        fill="none"
        stroke="url(#connections-ribbon)"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function ConnectionsHero({ mobile = false }: { mobile?: boolean }) {
  return (
    <section
      className={`relative overflow-hidden ${mobile ? "h-[150px] px-4 pt-5" : "h-[170px] px-8 pt-7"}`}
    >
      <div className="relative z-10">
        <p
          className={`${mobile ? "text-[12px]" : "text-[14px]"} font-medium text-[#ff1682]`}
        >
          Connections
        </p>
        <h1
          className={`${mobile ? "mt-2 text-[23px]" : "mt-2 text-[34px]"} font-bold leading-[1.05] tracking-[-.035em]`}
        >
          Meaningful connections
          <br />
          that matter.
        </h1>
        {mobile ? null : (
          <p className="mt-3 text-[13px] text-[#596077]">
            Manage and nurture your connections in one place.
          </p>
        )}
      </div>
      <div
        className={`absolute ${mobile ? "-right-7 top-10 h-[100px] w-[225px]" : "right-4 top-0 h-[170px] w-[52%] max-w-[550px]"}`}
      >
        <Ribbon />
      </div>
    </section>
  );
}
