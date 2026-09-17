import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ShieldAlert,
  CreditCard,
  LifeBuoy,
} from "lucide-react";
import { queryAdmin } from "@/lib/admin/queries";
import type { SearchParams } from "@/lib/admin/types";
import { StatCard } from "./StatCard";
import { AdminTable } from "./AdminTable";
import { first, pageHref } from "./FilterBar";
import styles from "./admin.module.css";
export async function Overview({ params }: { params: SearchParams }) {
  const resolved = { ...params };
  if (first(params, "range") === "custom") {
    const today = new Date();
    resolved.from =
      first(params, "from") ||
      new Date(today.getTime() - 29 * 86400000).toISOString().slice(0, 10);
    resolved.to = first(params, "to") || today.toISOString().slice(0, 10);
  }
  const data = await queryAdmin("overview", resolved);
  const metrics = data.metrics ?? {};
  const points = data.trend ?? [];
  const max = Math.max(1, ...points.map((p) => p.count));
  const stats = [
    ["total_members", "Total members", "All member records"],
    ["new_registrations", "New registrations", "Joined in selected period"],
    ["active_members", "Active members", "Last seen in selected period"],
    [
      "pending_verification",
      "Pending verification",
      "Current profile review queue",
    ],
    ["open_reports", "Open reports", "Open and in review"],
    ["credits_purchased", "Chat credits purchased", "Paid in selected period"],
  ];
  const attention = [
    {
      key: "pending_verification",
      title: "Profile verifications",
      description: "Completed profiles awaiting review",
      href: "/admin/verification",
      icon: BadgeCheck,
    },
    {
      key: "open_reports",
      title: "Safety reports",
      description: "Open or currently in review",
      href: "/admin/reports",
      icon: ShieldAlert,
    },
    {
      key: "failed_payments",
      title: "Failed payments",
      description: "Payment attempts marked failed",
      href: "/admin/payments?status=failed",
      icon: CreditCard,
    },
    {
      key: "unresolved_support",
      title: "Support requests",
      description: "Requests awaiting resolution",
      href: "/admin/support",
      icon: LifeBuoy,
    },
  ];
  return (
    <>
      <div className={styles.heading}>
        <div>
          <div className={styles.eyebrow}>BANDHANAA OPERATIONS</div>
          <h1>Overview</h1>
          <p>
            Monitor Bandhanaa activity, member safety and platform operations.
          </p>
        </div>
        <form action="/admin" className={styles.flow}>
          <label className={styles.field}>
            <span className={styles.srOnly}>Date range</span>
            <select name="range" defaultValue={first(params, "range") || "30"}>
              <option value="today">Today</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="custom">Custom dates</option>
            </select>
          </label>
          <button className={styles.button}>Apply</button>
        </form>
      </div>
      {first(params, "range") === "custom" ? (
        <form action="/admin" className={styles.filters}>
          <input type="hidden" name="range" value="custom" />
          <label className={styles.field}>
            From
            <input
              type="date"
              name="from"
              required
              defaultValue={first(resolved, "from")}
            />
          </label>
          <label className={styles.field}>
            To
            <input
              type="date"
              name="to"
              required
              defaultValue={first(resolved, "to")}
            />
          </label>
          <button className={`${styles.button} ${styles.primary}`}>
            Apply custom range
          </button>
          <span className={`${styles.muted} ${styles.small}`}>
            Up to 366 days · UTC
          </span>
        </form>
      ) : null}
      <div className={styles.metrics}>
        {stats.map(([key, label, note]) => (
          <StatCard
            key={key}
            label={label}
            value={metrics[key] ?? 0}
            note={note}
          />
        ))}
      </div>
      <div className={styles.twoColumns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Registration trend</h2>
              <p>Daily new members · UTC</p>
            </div>
            <div className={styles.flow}>
              {["7", "30", "90"].map((d) => (
                <Link
                  key={d}
                  className={`${styles.button} ${(first(params, "trend") || "30") === d ? styles.primary : ""}`}
                  href={pageHref("/admin", params, { trend: d })}
                >
                  {d}d
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.panelBody}>
            <p className={styles.trendTotal}>
              {points
                .reduce((sum, p) => sum + p.count, 0)
                .toLocaleString("en-IN")}{" "}
              <span className={`${styles.muted} ${styles.small}`}>
                registrations
              </span>
            </p>
            <svg
              className={styles.chart}
              viewBox="0 0 700 200"
              role="img"
              aria-label={`Daily registrations over ${points.length} days. Data is available below.`}
            >
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1="0"
                  x2="700"
                  y1={30 + i * 50}
                  y2={30 + i * 50}
                  stroke="#eeeff2"
                />
              ))}
              {points.map((p, i) => {
                const width = 700 / Math.max(points.length, 1);
                const height = (150 * p.count) / max;
                return (
                  <rect
                    key={p.date}
                    x={i * width + width * 0.2}
                    y={180 - height}
                    width={width * 0.6}
                    height={height}
                    rx={Math.min(3, width * 0.15)}
                    fill="#bd216e"
                  >
                    <title>{`${p.date}: ${p.count}`}</title>
                  </rect>
                );
              })}
            </svg>
            <div className={styles.chartLabels}>
              <span>{points[0]?.date}</span>
              <span>{points.at(-1)?.date}</span>
            </div>
            <details className={styles.chartDetails}>
              <summary>View daily data</summary>
              <dl className={styles.chartData}>
                {points.map((p) => (
                  <div key={p.date}>
                    <dt>{p.date}</dt>
                    <dd>{p.count} registrations</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Needs attention</h2>
              <p>Current operational queues</p>
            </div>
          </div>
          <div className={styles.panelBody}>
            {attention.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={styles.attention}
              >
                <span className={styles.attentionIcon}>
                  <item.icon size={17} />
                </span>
                <div className={styles.attentionText}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
                <b>{metrics[item.key] ?? 0}</b>
                <ArrowRight size={14} className={styles.muted} />
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Recent members</h2>
            <p>The latest members to join Bandhanaa</p>
          </div>
          <Link className={styles.textLink} href="/admin/users">
            View all members →
          </Link>
        </div>
        <AdminTable
          section="overview"
          data={data}
          role="super_admin"
          base="/admin"
        />
      </section>
    </>
  );
}
