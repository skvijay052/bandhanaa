"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { HomeHeader } from "./HomeHeader";

export function HomepageHeaderMount() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (!isHomepage) return;

    document.body.dataset.homeHeaderMounted = "true";

    const main = document.getElementById("main-content");
    if (!main) {
      return () => {
        delete document.body.dataset.homeHeaderMounted;
      };
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const sections = Array.from(main.querySelectorAll<HTMLElement>("section"));

    sections.forEach((section, index) => {
      section.dataset.homeReveal = "true";
      if (index === 0 || reducedMotion) {
        section.dataset.homeVisible = "true";
      }
    });

    let observer: IntersectionObserver | null = null;

    if (!reducedMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            (entry.target as HTMLElement).dataset.homeVisible = "true";
            observer?.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px",
        },
      );

      sections.slice(1).forEach((section) => observer?.observe(section));
    }

    return () => {
      observer?.disconnect();
      sections.forEach((section) => {
        delete section.dataset.homeReveal;
        delete section.dataset.homeVisible;
      });
      delete document.body.dataset.homeHeaderMounted;
    };
  }, [isHomepage]);

  if (!isHomepage) return null;

  return (
    <>
      <style jsx global>{`
        body[data-home-header-mounted="true"] div:has(> #main-content) > header {
          display: none !important;
        }

        /* Apple-inspired homepage type system. Uses the native Apple system font
           where available and production-safe system fallbacks elsewhere. */
        body[data-home-header-mounted="true"] div:has(> #main-content) {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
            "SF Pro Display", "Helvetica Neue", Arial, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        body[data-home-header-mounted="true"] #main-content h1,
        body[data-home-header-mounted="true"] #main-content h2,
        body[data-home-header-mounted="true"] #main-content h3,
        body[data-home-header-mounted="true"] #main-content p,
        body[data-home-header-mounted="true"] #main-content a,
        body[data-home-header-mounted="true"] #main-content li,
        body[data-home-header-mounted="true"] footer {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
            "SF Pro Display", "Helvetica Neue", Arial, sans-serif !important;
        }

        body[data-home-header-mounted="true"] #hero-title {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "Helvetica Neue", Arial, sans-serif !important;
          font-size: clamp(60px, 5vw, 82px) !important;
          line-height: 0.96 !important;
          letter-spacing: -0.055em !important;
          font-weight: 600 !important;
        }

        body[data-home-header-mounted="true"] #hero-title em {
          font-family: inherit !important;
          font-weight: 600 !important;
          letter-spacing: inherit !important;
        }

        body[data-home-header-mounted="true"] #main-content h2 {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "Helvetica Neue", Arial, sans-serif !important;
          font-size: clamp(42px, 3.65vw, 58px) !important;
          line-height: 1.02 !important;
          letter-spacing: -0.045em !important;
          font-weight: 600 !important;
        }

        body[data-home-header-mounted="true"] #main-content h2 em {
          font-family: inherit !important;
          font-weight: 600 !important;
        }

        body[data-home-header-mounted="true"] #main-content .body {
          font-size: clamp(16px, 1.12vw, 18px) !important;
          line-height: 1.5 !important;
          letter-spacing: -0.012em !important;
        }

        body[data-home-header-mounted="true"] #main-content .eyebrow {
          font-size: 12px !important;
          line-height: 1.35 !important;
          letter-spacing: 0.16em !important;
          font-weight: 600 !important;
        }

        body[data-home-header-mounted="true"] #main-content h3 {
          letter-spacing: -0.018em !important;
          font-weight: 600 !important;
        }

        /* Lightweight Apple-style reveal: no animation framework and no layout shift. */
        body[data-home-header-mounted="true"]
          #main-content
          section[data-home-reveal="true"] {
          opacity: 0;
          transform: translate3d(0, 28px, 0) scale(0.992);
          transition:
            opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 820ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }

        body[data-home-header-mounted="true"]
          #main-content
          section[data-home-visible="true"] {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }

        body[data-home-header-mounted="true"] #main-content section img {
          transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        body[data-home-header-mounted="true"]
          #main-content
          section[data-home-visible="true"]
          img {
          transform: translateZ(0);
        }

        body[data-home-header-mounted="true"] #main-content a,
        body[data-home-header-mounted="true"] #main-content button {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background-color 180ms ease;
        }

        @media (hover: hover) and (pointer: fine) {
          body[data-home-header-mounted="true"] #main-content a:hover,
          body[data-home-header-mounted="true"] #main-content button:hover {
            transform: translateY(-1px);
          }
        }

        @media (max-width: 899px) {
          body[data-home-header-mounted="true"] #hero-title {
            font-size: clamp(46px, 12vw, 62px) !important;
            line-height: 0.98 !important;
          }

          body[data-home-header-mounted="true"] #main-content h2 {
            font-size: clamp(36px, 9vw, 48px) !important;
            line-height: 1.04 !important;
          }

          body[data-home-header-mounted="true"] #main-content .body {
            font-size: 16px !important;
            line-height: 1.5 !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          body[data-home-header-mounted="true"]
            #main-content
            section[data-home-reveal="true"] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }

          body[data-home-header-mounted="true"] #main-content *,
          body[data-home-header-mounted="true"] #main-content *::before,
          body[data-home-header-mounted="true"] #main-content *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      <HomeHeader />
    </>
  );
}
