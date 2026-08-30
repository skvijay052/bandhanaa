import { Check, Eye } from "lucide-react";
export function ProfileProgress({
  value,
  photoCount,
}: {
  value: number;
  photoCount: number;
}) {
  const steps = [
    "Basic Details",
    `Photos (${Math.min(photoCount, 6)}/6)`,
    "Lifestyle",
    "Partner Preferences",
    "Verification",
  ];
  return (
    <section className="rounded-2xl border border-[#e6edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,20,25,.035)]">
      <div className="flex justify-between text-[14px] font-bold">
        <h2>Profile Progress</h2>
        <span>{value}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8e9ef]">
        <div
          className="h-full rounded-full bg-[#1d9bf0]"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-5 grid grid-cols-5">
        {steps.map((step, i) => (
          <div
            key={step}
            className="flex items-center justify-center gap-2 border-r border-[#eeeef2] last:border-0"
          >
            <span
              className={`grid size-7 place-items-center rounded-full ${i < 4 ? "bg-[#e5f8ed] text-[#26a566]" : "bg-[#fff4de] text-[#f4a000]"}`}
            >
              {i < 4 ? <Check size={14} /> : <Eye size={14} />}
            </span>
            <span className="text-[12px] font-medium max-md:hidden">{step}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
