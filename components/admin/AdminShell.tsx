"use client";
import { useState } from "react";
import type { AdminIdentity } from "@/lib/admin/types";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import styles from "./admin.module.css";
export function AdminShell({
  admin,
  children,
}: {
  admin: AdminIdentity;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={styles.shell} data-collapsed={collapsed}>
      <a className={styles.skip} href="#admin-main">
        Skip to content
      </a>
      <AdminSidebar admin={admin} collapsed={collapsed} />
      <div className={styles.workspace}>
        <AdminHeader
          admin={admin}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((v) => !v)}
        />
        <main id="admin-main" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
