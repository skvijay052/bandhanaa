import Image from "next/image";
import Link from "next/link";
import type {
  AdminResult,
  AdminRow,
  SearchParams,
  Cell,
} from "@/lib/admin/types";
import type { AdminRole, AdminSection } from "@/lib/admin/permissions";
import { canAct } from "@/lib/admin/permissions";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { StatusBadge, humanize } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { pageHref } from "./FilterBar";
import styles from "./admin.module.css";
export function formatDate(value: Cell | undefined) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}
export function MemberAvatar({ row }: { row: AdminRow }) {
  const url = String(row.avatar_url || "");
  const safe =
    (url.startsWith("/") && !url.startsWith("//")) ||
    /^https:\/\/[^/]+\.supabase\.co\//.test(url);
  return safe ? (
    <Image src={url} alt="" width={36} height={36} className={styles.avatar} />
  ) : (
    <span className={styles.avatar} aria-hidden="true">
      {String(row.name || "M")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}
const columns: Partial<Record<AdminSection, string[]>> = {
  overview: [
    "name",
    "email",
    "location",
    "joined",
    "verification",
    "status",
    "action",
  ],
  users: [
    "name",
    "email",
    "age",
    "gender",
    "location",
    "joined",
    "verification",
    "status",
    "last_active",
    "action",
  ],
  verification: [
    "name",
    "submitted",
    "location",
    "completion",
    "verification",
    "action",
  ],
  reports: [
    "reported_member",
    "reported_by",
    "reason",
    "date",
    "status",
    "assigned_admin",
    "action",
  ],
  connections: ["from_member", "to_member", "status", "date", "responded"],
  referrals: [
    "referrer",
    "referred_member",
    "referral_code",
    "date",
    "signup_status",
    "qualified_at",
    "reward",
    "status",
  ],
  "chat-credits": [
    "name",
    "email",
    "balance",
    "referral_credits",
    "purchased_credits",
    "credits_used",
    "last_activity",
    "action",
  ],
  payments: [
    "name",
    "email",
    "provider",
    "order_id",
    "amount_paise",
    "credits",
    "status",
    "payment_mode",
    "date",
  ],
  support: [
    "name",
    "subject",
    "status",
    "delivery",
    "date",
    "assigned_admin",
    "action",
  ],
  audit: [
    "administrator",
    "action",
    "target_type",
    "target_id",
    "reason",
    "metadata",
    "date",
  ],
  admins: ["name", "email", "role", "is_active", "date", "action"],
};
const labels: Record<string, string> = {
  name: "Member",
  last_active: "Last active",
  amount_paise: "Amount",
  is_active: "Access",
  completion: "Completion",
  from_member: "Requested by",
  to_member: "Requested member",
  verification: "Profile review",
  qualified_at: "Qualified",
  change: "Change",
  balance: "Balance",
  signup_status: "Registration",
};
export function AdminTable({
  section,
  data,
  base,
  params = {},
  role,
  ledger = false,
  activity = false,
}: {
  section: AdminSection;
  data: AdminResult;
  base: string;
  params?: SearchParams;
  role: AdminRole;
  ledger?: boolean;
  activity?: boolean;
}) {
  const keys = activity
    ? ["date", "type", "reference"]
    : ledger
      ? ["date", "type", "change", "balance", "reference"]
      : (columns[section] ?? []).filter(
          (k) =>
            !(
              section === "users" &&
              role === "support_admin" &&
              ["age", "gender", "location"].includes(k)
            ),
        );
  function cell(row: AdminRow, key: string): React.ReactNode {
    const value = row[key];
    if (key === "action" && section !== "audit") {
      if (section === "admins")
        return (
          <ConfirmationDialog
            action="admin"
            target={String(row.user_id)}
            title={`Manage ${row.name || row.email}`}
            label="Manage access"
            role={row.role as AdminRole}
            active={Boolean(row.is_active)}
          />
        );
      const href =
        section === "chat-credits"
          ? `/admin/chat-credits?id=${row.id}`
          : section === "reports"
            ? `/admin/reports/${row.id}`
            : section === "support"
              ? `/admin/support/${row.id}`
              : `/admin/users/${row.id}${section === "verification" ? "?tab=profile" : ""}`;
      return (
        <Link href={href} className={styles.textLink}>
          {section === "verification"
            ? "Review"
            : section === "chat-credits"
              ? "View ledger"
              : "View"}{" "}
          →
        </Link>
      );
    }
    if (key === "name")
      return (
        <div className={styles.member}>
          {["users", "verification", "overview"].includes(section) ? (
            <MemberAvatar row={row} />
          ) : null}
          <div>
            <strong>{value || "Unnamed member"}</strong>
            {row.id &&
            ["users", "verification", "overview"].includes(section) ? (
              <small title={String(row.id)}>
                ID {String(row.id).slice(0, 8)}
              </small>
            ) : null}
          </div>
        </div>
      );
    if (
      [
        "status",
        "verification",
        "signup_status",
        "delivery",
        "is_active",
      ].includes(key)
    )
      return <StatusBadge value={value as string | boolean} />;
    if (
      [
        "date",
        "joined",
        "last_active",
        "submitted",
        "responded",
        "qualified_at",
        "last_activity",
      ].includes(key)
    )
      return formatDate(value);
    if (key === "amount_paise")
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(Number(value) / 100);
    if (key === "change")
      return (
        <strong style={{ color: Number(value) > 0 ? "#24704a" : "#b42332" }}>
          {Number(value) > 0 ? "+" : ""}
          {value}
        </strong>
      );
    if (key === "completion") return `${value ?? 0}%`;
    if (
      ["type", "role", "reason", "action"].includes(key) &&
      section !== "audit"
    )
      return value ? humanize(String(value)) : "—";
    if (["target_id", "reference", "referral_code", "order_id"].includes(key))
      return <span className={styles.mono}>{value ?? "—"}</span>;
    if (
      [
        "referrer",
        "referred_member",
        "reported_member",
        "reported_by",
        "from_member",
        "to_member",
      ].includes(key)
    ) {
      const id =
        row[
          (
            {
              referrer: "referrer_id",
              referred_member: "referred_id",
              reported_member: "reported_id",
              reported_by: "reporter_id",
              from_member: "from_id",
              to_member: "to_id",
            } as Record<string, string>
          )[key]
        ];
      return id ? (
        <Link className={styles.textLink} href={`/admin/users/${id}`}>
          {value || "Member"}
        </Link>
      ) : (
        (value ?? "—")
      );
    }
    return value === null || value === undefined ? "—" : String(value);
  }
  return (
    <>
      {data.rows.length ? (
        <div
          className={styles.tableWrap}
          tabIndex={0}
          role="region"
          aria-label="Scrollable records"
        >
          <table className={styles.table}>
            <caption className={styles.srOnly}>
              {humanize(section)} records
            </caption>
            <thead>
              <tr>
                {keys.map((k) => (
                  <th scope="col" key={k}>
                    {labels[k] ?? humanize(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={String(row.id ?? i)}>
                  {keys.map((k) => (
                    <td
                      key={k}
                      className={
                        ["reason", "metadata", "subject"].includes(k)
                          ? styles.wrapCell
                          : undefined
                      }
                    >
                      {cell(row, k)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState />
      )}
      {data.total > data.page_size ? (
        <div className={styles.pagination}>
          <span>
            {(data.page - 1) * data.page_size + 1}–
            {Math.min(data.page * data.page_size, data.total)} of{" "}
            {data.total.toLocaleString("en-IN")} records
          </span>
          <div className={styles.flow}>
            {data.page > 1 ? (
              <Link
                className={styles.button}
                href={pageHref(base, params, { page: String(data.page - 1) })}
              >
                ← Previous
              </Link>
            ) : null}
            <span>
              Page {data.page} / {Math.ceil(data.total / data.page_size)}
            </span>
            {data.page * data.page_size < data.total ? (
              <Link
                className={styles.button}
                href={pageHref(base, params, { page: String(data.page + 1) })}
              >
                Next →
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.pagination}>
          {data.total} {data.total === 1 ? "record" : "records"} · Dates in UTC
        </div>
      )}
    </>
  );
}
