"use client";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { signInAdmin } from "@/lib/admin/actions";
import styles from "./admin.module.css";
export function AdminSignIn() {
  const [state, action, pending] = useActionState(signInAdmin, {
    ok: false,
    message: "",
  });
  return (
    <main className={styles.login}>
      <div className={styles.loginCard}>
        <Image
          src="/bandhanaa-logo-new.svg"
          width={155}
          height={45}
          alt="Bandhanaa"
          priority
        />
        <h1>Admin workspace</h1>
        <p>Sign in with your authorized Bandhanaa account.</p>
        <form action={action}>
          <label className={styles.field}>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </label>
          <label className={styles.field}>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              maxLength={512}
            />
          </label>
          {state.message ? (
            <div role="alert" className={styles.feedback}>
              {state.message}
            </div>
          ) : null}
          <button
            className={`${styles.button} ${styles.primary}`}
            disabled={pending}
          >
            {pending ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>
        <div className={styles.loginFoot}>
          <LockKeyhole size={13} /> Access is restricted to authorized
          administrators.
        </div>
        <p className={styles.small} style={{ marginTop: 20 }}>
          <Link href="/">Return to Bandhanaa</Link>
        </p>
      </div>
    </main>
  );
}
