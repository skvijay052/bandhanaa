export function ConnectionOverviewCard({
  total,
  active,
  pending,
  blocked,
}: {
  total: number;
  active: number;
  pending: number;
  blocked: number;
}) {
  const rows = [
    ["Total Connections", String(total).padStart(2, "0")],
    ["Active Connections", String(active).padStart(2, "0")],
    ["Our Connections", String(pending).padStart(2, "0")],
    ["Blocked", String(blocked).padStart(2, "0")],
  ];
  return (
    <section className="rounded-xl border border-[#eeeef2] bg-white p-4 shadow-[0_2px_10px_rgba(16,24,40,.03)]">
      <h2 className="text-[12px] font-bold">Connection Overview</h2>
      <dl className="mt-4 space-y-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between text-[11px] text-[#3c435b]"
          >
            <dt>{label}</dt>
            <dd className="font-medium text-[#161a2d]">{value}</dd>
          </div>
        ))}
      </dl>
      <button className="mt-5 h-9 w-full rounded-lg border border-[#ff9bc8] text-[11px] font-semibold text-[#ff1682]">
        View All Connections
      </button>
    </section>
  );
}
