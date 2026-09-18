import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { queryAdmin } from "@/lib/admin/queries";
import { canAccess, canAct } from "@/lib/admin/permissions";
import type { SearchParams } from "@/lib/admin/types";
import { first, pageHref } from "./FilterBar";
import { AdminTable, MemberAvatar, formatDate } from "./AdminTable";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { StatusBadge, humanize } from "./StatusBadge";
import styles from "./admin.module.css";
export async function MemberDetail({
  id,
  params,
}: {
  id: string;
  params: SearchParams;
}) {
  if (!z.uuid().safeParse(id).success) notFound();
  const admin = await requireAdmin("users");
  const data = await queryAdmin("users", params, id);
  const member = data.member;
  if (!member) notFound();
  const tab = first(params, "tab") || "overview";
  const base = `/admin/users/${id}`;
  const tabs = [
    "overview",
    ...(admin.role !== "support_admin" ? ["profile"] : []),
    ...(canAccess(admin.role, "connections") ? ["connections"] : []),
    ...(canAccess(admin.role, "chat-credits") ? ["credits"] : []),
    ...(canAccess(admin.role, "payments") ? ["payments"] : []),
    ...(canAccess(admin.role, "reports") ? ["reports"] : []),
    ...(admin.role !== "support_admin" ? ["activity"] : []),
  ];
  return (
    <>
      <Link className={styles.textLink} href="/admin/users">
        ← Members
      </Link>
      <div className={styles.heading} style={{ marginTop: 24 }}>
        <div className={styles.detailHero}>
          <MemberAvatar row={member} />
          <div>
            <h1>{String(member.name || "Member")}</h1>
            <div className={styles.flow}>
              <StatusBadge value={String(member.status)} />
              <StatusBadge value={String(member.verification)} />
            </div>
            <p className={styles.mono} style={{ marginTop: 8 }}>
              {id}
            </p>
          </div>
        </div>
        <div className={styles.detailActions}>
          {canAct(admin.role, "suspend") && member.status === "active" ? (
            <ConfirmationDialog
              action="suspend"
              target={id}
              title={`Suspend ${member.name || "this member"}?`}
              label="Suspend account"
            />
          ) : null}
          {canAct(admin.role, "restore") && member.status === "suspended" ? (
            <ConfirmationDialog
              action="restore"
              target={id}
              title={`Restore ${member.name || "this member"}?`}
              label="Restore account"
            />
          ) : null}
        </div>
      </div>
      <section className={styles.panel}>
        <nav className={styles.tabs} aria-label="Member information">
          {tabs.map((t) => (
            <Link
              key={t}
              href={pageHref(base, {}, { tab: t })}
              className={styles.tab}
              aria-current={tab === t ? "page" : undefined}
            >
              {humanize(t)}
            </Link>
          ))}
        </nav>
        {tab === "credits" ? (
          <div className={styles.panelHead}>
            <h2>Current balance: {member.balance ?? 0} credits</h2>
          </div>
        ) : null}
        {tab === "overview" || tab === "profile" ? (
          <div className={styles.panelBody}>
            <dl className={styles.detailGrid}>
              {(tab === "overview"
                ? [
                    "email",
                    "joined",
                    "last_active",
                    "profile_completion",
                    "email_verified",
                    "registration",
                    "onboarding_completed",
                    "status",
                    "verification",
                    "submitted",
                    "reviewed",
                  ]
                : [
                    "age",
                    "gender",
                    "location",
                    "profession",
                    "education",
                    "religion",
                    "mother_tongue",
                    "marital_status",
                    "bio",
                  ]
              ).map((key) => (
                <div key={key}>
                  <dt>{humanize(key)}</dt>
                  <dd>
                    {[
                      "joined",
                      "last_active",
                      "submitted",
                      "reviewed",
                    ].includes(key)
                      ? formatDate(member[key])
                      : typeof member[key] === "boolean"
                        ? member[key]
                          ? "Yes"
                          : "No"
                        : key === "profile_completion"
                          ? `${member[key] ?? 0}%`
                          : String(member[key] ?? "—")}
                  </dd>
                </div>
              ))}
            </dl>
            {canAct(admin.role, "approve") &&
            member.verification !== "not_submitted" ? (
              <div style={{ marginTop: 30 }}>
                <p className={styles.notice}>
                  Profile review is an administrative assessment of the
                  submitted profile. It does not change email confirmation or
                  certify identity documents.
                </p>
                <div className={styles.flow}>
                  {member.verification !== "verified" ? (
                    <ConfirmationDialog
                      action="approve"
                      target={id}
                      expected={String(member.verification)}
                      title="Approve this profile?"
                      label="Approve profile"
                    />
                  ) : null}
                  {member.verification !== "rejected" ? (
                    <ConfirmationDialog
                      action="reject"
                      target={id}
                      expected={String(member.verification)}
                      title="Reject this profile?"
                      label="Reject profile"
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <AdminTable
            section={
              tab === "credits"
                ? "chat-credits"
                : tab === "connections"
                  ? "connections"
                  : tab === "reports"
                    ? "reports"
                    : "payments"
            }
            data={data}
            base={base}
            params={params}
            role={admin.role}
            ledger={tab === "credits"}
            activity={tab === "activity"}
          />
        )}
      </section>
      {tab === "credits" ? (
        <Link className={styles.button} href={`/admin/chat-credits?id=${id}`}>
          Open balance and adjustments
        </Link>
      ) : null}
    </>
  );
}
