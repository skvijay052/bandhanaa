"use client";
import styles from "@/components/admin/admin.module.css";
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={`${styles.root} ${styles.empty}`} role="alert">
      <h2>Admin workspace is temporarily unavailable</h2>
      <p>
        Your changes have not been confirmed. Try again, or contact the platform
        owner if the problem continues.
      </p>
      <button
        className={styles.button}
        style={{ marginTop: 20 }}
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
