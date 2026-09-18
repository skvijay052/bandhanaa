import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { queryAdmin } from "@/lib/admin/queries";
import { canAct, type AdminSection } from "@/lib/admin/permissions";
import type { SearchParams } from "@/lib/admin/types";
import { navigation, sectionHref } from "./navigation";
import { FilterBar, FilterTabs, first } from "./FilterBar";
import { AdminTable } from "./AdminTable";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { StatCard } from "./StatCard";
import { humanize } from "./StatusBadge";
import styles from "./admin.module.css";
const subtitles: Partial<Record<AdminSection, string>> = {
  users: "Find members, review account information and manage access.",
  verification:
    "Review completed member profiles. Email confirmation is tracked separately.",
  reports: "Review safety reports and record clear, accountable decisions.",
  connections: "Understand member requests and accepted connections.",
  referrals:
    "Track registrations, qualification and the credits awarded by referrals.",
  "chat-credits":
    "Monitor balances and trace every credit through the existing ledger.",
  payments: "Review payment orders and confirmed credit purchases.",
  support: "Manage Contact Us submissions and account support.",
  audit: "A permanent record of sensitive administrative actions.",
  admins: "Manage access for existing, confirmed Bandhanaa accounts.",
};
const statuses: Partial<Record<AdminSection, string[]>> = {
  users: ["active", "suspended", "disabled"],
  verification: ["pending", "verified", "rejected", "not_submitted"],
  reports: ["submitted", "reviewing", "resolved", "dismissed"],
  connections: ["pending", "accepted", "declined"],
  referrals: ["registered", "rewarded"],
  payments: ["created", "pending", "paid", "failed", "cancelled"],
  support: ["open", "in_review", "resolved"],
};
export async function SectionPage({
  section,
  params,
}: {
  section: AdminSection;
  params: SearchParams;
}) {
  const admin = await requireAdmin(section);
  const title =
    navigation.find((n) => n.key === section)?.label ?? humanize(section);
  const base = sectionHref(section);
  const resolved = { ...params };
  if (!("status" in resolved) && section === "verification")
    resolved.status = "pending";
  const data = await queryAdmin(section, resolved);
  const ledger = section === "chat-credits" && Boolean(first(params, "id"));
  return (
    <>
      <div className={styles.heading}>
        <div>
          <div className={styles.eyebrow}>BANDHANAA OPERATIONS</div>
          <h1>{ledger ? "Member credit ledger" : title}</h1>
          <p>{subtitles[section]}</p>
        </div>
        {section === "admins" ? (
          <ConfirmationDialog
            action="admin"
            title="Grant administrator access"
            label="Add administrator"
          />
        ) : null}
        {ledger ? (
          <Link className={styles.button} href="/admin/chat-credits">
            ← All balances
          </Link>
        ) : null}
      </div>
      {data.metrics ? (
        <div className={styles.metrics}>
          {Object.entries(data.metrics).map(([key, value]) => (
            <StatCard key={key} label={humanize(key)} value={value} />
          ))}
        </div>
      ) : null}
      {section === "payments" ? (
        <p className={styles.notice}>
          Payments are verified by the existing Razorpay integration. Refunds
          are not available in this workspace; the platform does not yet have a
          refund and credit-reversal workflow.
        </p>
      ) : null}
      {section === "referrals" ? (
        <p className={styles.notice}>
          A referral qualifies after email confirmation, active completed
          registration and all required profile fields. The existing reward is
          10 credits. Rewards are issued automatically by the database.
        </p>
      ) : null}
      {section === "support" ? (
        <p className={styles.notice}>
          This inbox includes requests submitted after the admin inbox was
          enabled. Earlier requests remain in the existing support email inbox.
        </p>
      ) : null}
      {section === "connections" ? (
        <p className={styles.notice}>
          This operational view shows request states and dates. Private message
          content is not included.
        </p>
      ) : null}
      {ledger && data.member ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>{String(data.member.name || "Member")}</h2>
              <p>{String(data.member.email || "")}</p>
            </div>
            <div className={styles.flow}>
              <strong>{data.member.balance} credits</strong>
              {canAct(admin.role, "adjust") ? (
                <ConfirmationDialog
                  action="adjust"
                  target={String(data.member.id)}
                  balance={Number(data.member.balance)}
                  title="Adjust message credits"
                  label="Adjust credits"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <section className={styles.panel} aria-label={`${title} records`}>
        {["verification", "reports", "support"].includes(section) ? (
          <FilterTabs
            base={base}
            params={resolved}
            values={(statuses[section] ?? [])
              .filter((v) => v !== "not_submitted")
              .map((v) => ({
                value: v,
                label:
                  v === "submitted"
                    ? "Open"
                    : v === "reviewing"
                      ? "In review"
                      : humanize(v),
              }))}
          />
        ) : null}
        {!ledger ? (
          <FilterBar
            base={base}
            params={resolved}
            statuses={statuses[section]}
            users={section === "users" && admin.role !== "support_admin"}
            reports={section === "reports"}
          />
        ) : null}
        <AdminTable
          section={section}
          data={data}
          role={admin.role}
          base={base}
          params={resolved}
          ledger={ledger}
        />
      </section>
      {ledger ? (
        <p className={`${styles.muted} ${styles.small}`}>
          Historical entries created before balance snapshots were enabled show
          “—” in the Balance column. The current wallet balance remains
          authoritative.
        </p>
      ) : null}
    </>
  );
}
