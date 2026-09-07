"use client";

import { useEffect } from "react";

export function MessagesFavouritesEnhancer() {
  useEffect(() => {
    const root = document.querySelector(".messages-mobile-route");
    if (!(root instanceof HTMLElement)) return;

    let attempts = 0;
    let cleanup: (() => void) | undefined;

    const attach = () => {
      const section = root.querySelector("section");
      if (!(section instanceof HTMLElement)) {
        attempts += 1;
        if (attempts < 30) window.setTimeout(attach, 100);
        return;
      }

      const buttons = Array.from(section.querySelectorAll("button"));
      const matchesButton = buttons.find((button) => button.textContent?.trim() === "Matches");
      const requestsButton = buttons.find((button) => button.textContent?.trim() === "Requests");
      if (!(matchesButton instanceof HTMLButtonElement) || !(requestsButton instanceof HTMLButtonElement)) {
        attempts += 1;
        if (attempts < 30) window.setTimeout(attach, 100);
        return;
      }

      matchesButton.textContent = "Favourites";
      matchesButton.dataset.messageFavourites = "true";
      requestsButton.style.display = "none";

      const onClick = (event: Event) => {
        if (event.currentTarget !== matchesButton) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.dispatchEvent(new CustomEvent("bandhanaa:messages-favourites"));
      };
      matchesButton.addEventListener("click", onClick, true);

      cleanup = () => matchesButton.removeEventListener("click", onClick, true);
    };

    attach();
    return () => cleanup?.();
  }, []);

  return null;
}
