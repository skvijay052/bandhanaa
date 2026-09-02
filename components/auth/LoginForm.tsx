"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { verificationEmailStorageKey } from "@/lib/auth-verification";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { PasswordField } from "./PasswordField";
import { GoogleButton } from "./GoogleButton";
import { FormFrame } from "./FormFrame";
function UserIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#62616c]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 20a6.5 6.5 0 0 1 13 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function friendly(message: string) {
  if (/invalid login/i.test(message))
    return "The email, mobile number, or password you entered is incorrect.";
  if (/email not confirmed/i.test(message))
    return "Please confirm your email before signing in.";
  return "We couldn't sign you in. Please try again shortly.";
}
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  async function submit(values: LoginValues) {
    setError("");
    const identifier = values.email.trim();
    const normalizedEmail = identifier.toLowerCase();
    const credentials = identifier.includes("@")
      ? { email: normalizedEmail, password: values.password }
      : { phone: identifier.replace(/[ ()-]/g, ""), password: values.password };
    try {
      const { error: authError } =
        await createClient().auth.signInWithPassword(credentials);
      if (authError) {
        if (
          identifier.includes("@") &&
          /email not confirmed/i.test(authError.message)
        ) {
          localStorage.setItem(verificationEmailStorageKey, normalizedEmail);
          router.push("/verify-email");
          return;
        }
        return setError(friendly(authError.message));
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Unable to connect. Check your internet connection and try again.",
      );
    }
  }
  return (
    <FormFrame mode="login">
      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="space-y-[19px]"
      >
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="form-label mb-2">
            Email / Mobile Number
          </label>
          <div className="relative">
            <UserIcon />
            <input
              id="email"
              autoComplete="username"
              placeholder="Enter email or mobile number"
              aria-invalid={!!errors.email || undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`auth-input ${errors.email ? "auth-input-invalid" : ""}`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="form-label mb-2">
            Password
          </label>
          <PasswordField
            id="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password")}
          />
          <Link
            href="/forgot-password"
            className="mt-2 block text-right text-[13px] text-accent hover:text-[#8144b5]"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="auth-button auth-button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 size-[18px] animate-spin rounded-full border-2 border-current border-r-transparent" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      <GoogleButton disabled={isSubmitting} onError={setError} />
    </FormFrame>
  );
}
