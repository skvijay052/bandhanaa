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
  like: { className: "text-[#f34ca4]", Icon: Heart },
  message: { className: "text-[#f34ca4]", Icon: MessageCircle },
  accepted: { className: "text-[#f34ca4]", Icon: Check },
  view: { className: "text-[#f34ca4]", Icon: Eye },
  connection: { className: "text-[#f34ca4]", Icon: UsersRound },
  profile_complete: { className: "text-[#f34ca4]", Icon: Shield },
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
    <article className="flex min-h-[82px] items-center px-2 transition-colors">
      <span className="relative size-[46px] shrink-0 overflow-hidden rounded-full">
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
            className="h-8 rounded-lg border border-[#f34ca4] px-3 text-[12px] font-semibold text-[#f34ca4] hover:bg-[#fff0f7]"
          >
            {item.actionLabel}
          </button>
        ) : (
          <span
            className={`size-2 rounded-full ${item.unread ? "bg-[#f34ca4]" : "bg-[#cfd9de]"}`}
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
      className={`relative flex items-center border-b border-[var(--border)] py-4 ${item.actionLabel ? "min-h-[96px] pb-11" : "min-h-[80px]"}`}
    >
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
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
          className={`mt-auto mb-1 size-2 rounded-full ${item.unread ? "bg-[#f34ca4]" : "bg-[#cfd9de]"}`}
        />
      </div>
      {item.actionLabel ? (
        <button
          onClick={onComplete}
          className="absolute bottom-3 right-0 h-8 rounded-lg border border-[#f34ca4] px-3 text-[12px] font-semibold text-[#f34ca4]"
        >
          {item.actionLabel}
        </button>
      ) : null}
    </article>
  );
}
