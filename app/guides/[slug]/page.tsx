import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findGuide, guides } from "@/lib/matrimony-guides";
import { StructuredData } from "@/components/seo/StructuredData";
import styles from "../guides.module.css";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return guides.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return { title: "Guide not found", robots: { index: false } };
  const url = `https://bandhanaa.in/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: guide.title, description: guide.description, url, siteName: "Bandhanaa", type: "article" },
  };
}

export default async function GuideArticle({ params }: Props) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();
  const url = `https://bandhanaa.in/guides/${guide.slug}`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, url, mainEntityOfPage: url, author: { "@type": "Organization", name: "Bandhanaa" }, publisher: { "@type": "Organization", name: "Bandhanaa", url: "https://bandhanaa.in/" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://bandhanaa.in/" }, { "@type": "ListItem", position: 2, name: "Matrimony guides", item: "https://bandhanaa.in/guides" }, { "@type": "ListItem", position: 3, name: guide.title, item: url }] },
  ];
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.top}><Link href="/" className={styles.brand}>Bandhanaa</Link><nav className={styles.nav} aria-label="Guide navigation"><Link href="/guides">All guides</Link><Link href="/safety">Safety</Link><Link href="/how-it-works">How it works</Link></nav></header>
        <StructuredData id="article-jsonld" data={jsonLd} />
        <main className={styles.article}>
          <Link href="/guides" className={styles.back}>← Back to matrimony guides</Link>
          <div className={styles.hero}>
            <p className={styles.eyebrow}>Matrimony advice · {guide.readTime}</p>
            <h1>{guide.title}</h1>
            <p className={styles.intro}>{guide.intro}</p>
          </div>
          {guide.sections.map((section) => <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
          </section>)}
          <section className={styles.faq}>
            <h2>Frequently asked questions</h2>
            {guide.faq.map((item) => <div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}
          </section>
          <section className={styles.cta}><h2>Continue your journey with Bandhanaa</h2><p>Explore a thoughtful matrimony experience focused on compatibility and respectful introductions.</p><Link href="/register">Create your profile</Link></section>
          <section><h2>Read more matrimony advice</h2><ul>{guides.filter((item) => item.slug !== guide.slug).map((item) => <li key={item.slug}><Link href={`/guides/${item.slug}`}>{item.title}</Link></li>)}</ul></section>
        </main>
        <footer className={styles.footer}><Link href="/guides">All guides</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link></footer>
      </div>
    </div>
  );
}
