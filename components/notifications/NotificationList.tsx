import type { NotificationItem } from "@/data/notifications";
import {
  DesktopNotificationRow,
  MobileNotificationRow,
} from "./NotificationRow";
export function NotificationList({
  items,
  mobile = false,
  onComplete,
}: {
  items: NotificationItem[];
  mobile?: boolean;
  onComplete: () => void;
}) {
  return (
    <div className={mobile ? "" : "divide-y divide-[var(--border)] border-y border-[var(--border)] bg-white"}>
      {items.map((item) =>
        mobile ? (
          <MobileNotificationRow
            key={item.id}
            item={item}
            onComplete={onComplete}
          />
        ) : (
          <DesktopNotificationRow
            key={item.id}
            item={item}
            onComplete={onComplete}
          />
        ),
      )}
    </div>
  );
}
