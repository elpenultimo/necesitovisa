import fs from "fs";
import path from "path";
import { notFound, redirect } from "next/navigation";
import { getByEnglishName, getByEnglishSlug, getBySpanishSlug, listAll } from "@/lib/countryIndex";
import { slugify } from "@/lib/slug";
import Link from "next/link";
import { Metadata } from "next";

export const runtime = "nodejs";

interface VisaData {
  origin: string;
  destinations: Record<string, string>;
}

function resolveOrigin(slug: string) {
  const matchEs = getBySpanishSlug(slug);
  if (matchEs) return { entry: matchEs, canonical: false };

  const matchEn = getByEnglishSlug(slug);
  if (matchEn) {
    if (matchEn.slug_es !== slug) {
      redirect(`/visa/${matchEn.slug_es}`);
    }
    return { entry: matchEn, canonical: true };
  }

  return null;
}

function readVisaData(originNameEn: string): VisaData | null {
  const filePath = path.join(process.cwd(), "data", "generated", `${originNameEn}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as VisaData;
}

export function generateStaticParams() {
  const countries = listAll();
  return countries.map((entry) => ({ origen: entry.slug_es }));
}

export function generateMetadata({ params }: { params: { origen: string } }): Metadata {
  const resolved = resolveOrigin(params.origen);
  if (!resolved) return { title: "País no encontrado" };
  const entry = resolved.entry;
  const canonical = `https://necesitovisa.com/visa/${entry.slug_es}`;

  return {
    title: `Visa para ciudadanos de ${entry.name_es}`,
    description: `Revisa requisitos de visa para personas de ${entry.name_es}.`,
    alternates: {
      canonical,
    },
  };
}

export default function VisaOriginPage({ params }: { params: { origen: string } }) {
  const resolved = resolveOrigin(params.origen);
  if (!resolved) return notFound();

  const { entry } = resolved;
  const visaData = readVisaData(entry.name_en);
  if (!visaData) return notFound();

  const destinationEntries = Object.entries(visaData.destinations).map(([nameEn, requirement]) => {
    const metaEntry =
      getByEnglishSlug(slugify(nameEn)) || getByEnglishName(nameEn) || getBySpanishSlug(slugify(nameEn));
    const fallbackSlug = slugify(nameEn);
    return {
      name_en: nameEn,
      name_es: metaEntry?.name_es ?? nameEn,
      slug: metaEntry?.slug_es ?? metaEntry?.slug_en ?? fallbackSlug,
      requirement,
    };
  });

  return (
    <div className="container-box py-10 space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Visa para ciudadanos de {entry.name_es}</h1>
        <p className="text-gray-700 text-sm max-w-2xl">
          Revisa rápidamente si necesitas visa para viajar a otro país. Los datos se generan desde los archivos JSON exportados del
          CSV base.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-800 border-b">Destino</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-800 border-b">Requisito de visa</th>
            </tr>
          </thead>
          <tbody>
            {destinationEntries.map((destination) => (
              <tr key={destination.slug} className="border-b last:border-b-0">
                <td className="px-4 py-2 text-gray-900">
                  <Link
                    href={`/visa/${entry.slug_es}/${destination.slug}`}
                    className="text-brand-primary hover:underline"
                  >
                    {destination.name_es}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-700">{destination.requirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
