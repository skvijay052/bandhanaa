"use client";
import { usePathname } from "next/navigation";
import { PanelLeft, Search } from "lucide-react";
import { canAccess } from "@/lib/admin/permissions";
import type { AdminIdentity } from "@/lib/admin/types";
import { navigation } from "./navigation";
import { AdminMobileNav } from "./AdminMobileNav";
import styles from "./admin.module.css";
export function AdminHeader({
  admin,
  onCollapse,
  collapsed,
}: {
  admin: AdminIdentity;
  onCollapse: () => void;
  collapsed: boolean;
}) {
  const path = usePathname();
  const key = path.split("/")[2] || "overview";
  const title =
    navigation.find((n) => n.key === key)?.label || "Administration";
  return (
    <header className={styles.header}>
      <AdminMobileNav admin={admin} />
      <button
        className={`${styles.iconButton} ${styles.desktopButton}`}
        onClick={onCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
      >
        <PanelLeft size={18} />
      </button>
      <p className={styles.breadcrumb}>
        Workspace&nbsp; / &nbsp;<strong>{title}</strong>
      </p>
      <form
        action={
          canAccess(admin.role, "users")
            ? "/admin/users"
            : "/admin/chat-credits"
        }
        className={styles.headerSearch}
        role="search"
      >
        <Search size={16} aria-hidden="true" />
        <label className={styles.srOnly} htmlFor="admin-global-search">
          Search members by name, email or full UUID
        </label>
        <input
          id="admin-global-search"
          name="q"
          placeholder="Search members…"
          maxLength={100}
        />
      </form>
      <div className={styles.headerRight}>
        <span className={`${styles.muted} ${styles.small}`}>
          Admin workspace
        </span>
        <span className={styles.avatar} title={admin.name}>
          {admin.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    </header>
  );
}
