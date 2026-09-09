import { getSiteUrl } from "@/lib/site-url";

type JsonLdObject = Record<string, unknown>;

type StructuredDataProps = {
  data: JsonLdObject | readonly JsonLdObject[];
  id?: string;
};

function serializeJsonLd(value: StructuredDataProps["data"]) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function getOrganizationStructuredData(): JsonLdObject {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bandhanaa",
    url: siteUrl,
  };
}

export function getWebsiteStructuredData(): JsonLdObject {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bandhanaa",
    url: siteUrl,
    description: "Modern matrimony for meaningful relationships",
  };
}
