"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { error?: boolean; helperText?: string };

export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField({ error, helperText, className = "", ...props }, ref) {
  const [show, setShow] = useState(false);
  return <div>
    <div className="relative">
      <svg className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#77727e]" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/><path d="M12 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      <input {...props} ref={ref} type={show ? "text" : "password"} aria-invalid={error || undefined} aria-describedby={helperText ? `${props.id}-error` : undefined} className={`auth-input pr-12 ${error ? "auth-input-invalid" : ""} ${className}`} />
      <button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#62616c] hover:bg-black/[.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
        {show ? <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m4 4 16 16M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.3A10.5 10.5 0 0 1 12 5c5.5 0 9 7 9 7a16 16 0 0 1-2.1 3M6.6 6.7C4.3 8.2 3 12 3 12s3.5 7 9 7c1.3 0 2.5-.4 3.6-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> : <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>}
      </button>
    </div>
    {helperText && <p id={`${props.id}-error`} className={`mt-1 text-xs ${error ? "text-red-600" : "text-muted"}`}>{helperText}</p>}
  </div>;
});
