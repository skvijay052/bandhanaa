import styles from "./admin.module.css";
export function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading admin information">
      <div className={styles.skeleton} style={{ width: "30%", height: 28 }} />
      <div className={styles.metrics}>
        {[1, 2, 3].map((i) => (
          <div className={styles.stat} key={i}>
            <div className={styles.skeleton} />
            <div
              className={styles.skeleton}
              style={{ width: "50%", height: 35 }}
            />
          </div>
        ))}
      </div>
      <div className={styles.panelBody}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div className={styles.skeleton} key={i} style={{ height: 35 }} />
        ))}
      </div>
    </div>
  );
}
