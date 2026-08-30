"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const RecoveryInput = forwardRef<HTMLInputElement, InputProps>(
  function RecoveryInput({ label, id, error, className = "", ...props }, ref) {
    return (
      <div>
        <label
          htmlFor={id}
          className="mb-2 block text-[14px] font-semibold text-[#0f1419]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
          className={`h-12 w-full rounded-[10px] border bg-white px-4 text-[15px] outline-none transition-colors duration-150 placeholder:text-[#8b98a5] focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] ${error ? "border-red-500" : "border-[#cfd9de]"} ${className}`}
        />
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 text-[13px] text-red-600"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export const RecoveryPassword = forwardRef<HTMLInputElement, InputProps>(
  function RecoveryPassword({ label, id, error, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div>
        <label
          htmlFor={id}
          className="mb-2 block text-[14px] font-semibold text-[#0f1419]"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
            className={`h-12 w-full rounded-[10px] border bg-white px-4 pr-12 text-[15px] outline-none transition-colors duration-150 placeholder:text-[#8b98a5] focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] ${error ? "border-red-500" : "border-[#cfd9de]"}`}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[#536471] transition-colors duration-150 hover:bg-[#eff3f4] hover:text-[#0f1419]"
          >
            {visible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 text-[13px] text-red-600"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export function RecoveryButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-12 w-full items-center justify-center rounded-full bg-[#1d9bf0] px-5 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
