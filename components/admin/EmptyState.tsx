import { Inbox } from "lucide-react";
import styles from "./admin.module.css";
export function EmptyState({
  title = "No records found",
  message = "Try a different search or clear the filters.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className={styles.empty}>
      <Inbox size={30} />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
