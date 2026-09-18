import { requireAdmin } from "@/lib/admin/auth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import styles from "@/components/admin/admin.module.css";
export default async function Page() {
  await requireAdmin("settings");
  const config = [
    [
      "Supabase connection",
      Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
    ],
    ["Payment server access", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)],
    [
      "Razorpay integration",
      Boolean(
        process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        process.env.RAZORPAY_WEBHOOK_SECRET,
      ),
    ],
    [
      "Support email",
      Boolean(
        process.env.BREVO_SMTP_HOST &&
        process.env.BREVO_SMTP_PORT &&
        process.env.BREVO_SMTP_USER &&
        process.env.BREVO_SMTP_KEY &&
        process.env.BREVO_FROM_EMAIL &&
        process.env.BANDHANAA_SUPPORT_EMAIL,
      ),
    ],
  ] as const;
  return (
    <>
      <div className={styles.heading}>
        <div>
          <div className={styles.eyebrow}>BANDHANAA OPERATIONS</div>
          <h1>Settings</h1>
          <p>Review platform capabilities and connection configuration.</p>
        </div>
      </div>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Integration configuration</h2>
        </div>
        <div className={styles.panelBody}>
          <p
            className={`${styles.muted} ${styles.small}`}
            style={{ marginBottom: 20 }}
          >
            These checks confirm that configuration values are present. They do
            not test provider connectivity.
          </p>
          <dl className={styles.detailGrid}>
            {config.map(([label, configured]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <StatusBadge
                    value={configured ? "configured" : "not_configured"}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Current product rules</h2>
        </div>
        <div className={styles.panelBody}>
          <dl className={styles.detailGrid}>
            <div>
              <dt>Referral reward</dt>
              <dd>10 credits after qualification</dd>
            </div>
            <div>
              <dt>Message sending</dt>
              <dd>1 credit per outgoing message</dd>
            </div>
            <div>
              <dt>Credit purchase</dt>
              <dd>₹10 for 10 credits</dd>
            </div>
            <div>
              <dt>Relationship controls</dt>
              <dd>Accepted connection required</dd>
            </div>
            <div>
              <dt>Administrator permissions</dt>
              <dd>Assigned by a super admin</dd>
            </div>
            <div>
              <dt>Audit records</dt>
              <dd>Append-only</dd>
            </div>
          </dl>
          <p
            className={styles.notice}
            style={{ marginTop: 25, marginBottom: 0 }}
          >
            Business rules are managed in the application and database. Changes
            require a reviewed release. Secret values are never shown here.
          </p>
        </div>
      </section>
    </>
  );
}
