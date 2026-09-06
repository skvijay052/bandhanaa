import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Row = Record<string, unknown>;
type PdfRow = { label: string; value: string };
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const INK = rgb(0.055, 0.063, 0.082);
const MUTED = rgb(0.38, 0.42, 0.49);
const BORDER = rgb(0.9, 0.91, 0.94);
const SOFT = rgb(0.975, 0.968, 0.985);
const PINK = rgb(0.95, 0.12, 0.43);
const labels: Record<string, string> = {
  display_name: "Full Name",
  birth_date: "Date of Birth",
  mother_tongue: "Mother Tongue",
  marital_status: "Marital Status",
  avatar_url: "Profile Photo",
  profile_visibility: "Profile Visibility",
  profile_completion: "Profile Completion",
  is_discoverable: "Discoverable",
  last_seen_at: "Last Seen",
  created_at: "Created",
  updated_at: "Last Updated",
  email_verified: "Email Verified",
  account_created: "Account Created",
  last_sign_in: "Last Sign In",
};

function titleCase(key: string) {
  return (
    labels[key] ??
    key.replaceAll("_", " ").replace(/\b\w/g, (value) => value.toUpperCase())
  );
}

function printable(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not added";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value))
    return value.length ? value.map(printable).join(", ") : "Not added";
  if (typeof value === "object") {
    return Object.entries(value as Row)
      .map(([key, item]) => `${titleCase(key)}: ${printable(item)}`)
      .join("; ");
  }
  return String(value);
}

function pdfSafe(value: string) {
  return value.replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
}

function wrapText(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of pdfSafe(text).split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const originalWord of words) {
      const chunks: string[] = [];
      let word = originalWord;
      while (font.widthOfTextAtSize(word, size) > width) {
        let cut = Math.max(
          1,
          Math.floor(
            (word.length * width) / font.widthOfTextAtSize(word, size),
          ),
        );
        while (
          cut > 1 &&
          font.widthOfTextAtSize(word.slice(0, cut), size) > width
        )
          cut -= 1;
        chunks.push(word.slice(0, cut));
        word = word.slice(cut);
      }
      if (word) chunks.push(word);
      for (const chunk of chunks) {
        const candidate = line ? `${line} ${chunk}` : chunk;
        if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
        else {
          if (line) lines.push(line);
          line = chunk;
        }
      }
    }
    lines.push(line || " ");
  }
  return lines;
}

function objectRows(value: Row, excluded: string[] = []): PdfRow[] {
  const excludedKeys = new Set(excluded);
  return Object.entries(value)
    .filter(([key]) => !excludedKeys.has(key))
    .map(([key, item]) => ({ label: titleCase(key), value: printable(item) }));
}

function structuredRows(value: unknown): PdfRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      if (item && typeof item === "object") {
        const row = item as Row;
        if (typeof row.label === "string") {
          return [{ label: row.label, value: printable(row.value) }];
        }
        return [{ label: `Item ${index + 1}`, value: printable(row) }];
      }
      return [{ label: `Item ${index + 1}`, value: printable(item) }];
    });
  }
  if (value && typeof value === "object") return objectRows(value as Row);
  return [{ label: "Details", value: printable(value) }];
}

async function createProfilePdf(exportData: Row) {
  const document = await PDFDocument.create();
  document.setTitle("Bandhanaa Profile Data");
  document.setAuthor("Bandhanaa");
  document.setSubject("Private account data export");
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const italic = await document.embedFont(StandardFonts.HelveticaOblique);
  const profile = exportData.profile as Row;
  const account = exportData.account as Row;
  const privacy = exportData.privacy as Row;
  const activity = exportData.activity as Row;
  let page!: PDFPage;
  let y = 0;
  let pageNumber = 0;

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNumber += 1;
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 7,
      width: PAGE_WIDTH,
      height: 7,
      color: PINK,
    });
    page.drawText("Bandhanaa", {
      x: MARGIN,
      y: PAGE_HEIGHT - 38,
      font: bold,
      size: 17,
      color: INK,
    });
    page.drawText("PRIVATE DATA EXPORT", {
      x: PAGE_WIDTH - MARGIN - 103,
      y: PAGE_HEIGHT - 34,
      font: bold,
      size: 7.5,
      color: MUTED,
    });
    page.drawLine({
      start: { x: MARGIN, y: PAGE_HEIGHT - 51 },
      end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 51 },
      thickness: 0.7,
      color: BORDER,
    });
    page.drawText(`Page ${pageNumber}`, {
      x: PAGE_WIDTH - MARGIN - 32,
      y: 26,
      font: regular,
      size: 8,
      color: MUTED,
    });
    page.drawText("Confidential - for account owner only", {
      x: MARGIN,
      y: 26,
      font: regular,
      size: 8,
      color: MUTED,
    });
    y = PAGE_HEIGHT - 78;
  };
  const ensureSpace = (height: number) => {
    if (y - height < 50) addPage();
  };

  const drawSection = (
    heading: string,
    subtitle: string,
    sectionRows: PdfRow[],
  ) => {
    const usefulRows = sectionRows.filter((row) => row.value !== "Not added");
    if (!usefulRows.length) return;
    ensureSpace(67);
    page.drawRectangle({
      x: MARGIN,
      y: y - 33,
      width: CONTENT_WIDTH,
      height: 38,
      color: SOFT,
      borderColor: BORDER,
      borderWidth: 0.6,
    });
    page.drawRectangle({
      x: MARGIN,
      y: y - 33,
      width: 4,
      height: 38,
      color: PINK,
    });
    page.drawText(pdfSafe(heading), {
      x: MARGIN + 15,
      y: y - 11,
      font: bold,
      size: 12,
      color: INK,
    });
    page.drawText(pdfSafe(subtitle), {
      x: MARGIN + 15,
      y: y - 25,
      font: regular,
      size: 7.8,
      color: MUTED,
    });
    y -= 47;
    usefulRows.forEach((row, rowIndex) => {
      const valueLines = wrapText(row.value, regular, 9, CONTENT_WIDTH - 169);
      const rowHeight = Math.max(30, valueLines.length * 12 + 12);
      ensureSpace(rowHeight + 3);
      if (rowIndex % 2 === 0)
        page.drawRectangle({
          x: MARGIN,
          y: y - rowHeight + 6,
          width: CONTENT_WIDTH,
          height: rowHeight,
          color: rgb(0.992, 0.992, 0.995),
        });
      page.drawText(pdfSafe(row.label), {
        x: MARGIN + 12,
        y: y - 9,
        font: bold,
        size: 8.7,
        color: rgb(0.25, 0.28, 0.34),
      });
      valueLines.forEach((line, index) =>
        page.drawText(line, {
          x: MARGIN + 169,
          y: y - 9 - index * 12,
          font: regular,
          size: 9,
          color: INK,
        }),
      );
      y -= rowHeight;
    });
    y -= 19;
  };

  addPage();
  page.drawRectangle({
    x: MARGIN,
    y: y - 136,
    width: CONTENT_WIDTH,
    height: 136,
    color: INK,
  });
  page.drawCircle({
    x: PAGE_WIDTH - MARGIN - 39,
    y: y - 36,
    size: 17,
    color: PINK,
  });
  page.drawText("B", {
    x: PAGE_WIDTH - MARGIN - 45,
    y: y - 43,
    font: bold,
    size: 20,
    color: rgb(1, 1, 1),
  });
  page.drawText("MY PROFILE", {
    x: MARGIN + 24,
    y: y - 32,
    font: bold,
    size: 9,
    color: rgb(0.96, 0.62, 0.75),
  });
  page.drawText(pdfSafe(printable(profile.display_name)), {
    x: MARGIN + 24,
    y: y - 63,
    font: bold,
    size: 24,
    color: rgb(1, 1, 1),
  });
  page.drawText(pdfSafe(printable(account.email)), {
    x: MARGIN + 24,
    y: y - 83,
    font: regular,
    size: 9.5,
    color: rgb(0.82, 0.84, 0.88),
  });
  const location = [profile.city, profile.state, profile.country]
    .filter(Boolean)
    .map(printable)
    .join(", ");
  page.drawText(pdfSafe(location || "Location not added"), {
    x: MARGIN + 24,
    y: y - 103,
    font: regular,
    size: 9.5,
    color: rgb(0.82, 0.84, 0.88),
  });
  page.drawText(
    "A complete copy of your Bandhanaa account and profile information.",
    {
      x: MARGIN + 24,
      y: y - 122,
      font: italic,
      size: 8.5,
      color: rgb(0.7, 0.72, 0.78),
    },
  );
  y -= 157;

  const summary = [
    ["PROFILE", `${printable(profile.profile_completion)}% complete`],
    ["STATUS", profile.is_discoverable === false ? "Hidden" : "Discoverable"],
    ["MEMBER SINCE", printable(account.account_created).slice(0, 10)],
  ];
  const cardWidth = (CONTENT_WIDTH - 16) / 3;
  summary.forEach(([label, value], index) => {
    const x = MARGIN + index * (cardWidth + 8);
    page.drawRectangle({
      x,
      y: y - 54,
      width: cardWidth,
      height: 54,
      color: SOFT,
      borderColor: BORDER,
      borderWidth: 0.6,
    });
    page.drawText(label, {
      x: x + 12,
      y: y - 18,
      font: bold,
      size: 7,
      color: PINK,
    });
    page.drawText(pdfSafe(value), {
      x: x + 12,
      y: y - 37,
      font: bold,
      size: 10,
      color: INK,
    });
  });
  y -= 78;

  drawSection(
    "Account",
    "Login, verification and account dates",
    objectRows(account),
  );
  drawSection(
    "Profile Details",
    "Your personal and professional information",
    objectRows(profile, [
      "id",
      "email",
      "avatar_url",
      "photos",
      "lifestyle",
      "family",
      "partner_preferences",
      "horoscope",
      "visibility_details",
    ]),
  );
  drawSection(
    "Photos",
    "Links to your uploaded profile media",
    (Array.isArray(profile.photos) ? profile.photos : []).map(
      (photo, index) => ({
        label: `Photo ${index + 1}`,
        value: printable(photo),
      }),
    ),
  );
  drawSection(
    "Lifestyle",
    "Habits and lifestyle information",
    structuredRows(profile.lifestyle),
  );
  drawSection(
    "Family",
    "Family information added to your profile",
    structuredRows(profile.family),
  );
  drawSection(
    "Partner Preferences",
    "Your preferred match criteria",
    structuredRows(profile.partner_preferences),
  );
  drawSection(
    "Horoscope",
    "Saved birth and horoscope information",
    structuredRows(profile.horoscope),
  );
  drawSection(
    "Visibility",
    "Profile section visibility choices",
    structuredRows(profile.visibility_details),
  );
  drawSection(
    "Privacy",
    "Privacy and communication preferences",
    objectRows(privacy, ["user_id"]),
  );

  const activitySummary = Object.entries(activity).map(([key, value]) => ({
    label: titleCase(key),
    value: String(Array.isArray(value) ? value.length : 0),
  }));
  drawSection(
    "Activity Summary",
    "Interactions connected to your account",
    activitySummary,
  );
  Object.entries(activity).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length)
      drawSection(
        titleCase(key),
        "Detailed account activity records",
        structuredRows(value),
      );
  });

  await document.attach(
    JSON.stringify(exportData, null, 2),
    "bandhanaa-data.json",
    {
      mimeType: "application/json",
      description: "Complete machine-readable Bandhanaa profile export",
    },
  );
  return document.save();
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { message: "Please sign in to download your data." },
      { status: 401 },
    );

  const [
    profileResult,
    privacyResult,
    likesResult,
    shortlistResult,
    blocksResult,
    reportsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_privacy_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profile_likes")
      .select("liker_id,liked_id,status,created_at,responded_at")
      .or(`liker_id.eq.${user.id},liked_id.eq.${user.id}`),
    supabase
      .from("profile_shortlists")
      .select("profile_id,created_at")
      .eq("user_id", user.id),
    supabase
      .from("blocked_users")
      .select("blocked_id,created_at")
      .eq("blocker_id", user.id),
    supabase
      .from("member_reports")
      .select("reported_id,reason,details,status,created_at")
      .eq("reporter_id", user.id),
  ]);
  if (profileResult.error)
    return Response.json(
      { message: "We couldn't load your profile data." },
      { status: 500 },
    );

  const exportData: Row = {
    exported_at: new Date().toISOString(),
    account: {
      user_id: user.id,
      email: user.email ?? "",
      email_verified: Boolean(user.email_confirmed_at),
      account_created: user.created_at,
      last_sign_in: user.last_sign_in_at ?? "Not available",
    },
    profile: profileResult.data ?? {},
    privacy: privacyResult.data ?? {},
    activity: {
      interests: likesResult.data ?? [],
      shortlisted_profiles: shortlistResult.data ?? [],
      blocked_profiles: blocksResult.data ?? [],
      submitted_reports: reportsResult.data ?? [],
    },
  };
  const bytes = await createProfilePdf(exportData);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bandhanaa-profile-data-${date}.pdf"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
