import type { ReactNode } from "react";
import { MobileProfileStickyEnhancer } from "@/components/profile/MobileProfileStickyEnhancer";

export default function ProfileDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-profile-sticky-scope contents">
      <MobileProfileStickyEnhancer />
      {children}
    </div>
  );
}
