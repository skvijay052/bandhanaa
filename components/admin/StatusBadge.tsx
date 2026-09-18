import styles from "./admin.module.css";
export const humanize = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const labels: Record<string, string> = {
  submitted: "Open",
  reviewing: "In review",
  not_submitted: "Not submitted",
};
export function StatusBadge({
  value,
}: {
  value: string | boolean | null | undefined;
}) {
  const text =
    typeof value === "boolean"
      ? value
        ? "active"
        : "disabled"
      : value || "unavailable";
  const tone = [
    "active",
    "verified",
    "paid",
    "rewarded",
    "accepted",
    "resolved",
    "sent",
  ].includes(text)
    ? styles.success
    : [
          "pending",
          "submitted",
          "reviewing",
          "in_review",
          "registered",
          "open",
          "created",
        ].includes(text)
      ? styles.warning
      : [
            "suspended",
            "disabled",
            "rejected",
            "failed",
            "dismissed",
            "declined",
            "cancelled",
          ].includes(text)
        ? styles.error
        : "";
  return (
    <span className={`${styles.badge} ${tone}`}>
      {labels[text] ?? humanize(text)}
    </span>
  );
}
