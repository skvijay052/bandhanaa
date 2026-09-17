import Link from "next/link";
import { Search } from "lucide-react";
import type { SearchParams } from "@/lib/admin/types";
import { humanize } from "./StatusBadge";
import styles from "./admin.module.css";
export function first(params: SearchParams, key: string) {
  const v = params[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}
export function pageHref(
  base: string,
  params: SearchParams,
  changes: Record<string, string> = {},
) {
  const query = new URLSearchParams();
  for (const key of Object.keys(params)) {
    const v = first(params, key);
    if (v) query.set(key, v);
  }
  for (const [k, v] of Object.entries(changes)) {
    if (v) query.set(k, v);
    else query.delete(k);
  }
  return `${base}${query.size ? "?" + query.toString() : ""}`;
}
export function FilterBar({
  base,
  params,
  statuses = [],
  users = false,
  reports = false,
}: {
  base: string;
  params: SearchParams;
  statuses?: string[];
  users?: boolean;
  reports?: boolean;
}) {
  return (
    <form action={base} className={styles.filters}>
      <label className={`${styles.field} ${styles.filterSearch}`}>
        Search
        <input
          name="q"
          defaultValue={first(params, "q")}
          placeholder="Search records…"
          maxLength={100}
        />
      </label>
      {statuses.length ? (
        <label className={styles.field}>
          Status
          <select name="status" defaultValue={first(params, "status")}>
            <option value="">All statuses</option>
            {statuses.map((v) => (
              <option key={v} value={v}>
                {v === "submitted" ? "Open" : humanize(v)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {users ? (
        <>
          <label className={styles.field}>
            Verification
            <select
              name="verification"
              defaultValue={first(params, "verification")}
            >
              <option value="">All reviews</option>
              {["not_submitted", "pending", "verified", "rejected"].map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Gender
            <select name="gender" defaultValue={first(params, "gender")}>
              <option value="">All genders</option>
              {["man", "woman", "male", "female"].map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}
      {reports ? (
        <label className={styles.field}>
          Reason
          <select name="reason" defaultValue={first(params, "reason")}>
            <option value="">All reasons</option>
            {[
              "inappropriate_photos",
              "abusive_behavior",
              "fake_profile",
              "scam_or_fraud",
              "other",
            ].map((v) => (
              <option key={v} value={v}>
                {humanize(v)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className={styles.field}>
        From
        <input name="from" type="date" defaultValue={first(params, "from")} />
      </label>
      <label className={styles.field}>
        To
        <input
          name="to"
          type="date"
          defaultValue={first(params, "to")}
          min={first(params, "from") || undefined}
        />
      </label>
      <button className={`${styles.button} ${styles.primary}`}>
        <Search size={13} />
        Apply
      </button>
      <Link href={base} className={styles.button}>
        Reset
      </Link>
    </form>
  );
}
export function FilterTabs({
  base,
  params,
  values,
}: {
  base: string;
  params: SearchParams;
  values: { value: string; label: string }[];
}) {
  return (
    <nav className={styles.tabs} aria-label="Filter by status">
      {values.map((v) => (
        <Link
          key={v.value}
          className={styles.tab}
          aria-current={
            first(params, "status") === v.value ? "page" : undefined
          }
          href={pageHref(base, params, { status: v.value, page: "1" })}
        >
          {v.label}
        </Link>
      ))}
    </nav>
  );
}
