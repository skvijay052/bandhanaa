"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { canAccess } from "@/lib/admin/permissions";
import { signOutAdmin } from "@/lib/admin/actions";
import type { AdminIdentity } from "@/lib/admin/types";
import { navigation, sectionHref } from "./navigation";
import styles from "./admin.module.css";
export function AdminSidebar({
  admin,
  collapsed = false,
  onNavigate,
}: {
  admin: AdminIdentity;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const path = usePathname();
  const links = navigation.filter((n) => canAccess(admin.role, n.key));
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      aria-label="Administration navigation"
    >
      <Link
        href="/admin"
        className={styles.brand}
        onClick={onNavigate}
        aria-label="Bandhanaa admin home"
      >
        {collapsed ? (
          <ShieldCheck size={27} />
        ) : (
          <div className={styles.brandStack}>
            <Image
              src="/bandhanaa-logo-new.svg"
              width={142}
              height={42}
              alt="Bandhanaa"
              priority
            />
            <small>ADMIN</small>
          </div>
        )}
      </Link>
      <nav className={styles.nav}>
        {links.map((item, i) => {
          const href = sectionHref(item.key);
          const active =
            item.key === "overview" ? path === href : path.startsWith(href);
          return (
            <div key={item.key}>
              {item.group && links[i - 1]?.group !== item.group ? (
                <p className={styles.navGroup}>{item.group.toUpperCase()}</p>
              ) : null}
              <Link
                className={styles.navLink}
                href={href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                onClick={onNavigate}
              >
                <item.icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden="true">
          {admin.name.slice(0, 2).toUpperCase()}
        </span>
        <div className={styles.identityText}>
          <strong>{admin.name}</strong>
          <small>{admin.role.replaceAll("_", " ")}</small>
        </div>
      </div>
      <form action={signOutAdmin}>
        <button className={styles.signOut} aria-label="Sign out">
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </form>
    </aside>
  );
}
