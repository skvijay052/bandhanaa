import {
  Baby,
  BedDouble,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Cigarette,
  Dumbbell,
  GraduationCap,
  Heart,
  Home,
  Languages,
  MapPin,
  Martini,
  PawPrint,
  Pencil,
  Ruler,
  Salad,
  Sparkles,
  SunMedium,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { DetailItem } from "@/data/my-profile";

function iconForLabel(label: string, title: string): LucideIcon {
  const value = label.toLowerCase();
  if (value.includes("diet") || value.includes("food")) return Salad;
  if (value.includes("smoke")) return Cigarette;
  if (value.includes("drink")) return Martini;
  if (value.includes("exercise") || value.includes("fitness")) return Dumbbell;
  if (value.includes("sleep")) return BedDouble;
  if (value.includes("pet")) return PawPrint;
  if (value.includes("father") || value.includes("mother") || value.includes("parent")) return UsersRound;
  if (value.includes("sibling") || value.includes("brother") || value.includes("sister")) return Baby;
  if (value.includes("family type") || value.includes("family background")) return Home;
  if (value.includes("location") || value.includes("place")) return MapPin;
  if (value.includes("age") || value.includes("date")) return CalendarDays;
  if (value.includes("height")) return Ruler;
  if (value.includes("education") || value.includes("degree")) return GraduationCap;
  if (value.includes("profession") || value.includes("occupation") || value.includes("income")) return BriefcaseBusiness;
  if (value.includes("language") || value.includes("tongue")) return Languages;
  if (value.includes("religion") || value.includes("spiritual")) return SunMedium;
  if (value.includes("value") || value.includes("looking") || value.includes("marital")) return Heart;
  if (value.includes("book") || value.includes("study")) return BookOpen;
  if (title === "Family") return UsersRound;
  if (title.includes("Looking")) return Heart;
  return Sparkles;
}
export function DetailCard({
  title,
  items,
  columns = 3,
}: {
  title: string;
  items: DetailItem[];
  columns?: 3 | 4;
}) {
  return (
    <section className="rounded-2xl border border-[#e6edf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,20,25,.035)]">
      <div className="flex justify-between">
        <h2 className="text-[18px] font-bold">{title}</h2>
        <Link href={`/settings/edit-profile?section=${encodeURIComponent(title)}`} className="flex h-9 items-center gap-1 rounded-lg border border-[#1d9bf0] px-4 text-[13px] font-semibold text-[#1d9bf0] hover:bg-[#e8f5fe]">
          <Pencil size={10} />
          Edit
        </Link>
      </div>
      {items.length ? <div
        className={`mt-5 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {items.map((item) => {
          const Icon = iconForLabel(item.label, title);
          return <div key={item.label} className="flex gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e8f5fe] text-[#1d9bf0]">
              <Icon size={14} />
            </span>
            <div>
              <p className="text-[13px] text-[#71768a]">{item.label}</p>
              <p className="mt-1 text-[14px] font-semibold">{item.value}</p>
            </div>
          </div>;
        })}
      </div> : <p className="mt-5 rounded-xl bg-[#f7f9f9] px-4 py-6 text-center text-[14px] font-normal text-[var(--text-secondary)]">No {title.toLowerCase()} details added yet.</p>}
    </section>
  );
}
