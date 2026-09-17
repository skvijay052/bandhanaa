// Run after npm run build using the local test URL/key documented in admin-setup.md.
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
if (
  !process.env.PLAYWRIGHT_MODULE_PATH ||
  !process.env.CHROMIUM_EXECUTABLE_PATH
)
  throw new Error(
    "Set PLAYWRIGHT_MODULE_PATH and CHROMIUM_EXECUTABLE_PATH to local test dependencies.",
  );
const { chromium } = await import(
  pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href
);
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-test-publishable-key",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};
const adapter = spawn(process.execPath, ["scripts/admin/preview-server.mjs"], {
  env,
  stdio: ["ignore", "pipe", "pipe"],
});
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    process.env.ADMIN_BROWSER_SERVER === "dev" ? "dev" : "start",
    "--hostname",
    "127.0.0.1",
  ],
  { env, stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
for (const p of [adapter, server]) {
  p.stdout.on("data", (d) => (logs += d));
  p.stderr.on("data", (d) => (logs += d));
}
let browser;
try {
  for (let i = 0; i < 120; i++) {
    try {
      const a = await fetch("http://127.0.0.1:54329/auth/v1/user");
      const s = await fetch("http://localhost:3000/admin/sign-in");
      if (a.status === 401 && s.ok) break;
    } catch {}
    await delay(200);
    if (i === 119) throw new Error("Preview startup failed:\n" + logs);
  }
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) =>
    errors.push({ url: page.url(), message: e.message }),
  );
  async function signIn(role) {
    await page.goto("http://localhost:3000/admin/sign-in");
    await page.getByLabel("Email address").fill(`${role}@example.test`);
    await page.getByLabel("Password", { exact: true }).fill("local-test-only");
    await page
      .getByRole("button", { name: "Sign in to admin", exact: true })
      .click();
  }
  await page.goto("http://localhost:3000/admin");
  assert.ok(page.url().endsWith("/admin/sign-in"));
  await signIn("member");
  await page
    .getByText("This account does not have active administrator access.", {
      exact: true,
    })
    .waitFor();
  await signIn("super_admin");
  await page.waitForURL("http://localhost:3000/admin");
  await page.getByRole("heading", { name: "Overview", exact: true }).waitFor();
  assert.equal(
    await page.locator(".app-shell,.app-sidebar,.route-progress").count(),
    0,
  );
  await page.screenshot({
    path: "/tmp/bandhanaa-admin-desktop.png",
    fullPage: true,
  });
  const sections = {
    users: "Users",
    verification: "Verification",
    reports: "Reports & Safety",
    connections: "Connections",
    referrals: "Referrals",
    "chat-credits": "Chat Credits",
    payments: "Payments",
    support: "Support Requests",
    audit: "Audit Logs",
    settings: "Settings",
    admins: "Admins & Roles",
  };
  for (const [path, title] of Object.entries(sections)) {
    await page.goto(`http://localhost:3000/admin/${path}`);
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
  }
  await page.goto("http://localhost:3000/admin/users?q=Example+Member");
  await page.getByRole("link", { name: "View →", exact: true }).click();
  await page
    .getByRole("heading", { name: "Example Member", exact: true })
    .waitFor();
  const memberPath = page.url();
  await page
    .getByRole("button", { name: "Suspend account", exact: true })
    .click();
  const suspend = page.getByRole("dialog");
  await suspend
    .getByLabel("Reason / internal note")
    .fill("Local browser verification of the suspension workflow");
  await suspend.getByRole("button", { name: "Confirm change" }).click();
  await page
    .getByRole("button", { name: "Restore account", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Restore account", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Reason / internal note")
    .fill("Restoring the synthetic account after browser verification");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm change" })
    .click();
  await page
    .getByRole("button", { name: "Suspend account", exact: true })
    .waitFor();
  await page.getByRole("link", { name: "Credits", exact: true }).click();
  await page
    .getByRole("heading", { name: "Current balance: 15 credits", exact: true })
    .waitFor();
  await page
    .getByRole("link", { name: "Open balance and adjustments", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Adjust credits", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount", { exact: true }).fill("5");
  await dialog
    .getByLabel("Reason / internal note")
    .fill("Local browser verification of an audited credit adjustment");
  await dialog.getByRole("button", { name: "Confirm change" }).click();
  await dialog.getByRole("status").waitFor();
  assert.match(await dialog.getByRole("status").innerText(), /Saved/);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByText("20 credits", { exact: true })
    .filter({ visible: true })
    .waitFor();
  // A fresh dialog must not retain success state or the previous request ID.
  await page
    .getByRole("button", { name: "Adjust credits", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm change" })
    .waitFor();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await page.goto("http://localhost:3000/admin/reports");
  await page.getByRole("link", { name: "View →", exact: true }).click();
  await page
    .getByRole("heading", { name: "Safety report #1", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Resolve", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Reason / internal note")
    .fill("Synthetic report reviewed and resolved during browser verification");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm change" })
    .click();
  await page.getByText("Resolved", { exact: true }).waitFor();
  await page.goto("http://localhost:3000/admin?range=custom");
  await page
    .getByRole("button", { name: "Apply custom range", exact: true })
    .waitFor();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("http://localhost:3000/admin");
  await page.getByRole("heading", { name: "Overview", exact: true }).waitFor();
  await page.screenshot({
    path: "/tmp/bandhanaa-admin-mobile.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    "Mobile page should not overflow horizontally",
  );
  await page
    .getByRole("button", { name: "Open administration menu", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Administration menu", exact: true })
    .getByRole("link", { name: "Users", exact: true })
    .click();
  await page.getByRole("heading", { name: "Users", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("dialog", { name: "Administration menu", exact: true })
      .isVisible(),
    false,
  );
  await page.screenshot({
    path: "/tmp/bandhanaa-admin-mobile-users.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    "Mobile user table should scroll inside its panel",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/admin/sign-in");
  await signIn("moderator");
  await page.waitForURL("**/admin/users");
  assert.equal(
    await page.getByRole("link", { name: "Payments", exact: true }).count(),
    0,
  );
  await page.goto("http://localhost:3000/admin/payments");
  assert.ok(
    !(await page.locator("body").innerText()).includes(
      "Review payment orders and confirmed credit purchases.",
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "Browser checks passed: normal-member denial, all admin sections, suspend/restore, credit adjustment/reopen, report resolution, custom dates, 375px layout and drawer, role restriction, sign-out, no client errors.",
  );
} catch (error) {
  console.error(logs.slice(-4000));
  throw error;
} finally {
  await browser?.close();
  adapter.kill();
  server.kill();
}
