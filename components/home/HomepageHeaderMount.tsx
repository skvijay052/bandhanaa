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
    return () => {
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
      `}</style>
      <HomeHeader />
    </>
  );
}
