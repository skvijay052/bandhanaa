"use client";

import { useEffect } from "react";

export function MobileProfileStickyEnhancer() {
  useEffect(() => {
    const root = document.querySelector(".mobile-profile-sticky-scope");
    if (!(root instanceof HTMLElement)) return;

    const scrollContainer = root.querySelector(".app-workspace");
    const tabNav = root.querySelector("nav.sticky");
    const bottomActions = root.querySelector("div.fixed.z-\\[110\\]");
    if (
      !(scrollContainer instanceof HTMLElement) ||
      !(tabNav instanceof HTMLElement) ||
      !(bottomActions instanceof HTMLElement)
    ) return;

    const update = () => {
      const navTop = tabNav.getBoundingClientRect().top;
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const isTabStuck = navTop <= containerTop + 1;
      tabNav.classList.toggle("mobile-profile-tabs-stuck", isTabStuck);

      const showBottomActions = scrollContainer.scrollTop > 260;
      bottomActions.classList.toggle("mobile-profile-actions-visible", showBottomActions);
    };

    tabNav.classList.add("mobile-profile-tabs-enhanced");
    bottomActions.classList.add("mobile-profile-actions-enhanced");
    update();

    scrollContainer.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scrollContainer.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      tabNav.classList.remove("mobile-profile-tabs-enhanced", "mobile-profile-tabs-stuck");
      bottomActions.classList.remove("mobile-profile-actions-enhanced", "mobile-profile-actions-visible");
    };
  }, []);

  return null;
}
