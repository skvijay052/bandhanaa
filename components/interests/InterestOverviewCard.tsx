import { CheckCircle2, Heart, Send } from "lucide-react";

export function InterestOverviewCard({
  sent,
  received,
  responded,
}: {
  sent: number;
  received: number;
  responded: number;
}) {
  const rows = [
    {
      label: "Sent",
      value: String(sent).padStart(2, "0"),
      icon: Send,
      color: "bg-pink-50 text-[#ff1682]",
    },
    {
      label: "Received",
      value: String(received).padStart(2, "0"),
      icon: Heart,
      color: "bg-violet-50 text-[#8055df]",
    },
    {
      label: "Responded",
      value: String(responded).padStart(2, "0"),
      icon: CheckCircle2,
      color: "bg-emerald-50 text-[#39a774]",
    },
  ];
  return (
    <section className="rounded-xl border border-[#ececf1] bg-white p-4 shadow-[0_8px_24px_rgba(15,20,40,.03)]">
      <h2 className="text-[12px] font-bold">Interest Overview</h2>
      <div className="mt-2">
        {rows.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex h-11 items-center gap-3 text-[11px]">
            <span
              className={`grid size-8 place-items-center rounded-full ${color}`}
            >
              <Icon
                size={15}
                strokeWidth={1.8}
                fill={label === "Received" ? "currentColor" : "none"}
              />
            </span>
            <span>{label}</span>
            <span className="ml-auto font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <button className="mt-2 h-9 w-full rounded-lg border border-[#ff8abb] text-xs font-semibold text-[#ff1682] transition hover:bg-[#fff5f9]">
        View All Activity
      </button>
    </section>
  );
}
