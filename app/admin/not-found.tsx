import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
export default function NotFound() {
  return (
    <div className={styles.empty}>
      <h2>This page is unavailable</h2>
      <p>The record may not exist, or your role may not have access.</p>
      <Link className={styles.button} href="/admin" style={{ marginTop: 20 }}>
        Back to workspace
      </Link>
    </div>
  );
}
