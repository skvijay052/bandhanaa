"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const running = useRef(false);

  useEffect(() => {
    const start = () => {
      if (running.current) return;
      running.current = true;
      setVisible(true);
      setProgress(24);
    };
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;
      start();
    };
    const handlePopState = () => start();
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(88, current + Math.max(1, (88 - current) * 0.08)));
    }, 180);
    return () => window.clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!running.current) return;
    setProgress(100);
    const frame = window.requestAnimationFrame(() => {
      running.current = false;
      setVisible(false);
      setProgress(0);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, searchParams]);

  return <div aria-hidden="true" className={`route-progress ${visible ? "route-progress-visible" : ""}`} style={{ transform: `scaleX(${progress / 100})` }} />;
}
