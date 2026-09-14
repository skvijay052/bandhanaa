import type { ReactNode } from "react";
import { ChatProfilePictureEnhancer } from "@/components/messages/ChatProfilePictureEnhancer";
import { MessagesFavouritesEnhancer } from "@/components/messages/MessagesFavouritesEnhancer";
import "./messages-pink-theme.css";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="messages-mobile-route">
      <style>{`
        @media (max-width: 767px) {
          .messages-mobile-route {
            min-height: 100dvh;
            background: #fff;
          }

          .messages-mobile-route section {
            background: #fff !important;
          }

          .messages-mobile-route section > div.pointer-events-none {
            display: none !important;
          }

          .messages-mobile-route section > div.relative {
            padding-top: 0 !important;
            background: #fff !important;
          }

          .messages-mobile-route section > div.relative > div.flex.items-center.justify-between {
            position: sticky;
            top: 0;
            z-index: 90;
            min-height: 60px;
            margin: 0 -16px;
            padding: 12px 16px;
            background: #fff;
            border-bottom: 1px solid rgba(0,0,0,.05);
          }

          .messages-mobile-route section > div.relative > div.flex.items-center.justify-between > div {
            gap: 0 !important;
          }

          .messages-mobile-route a[href="/notifications"] {
            display: none !important;
          }

          .messages-mobile-route section > div.relative > div.flex.items-center.justify-between a[href="/matches?tab=shortlisted"] {
            width: 36px !important;
            height: 36px !important;
            border-radius: 13px !important;
            background: #fff !important;
            box-shadow: 0 8px 24px rgba(44,33,80,.10) !important;
          }

          .messages-mobile-route section > div.relative > div.mt-6 {
            display: none !important;
          }

          .messages-mobile-route section > div.relative > label.mt-5 {
            margin-top: 14px !important;
          }

          .messages-mobile-route section > div.relative + div {
            background: #fff !important;
          }

          .messages-mobile-route section > header span.relative.size-12.overflow-hidden.rounded-full {
            cursor: pointer;
          }
        }
      `}</style>
      <ChatProfilePictureEnhancer />
      <MessagesFavouritesEnhancer />
      {children}
    </div>
  );
}
