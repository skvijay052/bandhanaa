"use client";

import { useState } from "react";

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
      {notice ? (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`text-[13px] ${notice.type === "error" ? "text-[#f4212e]" : "text-emerald-600"}`}
        >
          {notice.message}
        </p>
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
