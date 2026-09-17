import { ArrowUpRight } from "lucide-react";
import styles from "./admin.module.css";
export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className={styles.stat}>
      <div className={styles.statTop}>
        <span>{label}</span>
        <ArrowUpRight size={17} className={styles.statIcon} />
      </div>
      <div className={styles.statValue}>
        {new Intl.NumberFormat("en-IN").format(value)}
      </div>
      <p className={styles.statNote}>{note ?? "All time · actual records"}</p>
    </div>
  );
}
