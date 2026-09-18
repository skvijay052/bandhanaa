import type { Metadata, Viewport } from "next";
import styles from "@/components/admin/admin.module.css";
export const metadata: Metadata = {
  title: { default: "Admin | Bandhanaa", template: "%s | Bandhanaa Admin" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};
export const dynamic = "force-dynamic";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.root}>{children}</div>;
}
