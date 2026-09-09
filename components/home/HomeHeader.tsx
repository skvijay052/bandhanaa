"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import styles from "./HomeHeader.module.css";

const navItems = [
  { label: "Discover", href: "/#discover" },
  { label: "How it works", href: "/#how" },
  { label: "Safety", href: "/#safety" },
  { label: "About", href: "/about" },
];

export function HomeHeader() {
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

        <nav className={styles.desktopNav} aria-label="Homepage navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
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
          aria-controls="home-mobile-menu"
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
        id="home-mobile-menu"
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
          <button type="button" className={styles.closeButton} aria-label="Close navigation menu" onClick={close}>
            <X aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.mobileNav} aria-label="Mobile homepage navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={close}>{item.label}</a>
          ))}
        </nav>

        <div className={styles.mobileActions}>
          <Link href="/login" onClick={close} className={styles.signInButton}>Sign in</Link>
          <Link href="/register" onClick={close} className={styles.primaryButton}>
            Create profile <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </header>
  );
}
