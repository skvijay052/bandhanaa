"use client";

import { useState } from "react";

export function ContactSupportForm({ email }: { email: string }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) { setError("Please enter a subject and message."); return; }
    setError("");
    window.location.href = `mailto:support@bandhanaa.com?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(`${message.trim()}\n\nAccount email: ${email}`)}`;
  }
  return <form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-[14px] font-normal">Account email<input value={email} readOnly className="form-control block bg-[#f7f9f9]" /></label><label className="block text-[14px] font-normal">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What do you need help with?" className="form-control block" /></label><label className="block text-[14px] font-normal">Message<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe the issue in detail" className="form-textarea block" /></label>{error ? <p role="alert" className="text-[13px] text-[#f4212e]">{error}</p> : null}<button type="submit" className="h-11 rounded-full bg-[#1d9bf0] px-6 text-[14px] font-semibold text-white hover:bg-[#1689df]">Contact Support</button></form>;
}
