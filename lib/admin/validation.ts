import { z } from "zod";
export const reason = z
  .string()
  .trim()
  .min(5, "Please give a reason of at least 5 characters.")
  .max(1000);
const uuid = z.uuid();
export const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("suspend"), target: uuid, reason }),
  z.object({ action: z.literal("restore"), target: uuid, reason }),
  z.object({
    action: z.literal("approve"),
    target: uuid,
    reason,
    expected: z.enum(["pending", "rejected", "verified"]),
  }),
  z.object({
    action: z.literal("reject"),
    target: uuid,
    reason,
    expected: z.enum(["pending", "rejected", "verified"]),
  }),
  z.object({
    action: z.literal("report"),
    target: z.string().regex(/^[1-9]\d{0,18}$/),
    reason,
    expected: z.enum(["submitted", "reviewing", "resolved", "dismissed"]),
    status: z.enum(["reviewing", "resolved", "dismissed"]),
  }),
  z.object({
    action: z.literal("adjust"),
    target: uuid,
    reason,
    amount: z.coerce
      .number()
      .int()
      .min(-10000)
      .max(10000)
      .refine((v) => v !== 0),
    request_id: uuid,
  }),
  z.object({
    action: z.literal("support"),
    target: uuid,
    reason,
    expected: z.enum(["open", "in_review", "resolved"]),
    status: z.enum(["in_review", "resolved"]),
  }),
  z.object({
    action: z.literal("admin"),
    target: uuid,
    reason,
    role: z.enum([
      "super_admin",
      "moderator",
      "support_admin",
      "finance_admin",
    ]),
    active: z.enum(["true", "false"]).transform((v) => v === "true"),
  }),
]);
export const filterSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).catch(1),
  q: z.string().trim().max(100).catch(""),
  status: z.string().max(40).catch(""),
  verification: z
    .enum(["", "pending", "verified", "rejected", "not_submitted"])
    .catch(""),
  gender: z.enum(["", "man", "woman", "male", "female"]).catch(""),
  reason: z
    .enum([
      "",
      "inappropriate_photos",
      "abusive_behavior",
      "fake_profile",
      "scam_or_fraud",
      "other",
    ])
    .catch(""),
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
  range: z.enum(["today", "7", "30", "custom"]).catch("30"),
  trend: z.enum(["7", "30", "90"]).catch("30"),
  id: z.uuid().optional().catch(undefined),
  tab: z
    .enum([
      "overview",
      "profile",
      "connections",
      "credits",
      "payments",
      "reports",
      "activity",
    ])
    .catch("overview"),
});
