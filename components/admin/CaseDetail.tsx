import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { queryAdmin } from "@/lib/admin/queries";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { StatusBadge, humanize } from "./StatusBadge";
import { formatDate } from "./AdminTable";
import styles from "./admin.module.css";
export async function CaseDetail({
  section,
  id,
}: {
  section: "reports" | "support";
  id: string;
}) {
  if (
    section === "reports"
      ? !/^[1-9]\d{0,18}$/.test(id)
      : !z.uuid().safeParse(id).success
  )
    notFound();
  const data = await queryAdmin(section, {}, id);
  const row = data.detail;
  if (!row) notFound();
  const report = section === "reports";
  const terminal = ["resolved", "dismissed"].includes(String(row.status));
  return (
    <>
      <Link className={styles.textLink} href={`/admin/${section}`}>
        ← {report ? "Safety reports" : "Support requests"}
      </Link>
      <div className={styles.heading} style={{ marginTop: 24 }}>
        <div>
          <h1>{report ? `Safety report #${id}` : String(row.subject)}</h1>
          <p>Submitted {formatDate(row.date)} · UTC</p>
        </div>
        <StatusBadge value={String(row.status)} />
      </div>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>{report ? "Report information" : "Request information"}</h2>
        </div>
        <div className={styles.panelBody}>
          <dl className={styles.detailGrid}>
            {(report
              ? ["reported_member", "reported_by", "reason", "assigned_admin"]
              : ["name", "email", "delivery"]
            ).map((key) => (
              <div key={key}>
                <dt>{humanize(key)}</dt>
                <dd>
                  {key === "reason"
                    ? humanize(String(row[key]))
                    : String(row[key] ?? "—")}
                </dd>
              </div>
            ))}
          </dl>
          <h2
            style={{
              marginTop: 26,
              marginBottom: 10,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {report ? "Submitted details" : "Message"}
          </h2>
          <p className={styles.prose}>
            {String(
              row[report ? "details" : "body"] ||
                "No additional details submitted.",
            )}
          </p>
          {row[report ? "resolution_note" : "internal_note"] ? (
            <>
              <h2
                style={{
                  marginTop: 24,
                  marginBottom: 10,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Latest internal note
              </h2>
              <p className={styles.prose}>
                {String(row[report ? "resolution_note" : "internal_note"])}
              </p>
            </>
          ) : null}
          <div className={styles.flow} style={{ marginTop: 28 }}>
            <Link
              className={styles.button}
              href={`/admin/users/${row[report ? "reported_id" : "member_id"]}`}
            >
              View member account
            </Link>
            {!terminal ? (
              <>
                {row.status !== (report ? "reviewing" : "in_review") ? (
                  <ConfirmationDialog
                    action={report ? "report" : "support"}
                    target={id}
                    title="Start reviewing this request?"
                    label="Mark in review"
                    expected={String(row.status)}
                    status={report ? "reviewing" : "in_review"}
                  />
                ) : null}
                <ConfirmationDialog
                  action={report ? "report" : "support"}
                  target={id}
                  title="Resolve this request?"
                  label="Resolve"
                  expected={String(row.status)}
                  status="resolved"
                />
                {report ? (
                  <ConfirmationDialog
                    action="report"
                    target={id}
                    title="Dismiss this report?"
                    label="Dismiss"
                    expected={String(row.status)}
                    status="dismissed"
                  />
                ) : null}
              </>
            ) : null}
            {report && row.account_status === "active" ? (
              <ConfirmationDialog
                action="suspend"
                target={String(row.reported_id)}
                title="Suspend the reported member?"
                label="Suspend member"
              />
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
