import { ArrowRight } from "lucide-react";
export function ConnectionSectionHeader({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: "active" | "pending";
}) {
  return (
    <div className="mb-3 flex items-start">
      <div>
        <h2 className="flex items-center gap-2 text-[17px] font-bold">
          {title}
          <span
            className={`size-2.5 rounded-full ${status === "active" ? "bg-[#49c98b]" : "bg-[#f59e0b]"}`}
          />
        </h2>
        <p className="mt-1 text-[11px] text-[#596077]">{description}</p>
      </div>
      <button className="ml-auto mt-2 flex items-center gap-1 text-[11px] font-medium text-[#ff1682]">
        View all <ArrowRight size={13} />
      </button>
    </div>
  );
}
