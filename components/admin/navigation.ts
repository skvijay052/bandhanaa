import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  ShieldAlert,
  Link2,
  Gift,
  Coins,
  CreditCard,
  LifeBuoy,
  ScrollText,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import type { AdminSection } from "@/lib/admin/permissions";
export const navigation = [
  { key: "overview", label: "Overview", group: "", icon: LayoutDashboard },
  { key: "users", label: "Users", group: "Management", icon: Users },
  {
    key: "verification",
    label: "Verification",
    group: "Management",
    icon: BadgeCheck,
  },
  {
    key: "reports",
    label: "Reports & Safety",
    group: "Management",
    icon: ShieldAlert,
  },
  {
    key: "connections",
    label: "Connections",
    group: "Engagement",
    icon: Link2,
  },
  { key: "referrals", label: "Referrals", group: "Engagement", icon: Gift },
  {
    key: "chat-credits",
    label: "Chat Credits",
    group: "Engagement",
    icon: Coins,
  },
  { key: "payments", label: "Payments", group: "Business", icon: CreditCard },
  {
    key: "support",
    label: "Support Requests",
    group: "Support",
    icon: LifeBuoy,
  },
  { key: "audit", label: "Audit Logs", group: "System", icon: ScrollText },
  { key: "settings", label: "Settings", group: "System", icon: Settings2 },
  {
    key: "admins",
    label: "Admins & Roles",
    group: "Super admin",
    icon: ShieldCheck,
  },
] satisfies {
  key: AdminSection;
  label: string;
  group: string;
  icon: typeof Users;
}[];
export function sectionHref(key: AdminSection) {
  return key === "overview" ? "/admin" : `/admin/${key}`;
}
