"use client";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { mutateAdmin } from "@/lib/admin/actions";
import type { AdminAction, AdminRole } from "@/lib/admin/permissions";
import styles from "./admin.module.css";
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={`${styles.button} ${styles.primary}`} disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}
export function ConfirmationDialog({
  action,
  target,
  title,
  label,
  expected,
  status,
  balance,
  role = "moderator",
  active = true,
}: {
  action: AdminAction;
  target?: string;
  title: string;
  label: string;
  expected?: string;
  status?: string;
  balance?: number;
  role?: AdminRole;
  active?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(mutateAdmin, {
    ok: false,
    message: "",
  });
  const [requestId, setRequestId] = useState("");
  const [amount, setAmount] = useState("1");
  const [direction, setDirection] = useState("add");
  const currentState =
    state.operationId === requestId ? state : { ok: false, message: "" };
  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${action === "suspend" ? styles.danger : ""}`}
        onClick={() => {
          setRequestId(crypto.randomUUID());
          setAmount("1");
          setDirection("add");
          dialog.current?.showModal();
        }}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className={`${styles.root} ${styles.dialog}`}
        aria-labelledby={`dialog-${action}-${target ?? "new"}-title`}
        onCancel={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        <div className={styles.dialogInner}>
          <h2 id={`dialog-${action}-${target ?? "new"}-title`}>{title}</h2>
          <p>
            Confirm the change and explain the reason. This action will be
            recorded in the audit log.
          </p>
          <form action={formAction} key={requestId}>
            <input type="hidden" name="operation_id" value={requestId} />
            <input type="hidden" name="action" value={action} />
            {target ? (
              <input type="hidden" name="target" value={target} />
            ) : null}
            {expected ? (
              <input type="hidden" name="expected" value={expected} />
            ) : null}
            {status ? (
              <input type="hidden" name="status" value={status} />
            ) : null}
            {action === "adjust" ? (
              <>
                <p>
                  Current balance: <strong>{balance ?? 0} credits</strong>
                </p>
                <div className={styles.flow}>
                  <label className={styles.field}>
                    Adjustment
                    <select
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                    >
                      <option value="add">Add credits</option>
                      <option value="remove">Remove credits</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    Amount
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      step="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </label>
                </div>
                <input
                  name="amount"
                  type="hidden"
                  value={(direction === "remove" ? -1 : 1) * Number(amount)}
                />
                <input name="request_id" type="hidden" value={requestId} />
              </>
            ) : null}
            {action === "admin" ? (
              <>
                {!target ? (
                  <label className={styles.field}>
                    Existing member UUID
                    <input
                      name="target"
                      required
                      placeholder="Existing Supabase user ID"
                      minLength={36}
                      maxLength={36}
                    />
                  </label>
                ) : null}
                <label className={styles.field}>
                  Role
                  <select name="role" defaultValue={role}>
                    <option value="moderator">Moderator</option>
                    <option value="support_admin">Support admin</option>
                    <option value="finance_admin">Finance admin</option>
                    <option value="super_admin">Super admin</option>
                  </select>
                </label>
                <label className={styles.field}>
                  Access
                  <select name="active" defaultValue={String(active)}>
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>
              </>
            ) : null}
            <label className={styles.field}>
              Reason / internal note
              <textarea
                name="reason"
                autoFocus
                required
                minLength={5}
                maxLength={1000}
                placeholder="Explain why this change is needed. Do not include passwords, codes or tokens."
              />
            </label>
            {currentState.message ? (
              <div
                role="status"
                className={`${styles.feedback} ${currentState.ok ? styles.feedbackOk : ""}`}
              >
                {currentState.message}
              </div>
            ) : null}
            <div className={styles.dialogFooter}>
              <button
                className={styles.button}
                type="button"
                disabled={pending}
                onClick={() => dialog.current?.close()}
              >
                {currentState.ok ? "Close" : "Cancel"}
              </button>
              {!currentState.ok ? <Submit label="Confirm change" /> : null}
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
