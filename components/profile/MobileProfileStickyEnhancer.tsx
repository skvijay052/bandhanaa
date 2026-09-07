"use client";

import { useEffect } from "react";

export function MobileProfileStickyEnhancer() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let attempts = 0;

    const attach = () => {
      const root = document.querySelector(".mobile-profile-sticky-scope");
      const scrollContainer = root?.querySelector(".app-workspace");
      const tabNav = root?.querySelector("nav.sticky");
      const bottomActions = root?.querySelector("div.fixed.z-\\[110\\]");

      if (
        !(scrollContainer instanceof HTMLElement) ||
        !(tabNav instanceof HTMLElement) ||
        !(bottomActions instanceof HTMLElement)
      ) {
        attempts += 1;
        if (attempts < 30) window.setTimeout(attach, 100);
        return;
      }

      const update = () => {
        const navTop = tabNav.getBoundingClientRect().top;
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const isTabStuck = navTop <= containerTop + 1;
        tabNav.classList.toggle("mobile-profile-tabs-stuck", isTabStuck);

        const showBottomActions = scrollContainer.scrollTop > 260;
        bottomActions.classList.toggle(
          "mobile-profile-actions-visible",
          showBottomActions,
        );
      };

      tabNav.classList.add("mobile-profile-tabs-enhanced");
      bottomActions.classList.add("mobile-profile-actions-enhanced");
      update();

      scrollContainer.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);

      cleanup = () => {
        scrollContainer.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        tabNav.classList.remove(
          "mobile-profile-tabs-enhanced",
          "mobile-profile-tabs-stuck",
        );
        bottomActions.classList.remove(
          "mobile-profile-actions-enhanced",
          "mobile-profile-actions-visible",
        );
      };
    };

    const timer = window.setTimeout(attach, 0);
    return () => {
      window.clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  return null;
}
