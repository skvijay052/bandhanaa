export function NotificationOverviewCard() {
  const rows = [
    ["All Notifications", "24"],
    ["Unread", "08"],
    ["Today", "10"],
    ["This Week", "14"],
  ];
  return (
    <section className="rounded-xl border border-[#eeeef2] bg-white px-4 py-4 shadow-[0_5px_18px_rgba(20,20,40,.025)]">
      <h2 className="text-[12px] font-bold">Notification Overview</h2>
      <dl className="mt-3.5 space-y-3.5">
        {rows.map(([label, value], index) => (
          <div
            key={label}
            className="flex items-center justify-between text-[11px] text-[#30354d]"
          >
            <dt>{label}</dt>
            <dd
              className={
                index === 0
                  ? "rounded-md bg-[#ffe2ef] px-1.5 py-0.5 font-semibold text-[#ff1682]"
                  : "font-medium text-[#171a2e]"
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
