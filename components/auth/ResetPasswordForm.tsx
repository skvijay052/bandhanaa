"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecoveryButton, RecoveryPassword } from "./RecoveryFields";

type FieldErrors = { password?: string; confirm?: string; form?: string };

export function ResetPasswordForm() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let active = true;
    async function establishRecoverySession() {
      const url = new URL(window.location.href);
      const urlError =
        url.searchParams.get("error_description") ||
        new URLSearchParams(url.hash.slice(1)).get("error_description");
      if (urlError) {
        if (active) {
          setErrors({
            form: "The reset link has expired. Request a new password reset link.",
          });
          setChecking(false);
        }
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) window.history.replaceState({}, "", "/reset-password");
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (active) {
        setValidSession(Boolean(session));
        setChecking(false);
        if (!session)
          setErrors({
            form: "The reset link is invalid or has expired. Request a new password reset link.",
          });
      }
    }
    void establishRecoverySession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active || (event !== "PASSWORD_RECOVERY" && event !== "SIGNED_IN"))
          return;
        setValidSession(Boolean(session));
        setChecking(false);
        if (session) setErrors({});
      },
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!password) nextErrors.password = "New password is required.";
    else if (password.length < 8)
      nextErrors.password = "Password must be at least 8 characters.";
    if (!confirm) nextErrors.confirm = "Please confirm your new password.";
    else if (password !== confirm)
      nextErrors.confirm = "Passwords do not match.";
    if (!validSession)
      nextErrors.form =
        "The reset link is invalid or has expired. Request a new password reset link.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrors({
          form: /session|expired|token/i.test(error.message)
            ? "The reset link has expired. Request a new password reset link."
            : error.message,
        });
        return;
      }
      setPassword("");
      setConfirm("");
      setUpdated(true);
    } catch {
      setErrors({
        form: "Unable to connect. Check your internet connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (updated)
    return (
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.02em]">
          Password updated
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#536471]">
          Your password has been changed successfully.
        </p>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
            router.refresh();
          }}
          className="mt-8 h-12 w-full rounded-full bg-[#1d9bf0] px-5 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-[#1a8cd8]"
        >
          Continue to login
        </button>
      </div>
    );

  if (!checking && errors.form && !validSession)
    return (
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.02em]">
          Reset link expired
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#536471]">
          This password reset link is no longer valid.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 flex h-12 items-center justify-center rounded-full bg-[#1d9bf0] text-[15px] font-bold text-white transition-colors duration-150 hover:bg-[#1a8cd8]"
        >
          Request new reset link
        </Link>
      </div>
    );

  return (
    <div>
      <h1 className="text-[30px] font-bold tracking-[-0.02em]">
        Create new password
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-[#536471]">
        Choose a strong password for your Bandhanaa account.
      </p>
      {checking ? (
        <div
          role="status"
          className="mt-8 flex items-center gap-3 text-[14px] text-[#536471]"
        >
          <span className="size-5 animate-spin rounded-full border-2 border-[#1d9bf0] border-r-transparent" />
          Checking reset link...
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="mt-8 space-y-5">
          {errors.form ? (
            <p
              role="alert"
              className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
            >
              {errors.form}
            </p>
          ) : null}
          <RecoveryPassword
            id="new-password"
            label="New password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            error={errors.password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({
                ...current,
                password: undefined,
                form: undefined,
              }));
            }}
          />
          <RecoveryPassword
            id="confirm-password"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Enter your password again"
            value={confirm}
            error={errors.confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              setErrors((current) => ({
                ...current,
                confirm: undefined,
                form: undefined,
              }));
            }}
          />
          <RecoveryButton loading={loading}>
            {loading ? "Updating..." : "Update password"}
          </RecoveryButton>
        </form>
      )}
    </div>
  );
}
