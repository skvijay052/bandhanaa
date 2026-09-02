"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle({
  variant = "icon",
}: {
  variant?: "icon" | "menu";
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("bandhanaa-theme", next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={
        variant === "menu"
          ? "flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-normal hover:bg-[var(--surface-hover)]"
          : "app-icon-button"
      }
    >
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      {variant === "menu" ? (
        <>
          <span className="flex-1">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 rounded-full transition-colors ${theme === "dark" ? "bg-[#1d9bf0]" : "bg-[#cfd9de]"}`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${theme === "dark" ? "translate-x-[22px]" : "translate-x-0.5"}`}
            />
          </span>
        </>
      ) : null}
    </button>
  );
}
