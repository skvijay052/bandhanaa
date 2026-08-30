export function MessageOverviewCard({
  all,
  unread,
  archived,
}: {
  all: number;
  unread: number;
  archived: number;
}) {
  const rows = [
    ["All Messages", all],
    ["Unread", unread],
    ["Archived", archived],
    ["Blocked", 0],
  ] as const;
  return (
    <section className="rounded-xl border border-[#eeeeF2] bg-white p-4 shadow-[0_5px_18px_rgba(20,20,40,.04)]">
      <h2 className="text-[12px] font-bold">Message Overview</h2>
      <dl className="mt-4 space-y-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between text-[12px]"
          >
            <dt>{label}</dt>
            <dd
              className={
                label === "All Messages"
                  ? "rounded bg-[#ffe8f3] px-1.5 py-0.5 font-semibold text-[#f20b7c]"
                  : "font-semibold"
              }
            >
              {String(value).padStart(2, "0")}
            </dd>
          </div>
        ))}
      </dl>
      <button className="mt-5 h-9 w-full rounded-lg border border-[#ff75b7] text-[12px] font-semibold text-[#f20b7c]">
        View All
      </button>
    </section>
  );
}
