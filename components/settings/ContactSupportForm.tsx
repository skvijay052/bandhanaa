"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const SUBJECT_MAX_LENGTH = 150;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 5000;

export function ContactSupportForm({ email }: { email: string }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (notice?.type !== "success") return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    if (!cleanSubject) {
      setNotice({ type: "error", message: "Please enter a subject." });
      return;
    }
    if (
      cleanSubject.length > SUBJECT_MAX_LENGTH ||
      /[\r\n]/.test(cleanSubject)
    ) {
      setNotice({ type: "error", message: "Please enter a valid subject." });
      return;
    }
    if (cleanMessage.length < MESSAGE_MIN_LENGTH) {
      setNotice({
        type: "error",
        message: "Please describe how we can help.",
      });
      return;
    }
    if (cleanMessage.length > MESSAGE_MAX_LENGTH) {
      setNotice({ type: "error", message: "Your message is too long." });
      return;
    }

    setSending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: cleanSubject, message: cleanMessage }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        setNotice({
          type: "error",
          message:
            result?.message ??
            "We couldn't send your message. Please try again.",
        });
        return;
      }

      setSubject("");
      setMessage("");
      setNotice({
        type: "success",
        message: "Your message has been sent to Bandhanaa Support.",
      });
    } catch {
      setNotice({
        type: "error",
        message: "We couldn't send your message. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-[14px] font-normal">
        Account email
        <input
          value={email}
          readOnly
          className="form-control block bg-[#f7f9f9]"
        />
      </label>
      <label className="block text-[14px] font-normal">
        Subject
        <input
          value={subject}
          maxLength={SUBJECT_MAX_LENGTH}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="What do you need help with?"
          className="form-control block"
        />
      </label>
      <label className="block text-[14px] font-normal">
        Message
        <textarea
          value={message}
          maxLength={MESSAGE_MAX_LENGTH}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe the issue in detail"
          className="form-textarea block"
        />
      </label>
      {notice?.type === "error" ? (
        <p role="alert" className="text-[13px] text-[#f4212e]">
          {notice.message}
        </p>
      ) : null}
      {notice?.type === "success" ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-4 right-4 top-5 z-[100] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.18)] sm:left-auto sm:right-6 sm:mx-0"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <strong className="block text-[14px] font-semibold text-[#0f1419]">
              Message sent successfully
            </strong>
            <p className="mt-1 text-[13px] leading-5 text-[#536471]">
              {notice.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="grid size-8 shrink-0 place-items-center rounded-full text-[#536471] transition-colors hover:bg-[#f2f2f2] hover:text-black"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={sending}
        className="h-11 rounded-full bg-black px-6 text-[14px] font-semibold text-white hover:bg-[#222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "Sending..." : "Contact Support"}
      </button>
    </form>
  );
}
