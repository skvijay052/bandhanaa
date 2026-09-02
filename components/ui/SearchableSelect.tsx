"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export function SearchableSelect({ label, value, options, onChange, required, placeholder, allowCustom = false, hideLabel = false }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  allowCustom?: boolean;
  hideLabel?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const availableOptions = value && !options.includes(value) ? [value, ...options] : options;
  const filtered = availableOptions.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div ref={root} className="relative">
      <label id={`${id}-label`} className={hideLabel ? "sr-only" : "form-label"}>
        {label}{required ? <span className="text-[#1d9bf0]"> *</span> : null}
      </label>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={`${id}-label ${id}-value`} onClick={() => { setOpen((current) => !current); setQuery(""); }} className="form-control flex items-center text-left">
        <span id={`${id}-value`} className={`min-w-0 flex-1 truncate ${value ? "" : "text-[var(--text-muted)]"}`}>{value || placeholder || `Select ${label.toLowerCase()}`}</span>
        <ChevronDown size={18} className={`ml-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute z-50 mt-2 w-full min-w-[240px] overflow-hidden rounded-xl border border-[var(--border-control)] bg-white shadow-lg">
          <div className="flex h-11 items-center gap-2 border-b border-[var(--border)] px-3">
            <Search size={17} className="text-[var(--text-muted)]" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} placeholder={`Search ${label.toLowerCase()}`} className="min-w-0 flex-1 bg-transparent text-[14px] font-normal outline-none" />
            {query ? <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button> : null}
          </div>
          <div role="listbox" aria-labelledby={`${id}-label`} className="max-h-60 overflow-y-auto p-1.5">
            {allowCustom && query.trim() && !availableOptions.some((option) => option.toLowerCase() === query.trim().toLowerCase()) ? (
              <button type="button" role="option" aria-selected="false" onClick={() => { onChange(query.trim()); setOpen(false); setQuery(""); }} className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-[14px] font-normal text-[#1d9bf0] hover:bg-[#f7f9f9]">
                Use “{query.trim()}”
              </button>
            ) : null}
            {filtered.length ? filtered.map((option) => (
              <button key={option} type="button" role="option" aria-selected={option === value} onClick={() => { onChange(option); setOpen(false); setQuery(""); }} className={`flex min-h-10 w-full items-center rounded-lg px-3 text-left text-[14px] font-normal hover:bg-[#f7f9f9] ${option === value ? "bg-[#eff6ff]" : ""}`}>
                <span className="flex-1">{option}</span>{option === value ? <Check size={17} className="text-[#1d9bf0]" /> : null}
              </button>
            )) : <p className="px-3 py-5 text-center text-[13px] text-[var(--text-muted)]">No options found</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
