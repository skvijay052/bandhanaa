"use client";

import Link from "next/link";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { verificationEmailStorageKey } from "@/lib/auth-verification";

const OTP_LENGTH = 6;
type VerificationState = "idle" | "verifying" | "verified" | "resending";

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"*".repeat(Math.max(3, name.length - 2))}@${domain}`;
}

function friendlyOtpError(message: string) {
  if (/expired/i.test(message))
    return "This verification code has expired. Request a new code.";
  if (/invalid|token|otp/i.test(message))
    return "The verification code is incorrect.";
  if (/already|confirmed/i.test(message))
    return "This email is already verified. You can sign in.";
  return "We couldn't verify this code. Please try again.";
}

export function VerifyEmailForm() {
  const router = useRouter();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [email, setEmail] = useState("");
  const [restored, setRestored] = useState(false);
  const [otp, setOtp] = useState("");
  const [state, setState] = useState<VerificationState>("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    setEmail(sessionStorage.getItem(verificationEmailStorageKey) ?? "");
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!email || countdown <= 0) return;
    const timer = window.setInterval(
      () => setCountdown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [countdown, email]);

  function setDigits(value: string, focusIndex?: number) {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(digits);
    setError("");
    setNotice("");
    if (focusIndex !== undefined)
      inputs.current[Math.min(focusIndex, OTP_LENGTH - 1)]?.focus();
  }

  function handleChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      setDigits(
        `${otp.slice(0, index)}${digits}${otp.slice(index + digits.length)}`,
        index + digits.length,
      );
      return;
    }
    const next = Array.from({ length: OTP_LENGTH }, (_, digitIndex) =>
      digitIndex === index ? digits : (otp[digitIndex] ?? ""),
    );
    setDigits(next.join(""), digits ? index + 1 : index);
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !otp[index] && index > 0)
      inputs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0)
      inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1)
      inputs.current[index + 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    setDigits(event.clipboardData.getData("text"), OTP_LENGTH - 1);
  }

  async function verify() {
    if (state !== "idle") return;
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the complete ${OTP_LENGTH}-digit verification code.`);
      return;
    }
    setState("verifying");
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (verifyError) {
        setError(friendlyOtpError(verifyError.message));
        setState("idle");
        return;
      }
      if (!data.session) {
        setError(
          "Verification succeeded, but a session could not be established. Please sign in.",
        );
        setState("idle");
        return;
      }
      setState("verified");
      sessionStorage.removeItem(verificationEmailStorageKey);
      router.replace("/discover");
      router.refresh();
    } catch {
      setError(
        "Unable to connect. Check your internet connection and try again.",
      );
      setState("idle");
    }
  }

  async function resend() {
    if (!email || countdown > 0 || state !== "idle") return;
    setState("resending");
    setError("");
    setNotice("");
    try {
      const { error: resendError } = await createClient().auth.resend({
        type: "signup",
        email,
      });
      if (resendError) {
        setError(
          /rate|limit/i.test(resendError.message)
            ? "Please wait before requesting another code."
            : "We couldn't resend the code. Please try again.",
        );
        setState("idle");
        return;
      }
      setOtp("");
      setCountdown(60);
      setNotice("New verification code sent.");
      setState("idle");
      inputs.current[0]?.focus();
    } catch {
      setError(
        "Unable to connect. Check your internet connection and try again.",
      );
      setState("idle");
    }
  }

  if (!restored)
    return <p className="text-[14px] text-[#536471]">Loading verification…</p>;

  if (!email)
    return (
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.02em]">
          Verification session unavailable
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#536471]">
          We couldn&apos;t determine which email to verify. Please register
          again.
        </p>
        <Link
          href="/register"
          className="mt-8 flex h-12 items-center justify-center rounded-full bg-[#1d9bf0] text-[15px] font-bold text-white hover:bg-[#1a8cd8]"
        >
          Back to registration
        </Link>
      </div>
    );

  return (
    <div>
      <h1 className="text-[30px] font-bold tracking-[-0.02em]">
        Verify your email
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-[#536471]">
        We sent a verification code to
        <br />
        <strong className="font-semibold text-[#0f1419]">
          {maskEmail(email)}
        </strong>
      </p>
      <div className="mt-8" onPaste={handlePaste}>
        <div
          className="flex justify-between gap-2"
          role="group"
          aria-label="Email verification code"
        >
          {Array.from({ length: OTP_LENGTH }, (_, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              value={otp[index] ?? ""}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Verification code digit ${index + 1}`}
              className={`min-w-0 size-12 rounded-[10px] border text-center text-xl font-semibold outline-none transition-colors duration-150 focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] sm:size-[52px] ${error ? "border-red-500" : "border-[#cfd9de]"}`}
            />
          ))}
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-[13px] text-red-600">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="mt-3 text-[13px] text-emerald-700">
            {notice}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => void verify()}
        disabled={state !== "idle" || otp.length !== OTP_LENGTH}
        className="mt-6 h-12 w-full rounded-full bg-[#1d9bf0] text-[15px] font-bold text-white transition-colors duration-150 hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "verifying"
          ? "Verifying..."
          : state === "verified"
            ? "Verified"
            : "Verify email"}
      </button>
      <div className="mt-6 text-center text-[14px] text-[#536471]">
        <span>Didn&apos;t receive the code? </span>
        <button
          type="button"
          onClick={() => void resend()}
          disabled={countdown > 0 || state !== "idle"}
          className="font-semibold text-[#1d9bf0] disabled:text-[#8b98a5]"
        >
          {state === "resending"
            ? "Resending..."
            : countdown > 0
              ? `Resend code in ${countdown}s`
              : "Resend code"}
        </button>
      </div>
      <Link
        href="/register"
        className="mt-5 flex justify-center text-[14px] font-semibold text-[#536471] hover:text-[#0f1419]"
      >
        Use a different email
      </Link>
    </div>
  );
}
