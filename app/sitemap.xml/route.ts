import { listAll } from "@/lib/countryIndex";
import { readVisaDataByKey } from "@/lib/visaData";
import { documentGuides } from "@/lib/documentGuides";

const BASE_URL = "https://necesitovisa.com";

type SitemapEntry = {
  loc: string;
  changefreq: "weekly" | "monthly";
  priority: "1.0" | "0.8" | "0.6";
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUrl(path: string): string {
  if (path === "/") return BASE_URL;
  return `${BASE_URL}${path}`;
}

function renderUrl(entry: SitemapEntry): string {
  return [
    "  <url>",
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export function GET(): Response {
  const entries: SitemapEntry[] = [
    { loc: buildUrl("/"), changefreq: "monthly", priority: "1.0" },
    { loc: buildUrl("/visa"), changefreq: "monthly", priority: "0.6" },
    { loc: buildUrl("/faq"), changefreq: "monthly", priority: "0.6" },
    ...["/destinos", "/documentos", "/paises-sin-visa"].map(path => ({ loc: buildUrl(path), changefreq: "weekly" as const, priority: "0.8" as const })),
    ...documentGuides.map(guide => ({ loc: buildUrl(`/documentos/${guide.slug}`), changefreq: "weekly" as const, priority: "0.8" as const })),
    ...listAll().map((country) => ({
      loc: buildUrl(`/visa/destino/${country.slug_es}`),
      changefreq: "weekly" as const,
      priority: "0.8" as const,
    })),
  ];

  const origins = listAll();

  for (const origin of origins) {
    const data = readVisaDataByKey(origin.key);
    if (!data) continue;

    for (const destination of data.destinations) {
      entries.push({
        loc: buildUrl(`/visa/${origin.slug_es}/${destination.slug_es}`),
        changefreq: "weekly",
        priority: "0.8",
      });
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(renderUrl),
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
