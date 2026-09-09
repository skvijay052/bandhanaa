"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import styles from "@/components/home/HomeHeader.module.css";

const navItems = [
  { label: "Discover", href: "/#discover" },
  { label: "How it works", href: "/how-it-works", active: true },
  { label: "Safety", href: "/#safety" },
  { label: "About", href: "/about" },
] as const;

export function HowItWorksHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" aria-label="Bandhanaa home" className={styles.brand}>
          <Image
            src="/bandhanaa-logo.png"
            alt="Bandhanaa"
            width={240}
            height={80}
            className={styles.logo}
            priority
          />
        </Link>

        <nav className={styles.desktopNav} aria-label="How it works navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              style={item.active ? { color: "#e83e78" } : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.desktopActions}>
          <Link href="/login">Sign in</Link>
          <Link href="/register" className={styles.primaryButton}>
            Create profile <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="how-it-works-mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
      </div>

      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        id="how-it-works-mobile-menu"
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.drawerHeader}>
          <Image
            src="/bandhanaa-logo.png"
            alt="Bandhanaa"
            width={220}
            height={74}
            className={styles.drawerLogo}
          />
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close navigation menu"
            onClick={close}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.mobileNav} aria-label="Mobile how it works navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={item.active ? "page" : undefined}
              style={item.active ? { color: "#e83e78" } : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.mobileActions}>
          <Link href="/login" onClick={close} className={styles.signInButton}>
            Sign in
          </Link>
          <Link href="/register" onClick={close} className={styles.primaryButton}>
            Create profile <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </header>
  );
}
