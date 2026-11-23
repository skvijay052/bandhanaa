import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/matrimony-guides";
import { StructuredData } from "@/components/seo/StructuredData";
import styles from "./guides.module.css";

const url = "https://bandhanaa.in/guides";
export const metadata: Metadata = {
  title: "Matrimony Guides: Profiles, Compatibility & Safety",
  description: "Explore practical Bandhanaa guides on writing matrimony profiles, asking important marriage questions and staying safe while meeting matches online.",
  alternates: { canonical: url },
  openGraph: { title: "Matrimony Guides | Bandhanaa", description: "Thoughtful guidance for finding a compatible life partner.", url, type: "website", siteName: "Bandhanaa" },
  robots: { index: true, follow: true },
};

export default function GuidesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.top}>
          <Link href="/" className={styles.brand}>Bandhanaa</Link>
          <nav className={styles.nav} aria-label="Guides navigation"><Link href="/">Home</Link><Link href="/how-it-works">How it works</Link><Link href="/safety">Safety</Link></nav>
        </header>
        <StructuredData id="guides-jsonld" data={{ "@context":"https://schema.org", "@type":"CollectionPage", name:"Matrimony Guides", url, description:"Practical guidance on matrimony profiles, compatibility and safety." }} />
        <main>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Bandhanaa learning centre</p>
            <h1>Matrimony advice for more meaningful connections</h1>
            <p className={styles.intro}>Finding a life partner involves more than browsing profiles. Learn how to introduce yourself honestly, discuss expectations respectfully and protect your privacy throughout the process.</p>
          </section>
          <div className={styles.grid}>
            {guides.map((guide) => (
              <article className={styles.card} key={guide.slug}>
                <span className={styles.meta}>{guide.readTime}</span>
                <h2>{guide.title}</h2>
                <p>{guide.description}</p>
                <Link href={`/guides/${guide.slug}`}>Read the guide →</Link>
              </article>
            ))}
          </div>
          <section className={styles.cta}>
            <h2>Ready to begin your marriage search?</h2>
            <p>Create a profile at your own pace and explore connections with the preferences that matter to you.</p>
            <Link href="/register">Create your profile</Link>
          </section>
        </main>
        <footer className={styles.footer}><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></footer>
      </div>
    </div>
  );
}
