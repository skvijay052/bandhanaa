import { ProfileImage } from "@/components/ui/ProfileImage";
import {
  Check,
  Eye,
  Heart,
  MessageCircle,
  Shield,
  UsersRound,
} from "lucide-react";
import type { NotificationItem, NotificationType } from "@/data/notifications";

const iconStyles: Record<
  NotificationType,
  { className: string; Icon: typeof Heart }
> = {
  like: { className: "bg-[#e8f5fe] text-[#1d9bf0]", Icon: Heart },
  message: { className: "bg-[#e8f5fe] text-[#1d9bf0]", Icon: MessageCircle },
  accepted: { className: "bg-[#e8f5fe] text-[#1d9bf0]", Icon: Check },
  view: { className: "bg-[#e8f5fe] text-[#1d9bf0]", Icon: Eye },
  connection: { className: "bg-[#e8f5fe] text-[#1d9bf0]", Icon: UsersRound },
  profile_complete: { className: "bg-[#e8f5fe] text-[#1d9bf0]", Icon: Shield },
};

function TypeIcon({
  type,
  mobile = false,
}: {
  type: NotificationType;
  mobile?: boolean;
}) {
  const { Icon, className } = iconStyles[type];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${mobile ? "size-9" : "size-10"} ${className}`}
    >
      <Icon
        size={mobile ? 17 : 19}
        strokeWidth={type === "message" ? 2.4 : 2}
        fill={
          type === "like" || type === "profile_complete"
            ? "currentColor"
            : "none"
        }
      />
    </span>
  );
}

function Title({ item }: { item: NotificationItem }) {
  return (
    <>
      {item.name ? (
        <>
          <strong className="font-bold">
            {item.name}, {item.age}
          </strong>{" "}
        </>
      ) : null}
      {item.title}
    </>
  );
}

export function DesktopNotificationRow({
  item,
  onComplete,
}: {
  item: NotificationItem;
  onComplete: () => void;
}) {
  return (
    <article className={`flex min-h-[82px] items-center px-2 transition-colors hover:bg-[#f7f9f9] ${item.unread ? "bg-[#f7fbfe]" : "bg-white"}`}>
      <span className="relative size-[46px] shrink-0 overflow-hidden rounded-full bg-slate-100">
        <ProfileImage
          src={item.avatar ?? "/profiles/ananya.png"}
          alt={item.name ? `${item.name}'s avatar` : "Your profile"}
          fill
          sizes="46px"
          className="object-cover"
        />
      </span>
      <span className="ml-3">
        <TypeIcon type={item.type} />
      </span>
      <div className="ml-4 min-w-0 flex-1">
        <p className="text-[15px] font-normal text-[#0f1419]">
          <Title item={item} />
        </p>
        {item.subtitle ? (
          <p className="mt-1 truncate text-[12px] font-normal text-[var(--text-secondary)]">
            {item.subtitle}
          </p>
        ) : null}
      </div>
      <div className="ml-4 flex min-w-[92px] flex-col items-end gap-3">
        <time className="text-[12px] font-normal text-[var(--text-secondary)]">{item.time}</time>
        {item.actionLabel ? (
          <button
            onClick={onComplete}
            className="h-8 rounded-lg border border-[#1d9bf0] px-3 text-[12px] font-semibold text-[#1d9bf0] hover:bg-[#e8f5fe]"
          >
            {item.actionLabel}
          </button>
        ) : (
          <span
            className={`size-2 rounded-full ${item.unread ? "bg-[#1d9bf0]" : "bg-[#cfd9de]"}`}
          />
        )}
      </div>
    </article>
  );
}

export function MobileNotificationRow({
  item,
  onComplete,
}: {
  item: NotificationItem;
  onComplete: () => void;
}) {
  return (
    <article
      className={`relative flex items-center border-b border-[var(--border)] py-4 ${item.unread ? "bg-[#f7fbfe]" : "bg-white"} ${item.actionLabel ? "min-h-[96px] pb-11" : "min-h-[80px]"}`}
    >
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
        <ProfileImage
          src={item.avatar ?? "/profiles/ananya.png"}
          alt={item.name ? `${item.name}'s avatar` : "Your profile"}
          fill
          sizes="44px"
          className="object-cover"
        />
      </span>
      <span className="ml-2">
        <TypeIcon type={item.type} mobile />
      </span>
      <p className="ml-3 min-w-0 flex-1 pr-2 text-[14px] leading-5 text-[#0f1419]">
        <Title item={item} />
      </p>
      <div className="flex w-[60px] shrink-0 flex-col items-end self-stretch pt-0.5">
        <time className="whitespace-nowrap text-[11px] text-[var(--text-secondary)]">
          {item.time}
        </time>
        <span
          className={`mt-auto mb-1 size-2 rounded-full ${item.unread ? "bg-[#1d9bf0]" : "bg-[#cfd9de]"}`}
        />
      </div>
      {item.actionLabel ? (
        <button
          onClick={onComplete}
          className="absolute bottom-3 right-0 h-8 rounded-lg border border-[#1d9bf0] px-3 text-[12px] font-semibold text-[#1d9bf0]"
        >
          {item.actionLabel}
        </button>
      ) : null}
    </article>
  );
}
