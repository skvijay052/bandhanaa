function InfinityRibbon() {
  return (
    <svg
      viewBox="0 0 560 190"
      aria-hidden="true"
      className="h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient id="ribbon" x1="0" x2="1">
          <stop offset="0" stopColor="#ffb1cb" stopOpacity=".2" />
          <stop offset=".35" stopColor="#ff8db8" stopOpacity=".55" />
          <stop offset=".68" stopColor="#d58cff" stopOpacity=".65" />
          <stop offset="1" stopColor="#8e5cf1" stopOpacity=".55" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path
        d="M20 128 C110 40 180 42 270 117 C340 176 390 157 438 111 C493 58 480 15 429 17 C365 20 341 109 292 140 C218 187 143 164 76 111"
        fill="none"
        stroke="url(#ribbon)"
        strokeWidth="24"
        strokeLinecap="round"
        filter="url(#glow)"
        opacity=".35"
      />
      <path
        d="M20 128 C110 40 180 42 270 117 C340 176 390 157 438 111 C493 58 480 15 429 17 C365 20 341 109 292 140 C218 187 143 164 76 111"
        fill="none"
        stroke="url(#ribbon)"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NotificationsHero() {
  return (
    <section className="relative h-[184px] overflow-hidden px-7 pt-[29px] md:px-8">
      <div className="relative z-10">
        <p className="text-[14px] font-medium text-[#ff1682]">Notifications</p>
        <h1 className="mt-2 max-w-[340px] text-[34px] font-bold leading-[1.05] tracking-[-.035em] text-[#0b0c18]">
          Stay updated with
          <br />
          what matters.
        </h1>
        <p className="mt-3 text-[13px] text-[#515870]">
          Real-time updates about your connections and conversations.
        </p>
      </div>
      <div className="absolute right-1 top-0 h-[180px] w-[54%] max-w-[560px] opacity-90">
        <InfinityRibbon />
      </div>
    </section>
  );
}

export function MobileNotificationsHero() {
  return (
    <section className="relative h-[156px] overflow-hidden px-4 pt-[16px]">
      <div className="relative z-10">
        <p className="text-[12px] font-medium text-[#ff1682]">Notifications</p>
        <h1 className="mt-2 text-[23px] font-bold leading-[1.06] tracking-[-.035em]">
          Stay updated with
          <br />
          what matters.
        </h1>
      </div>
      <div className="absolute -right-3 top-[37px] h-[92px] w-[205px]">
        <InfinityRibbon />
      </div>
    </section>
  );
}
