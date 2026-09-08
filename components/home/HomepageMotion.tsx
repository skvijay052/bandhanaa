"use client";

import { useEffect } from "react";

export function HomepageMotion() {
  useEffect(() => {
    const about = document.getElementById("about");
    const discover = document.getElementById("discover");
    const safety = document.getElementById("safety");
    if (!about || !discover || !safety) return;

    const root = about.closest("body > div") as HTMLElement | null;
    if (!root) return;
    root.classList.add("bandhanaa-home", "home-motion-ready");

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(
        "main > section:not(#about), main > section:not(#about) > div, #discover article, #how article, #discover img, #safety img"
      )
    );

    targets.forEach((element, index) => {
      element.classList.add("home-reveal");
      element.style.setProperty("--home-reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
