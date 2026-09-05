"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : null;
}

function dateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
    : "";
}

export function DatePicker({
  label,
  value,
  onChange,
  required = false,
  hideLabel = false,
  min = "1900-01-01",
  max = dateValue(new Date()),
  placeholder = "Select date",
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hideLabel?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => parseDate(value), [value]);
  const minimum = useMemo(() => parseDate(min), [min]);
  const maximum = useMemo(() => parseDate(max), [max]);
  const initial =
    selected ??
    new Date(new Date().getFullYear() - 25, new Date().getMonth(), 1);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!selected) return;
    setViewYear(selected.getFullYear());
    setViewMonth(selected.getMonth());
  }, [selected]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const years = Array.from(
    {
      length:
        (maximum?.getFullYear() ?? new Date().getFullYear()) -
        (minimum?.getFullYear() ?? 1900) +
        1,
    },
    (_, index) => (maximum?.getFullYear() ?? new Date().getFullYear()) - index,
  );
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );

  function moveMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div ref={root} className="relative">
      <label
        id={`${id}-label`}
        className={hideLabel ? "sr-only" : "form-label"}
      >
        {label}
        {required ? <span className="text-pink-500"> *</span> : null}
      </label>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen((current) => !current)}
        className={`form-control flex cursor-pointer items-center text-left ${compact ? "!mt-0 !min-h-11 !px-3 !py-1" : ""}`}
      >
        <span
          id={`${id}-value`}
          className={`min-w-0 flex-1 ${value ? "" : "text-muted"}`}
        >
          {displayDate(value) || placeholder}
        </span>
        <CalendarDays size={18} className="ml-3 shrink-0 text-muted" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={`${label} calendar`}
          className="absolute left-0 top-full z-[80] mt-2 w-[min(320px,calc(100vw-32px))] rounded-2xl border border-line bg-white p-3 shadow-[0_18px_45px_rgba(20,20,30,.16)]"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => moveMonth(-1)}
              className="grid size-9 place-items-center rounded-lg hover:bg-black/5"
            >
              <ChevronLeft size={18} />
            </button>
            <select
              aria-label="Month"
              value={viewMonth}
              onChange={(event) => setViewMonth(Number(event.target.value))}
              className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-white px-2 text-sm outline-none focus:border-black"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={viewYear}
              onChange={(event) => setViewYear(Number(event.target.value))}
              className="h-9 w-[88px] rounded-lg border border-line bg-white px-2 text-sm outline-none focus:border-black"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => moveMonth(1)}
              className="grid size-9 place-items-center rounded-lg hover:bg-black/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold text-muted">
            {weekDays.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const candidate = new Date(viewYear, viewMonth, day);
              const disabled = Boolean(
                (minimum && candidate < minimum) ||
                (maximum && candidate > maximum),
              );
              const active =
                selected?.getFullYear() === viewYear &&
                selected.getMonth() === viewMonth &&
                selected.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => {
                    onChange(dateValue(candidate));
                    setOpen(false);
                  }}
                  className={`grid aspect-square place-items-center rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:text-black/20 ${active ? "bg-black text-white" : "hover:bg-black/5"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg px-2 py-1.5 text-muted hover:bg-black/5"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
              }}
              className="rounded-lg px-2 py-1.5 text-black hover:bg-black/5"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
