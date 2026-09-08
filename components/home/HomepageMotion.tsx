"use client";

import { useEffect } from "react";

export function HomepageMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".bandhanaa-home");
    if (!root) return;

    root.classList.add("home-motion-ready");

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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
