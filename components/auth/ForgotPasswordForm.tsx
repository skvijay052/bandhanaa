"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { RecoveryButton, RecoveryInput } from "./RecoveryFields";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"•".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);
  async function sendReset(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (loading || cooldown > 0) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return setError("Email address is required.");
    if (!emailPattern.test(normalizedEmail))
      return setError("Enter a valid email address.");
    setError("");
    setLoading(true);
    try {
      const { error: resetError } =
        await createClient().auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${getSiteUrl()}/reset-password`,
        });
      if (resetError) throw resetError;
      setEmail(normalizedEmail);
      setSentTo(normalizedEmail);
      setCooldown(30);
    } catch {
      setError(
        "We couldn't send the reset email. Check your connection and try again shortly.",
      );
    } finally {
      setLoading(false);
    }
  }
  if (sentTo)
    return (
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.02em]">
          Check your email
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#536471]">
          If an account exists for this email, we&apos;ve sent a password reset
          link.
        </p>
        <p className="mt-4 rounded-[10px] border border-[#cfd9de] bg-[#f7f9f9] px-4 py-3 text-center text-[14px] font-semibold">
          {maskEmail(sentTo)}
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-[13px] text-red-600">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          disabled={loading || cooldown > 0}
          onClick={() => void sendReset()}
          className="mt-6 h-12 w-full rounded-full border border-[#cfd9de] bg-white text-[15px] font-bold transition-colors duration-150 hover:bg-[#eff3f4] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Sending..."
            : cooldown > 0
              ? `Resend email (${cooldown}s)`
              : "Resend email"}
        </button>
        <Link
          href="/login"
          className="mt-4 flex h-12 items-center justify-center text-[14px] font-semibold text-[#1d9bf0] hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  return (
    <div>
      <h1 className="text-[30px] font-bold tracking-[-0.02em]">
        Forgot password?
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-[#536471]">
        Enter the email associated with your Bandhanaa account.
      </p>
      <form noValidate onSubmit={sendReset} className="mt-8 space-y-5">
        <RecoveryInput
          id="recovery-email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={error}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
        />
        <RecoveryButton loading={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </RecoveryButton>
      </form>
      <Link
        href="/login"
        className="mt-6 flex justify-center text-[14px] font-semibold text-[#1d9bf0] hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
}
