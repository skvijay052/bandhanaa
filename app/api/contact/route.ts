import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const contactSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Please enter a subject.")
    .max(150, "Your subject is too long.")
    .refine((value) => !/[\r\n]/.test(value), "Please enter a valid subject."),
  message: z
    .string()
    .trim()
    .min(10, "Please describe how we can help.")
    .max(5000, "Your message is too long."),
});

const requiredEnvironmentKeys = [
  "BREVO_SMTP_HOST",
  "BREVO_SMTP_PORT",
  "BREVO_SMTP_USER",
  "BREVO_SMTP_KEY",
  "BREVO_FROM_EMAIL",
  "BANDHANAA_SUPPORT_EMAIL",
] as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return jsonError("Your session has expired. Please sign in again.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Please enter a valid support request.", 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Please check your message.",
      400,
    );
  }

  const { subject, message } = parsed.data;
  const { data: ticketId, error: ticketError } = await supabase.rpc(
    "submit_support_request",
    {
      p_subject: subject,
      p_body: message,
    },
  );
  if (ticketError || typeof ticketId !== "string") {
    return jsonError(
      ticketError?.code === "P0001"
        ? "Please wait before submitting another request."
        : "We couldn't save your request. Please try again.",
      ticketError?.code === "P0001" ? 429 : 503,
    );
  }
  async function delivery(status: "sent" | "failed") {
    try {
      const { error } = await createAdminClient()
        .from("support_requests")
        .update({ email_delivery_status: status })
        .eq("id", ticketId);
      if (error)
        console.error("Support delivery status could not be saved", {
          code: error.code,
        });
    } catch {
      console.error("Support delivery tracking is not configured");
    }
  }
  const savedResponse = () =>
    NextResponse.json({
      ok: true,
      message: "Your request has been received by Bandhanaa Support.",
    });
  const missingKey = requiredEnvironmentKeys.find((key) => !process.env[key]);
  if (missingKey) {
    console.error("Contact email configuration is missing:", missingKey);
    await delivery("failed");
    return savedResponse();
  }

  const port = Number(process.env.BREVO_SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    console.error(
      "Contact email configuration has an invalid BREVO_SMTP_PORT.",
    );
    await delivery("failed");
    return savedResponse();
  }

  const submittedAt = new Date();
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    await transporter.sendMail({
      from: `Bandhanaa Support <${process.env.BREVO_FROM_EMAIL}>`,
      to: process.env.BANDHANAA_SUPPORT_EMAIL,
      replyTo: user.email,
      subject: `Bandhanaa Support: ${subject}`,
      text: [
        "New Bandhanaa Support Request",
        "",
        `Account Email: ${user.email}`,
        `User ID: ${user.id}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
        "",
        `Submitted At: ${submittedAt.toISOString()}`,
      ].join("\n"),
      html: `<h2>New Bandhanaa Support Request</h2>
        <p><strong>Account Email:</strong> ${escapeHtml(user.email)}</p>
        <p><strong>User ID:</strong> ${escapeHtml(user.id)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <p><strong>Submitted At:</strong> ${escapeHtml(submittedAt.toISOString())}</p>`,
    });

    await delivery("sent");
    return NextResponse.json({
      ok: true,
      message: "Your message has been sent to Bandhanaa Support.",
    });
  } catch (error) {
    console.error("Contact email delivery failed", {
      userId: user.id,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    await delivery("failed");
    return savedResponse();
  }
}
