import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
export function DiscoveryFilters({
  cities,
  city,
  onCity,
  age,
  onAge,
}: {
  cities: string[];
  city: string;
  onCity: (value: string) => void;
  age: string;
  onAge: (value: string) => void;
}) {
  return (
    <section className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ebe8ee] bg-white p-3 shadow-[0_5px_22px_rgba(25,20,35,.04)] max-md:overflow-x-auto max-md:border-0 max-md:p-0 max-md:shadow-none [scrollbar-width:none]">
      <select
        aria-label="Preferred age"
        value={age}
        onChange={(e) => onAge(e.target.value)}
        className="h-10 shrink-0 appearance-none rounded-full border border-[#ebe8ee] bg-white px-4 pr-8 text-[11px] font-semibold outline-none"
      >
        <option>22 - 32</option>
        <option>18 - 25</option>
        <option>26 - 35</option>
        <option>36 - 45</option>
      </select>
      {["Religion", "Education", "Occupation"].map((label) => (
        <button
          key={label}
          className={`flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#ebe8ee] px-4 text-[11px] font-semibold ${label !== "Religion" ? "max-md:hidden" : ""}`}
        >
          {label}
          <ChevronDown size={13} />
        </button>
      ))}
      <label className="relative shrink-0">
        <span className="sr-only">Location</span>
        <select
          value={city}
          onChange={(e) => onCity(e.target.value)}
          className="h-10 appearance-none rounded-full border border-[#ebe8ee] bg-white px-4 pr-9 text-[11px] font-semibold outline-none"
        >
          <option value="All locations">Location</option>
          {cities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-3 top-3.5"
        />
      </label>
      <button
        aria-label="More filters"
        className="grid size-10 shrink-0 place-items-center rounded-full border border-[#ebe8ee] md:hidden"
      >
        <SlidersHorizontal size={16} />
      </button>
      <button
        onClick={() => {
          onCity("All locations");
          onAge("22 - 32");
        }}
        className="ml-auto flex shrink-0 items-center gap-2 px-2 text-[11px] text-[#747184] max-md:hidden"
      >
        Reset
        <RotateCcw size={14} />
      </button>
    </section>
  );
}
