import type { ReactNode } from "react";

export default function RequestsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="requests-mobile-route">
      <style>{`
        @media (max-width: 767px) {
          .requests-mobile-route,
          .requests-mobile-route main {
            background: #fff !important;
          }

          .requests-mobile-route main > div.pointer-events-none {
            display: none !important;
          }

          .requests-mobile-route main > header {
            position: sticky;
            top: 0;
            z-index: 90;
            min-height: 60px;
            margin: 0 -16px;
            padding: 12px 16px !important;
            background: #fff !important;
            border-bottom: 1px solid rgba(0,0,0,.05);
          }

          .requests-mobile-route main > header a[href="/matches?tab=shortlisted"] {
            width: 36px !important;
            height: 36px !important;
            border-radius: 13px !important;
            background: #fff !important;
            box-shadow: 0 8px 24px rgba(44,33,80,.10) !important;
          }

          .requests-mobile-route main > [role="tablist"] {
            display: flex !important;
            width: calc(100% + 32px) !important;
            height: auto !important;
            margin: 0 -16px !important;
            padding: 14px 16px !important;
            gap: 10px !important;
            overflow-x: auto !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: #fff !important;
            box-shadow: none !important;
            scrollbar-width: none;
          }

          .requests-mobile-route main > [role="tablist"]::-webkit-scrollbar {
            display: none;
          }

          .requests-mobile-route main > [role="tablist"] > button {
            position: relative;
            display: flex !important;
            height: 44px !important;
            min-width: max-content;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 0 16px !important;
            border: 1px solid #ece8f0;
            border-radius: 999px !important;
            background: #fff;
            color: #171a22 !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            box-shadow: 0 5px 18px rgba(44,33,80,.07);
          }

          .requests-mobile-route main > [role="tablist"] > button[aria-selected="true"] {
            border-color: transparent !important;
            background: linear-gradient(90deg,#7b35ff 0%,#bd42e4 50%,#f54fa8 100%) !important;
            color: #fff !important;
            box-shadow: 0 8px 24px rgba(153,60,231,.24);
          }

          .requests-mobile-route main > [role="tablist"] > button > span:not(.absolute) {
            display: grid !important;
            min-width: 28px !important;
            height: 28px !important;
            place-items: center;
            padding: 0 8px !important;
            border-radius: 999px !important;
            background: #f0f1f5 !important;
            color: #596172 !important;
            font-size: 11px !important;
            font-weight: 700 !important;
          }

          .requests-mobile-route main > [role="tablist"] > button[aria-selected="true"] > span:not(.absolute) {
            background: rgba(255,255,255,.92) !important;
            color: #8b3de8 !important;
          }

          .requests-mobile-route main > [role="tablist"] > button > span.absolute {
            display: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
