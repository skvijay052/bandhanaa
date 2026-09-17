export const adminRoles = [
  "super_admin",
  "moderator",
  "support_admin",
  "finance_admin",
] as const;
export type AdminRole = (typeof adminRoles)[number];
export const sectionPermissions = {
  overview: ["super_admin"],
  users: ["super_admin", "moderator", "support_admin"],
  verification: ["super_admin", "moderator"],
  reports: ["super_admin", "moderator"],
  connections: ["super_admin", "moderator"],
  referrals: ["super_admin"],
  "chat-credits": ["super_admin", "finance_admin"],
  payments: ["super_admin", "finance_admin"],
  support: ["super_admin", "support_admin"],
  audit: ["super_admin"],
  settings: ["super_admin"],
  admins: ["super_admin"],
} as const satisfies Record<string, readonly AdminRole[]>;
export type AdminSection = keyof typeof sectionPermissions;
export function canAccess(role: AdminRole, section: AdminSection) {
  return (sectionPermissions[section] as readonly AdminRole[]).includes(role);
}
export function adminHome(role: AdminRole) {
  return {
    super_admin: "/admin",
    moderator: "/admin/users",
    support_admin: "/admin/support",
    finance_admin: "/admin/payments",
  }[role];
}
export const actionPermissions = {
  suspend: ["super_admin", "moderator"],
  restore: ["super_admin", "moderator"],
  approve: ["super_admin", "moderator"],
  reject: ["super_admin", "moderator"],
  report: ["super_admin", "moderator"],
  adjust: ["super_admin", "finance_admin"],
  support: ["super_admin", "support_admin"],
  admin: ["super_admin"],
} as const satisfies Record<string, readonly AdminRole[]>;
export type AdminAction = keyof typeof actionPermissions;
export function canAct(role: AdminRole, action: AdminAction) {
  return (actionPermissions[action] as readonly AdminRole[]).includes(role);
}
