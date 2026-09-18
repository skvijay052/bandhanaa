"use client";
import { useRef } from "react";
import { Menu, X } from "lucide-react";
import type { AdminIdentity } from "@/lib/admin/types";
import { AdminSidebar } from "./AdminSidebar";
import styles from "./admin.module.css";
export function AdminMobileNav({ admin }: { admin: AdminIdentity }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className={`${styles.iconButton} ${styles.mobileButton}`}
        onClick={() => dialog.current?.showModal()}
        aria-label="Open administration menu"
      >
        <Menu size={19} />
      </button>
      <dialog
        ref={dialog}
        className={`${styles.root} ${styles.mobileDialog}`}
        aria-label="Administration menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className={`${styles.iconButton} ${styles.closeMobile}`}
          onClick={() => dialog.current?.close()}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <AdminSidebar
          admin={admin}
          onNavigate={() => dialog.current?.close()}
        />
      </dialog>
    </>
  );
}
