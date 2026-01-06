import fs from "fs";
import path from "path";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Metadata } from "next";
import { getByEnglishSlug, getBySpanishSlug } from "@/lib/countryIndex";

export const runtime = "nodejs";

interface VisaData {
  origin: string;
  destinations: Record<string, string>;
}

function resolveCountry(slug: string) {
  const matchEs = getBySpanishSlug(slug);
  if (matchEs) return { entry: matchEs, redirected: false };

  const matchEn = getByEnglishSlug(slug);
  if (matchEn) {
    if (matchEn.slug_es !== slug) {
      redirect(`/visa/${matchEn.slug_es}`);
    }
    return { entry: matchEn, redirected: true };
  }

  return null;
}

function readVisaData(originNameEn: string): VisaData | null {
  const filePath = path.join(process.cwd(), "data", "generated", `${originNameEn}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as VisaData;
}

export async function generateMetadata({
  params,
}: {
  params: { origen: string; destino: string };
}): Promise<Metadata> {
  const origin = resolveCountry(params.origen);
  const destination = resolveCountry(params.destino);

  if (!origin || !destination) return { title: "Ruta no encontrada" };

  const canonical = `https://necesitovisa.com/visa/${origin.entry.slug_es}/${destination.entry.slug_es}`;

  return {
    title: `¿Necesito visa para ${destination.entry.name_es} si soy de ${origin.entry.name_es}?`,
    description: `Revisa el requisito de visa para viajar de ${origin.entry.name_es} a ${destination.entry.name_es}.`,
    alternates: {
      canonical,
    },
  };
}

export default function VisaDetailPage({ params }: { params: { origen: string; destino: string } }) {
  const origin = resolveCountry(params.origen);
  if (!origin) return notFound();

  const destination = resolveCountry(params.destino);
  if (!destination) return notFound();

  const data = readVisaData(origin.entry.name_en);
  if (!data) return notFound();

  const requirement = data.destinations[destination.entry.name_en];
  if (!requirement) {
    return notFound();
  }

  if (params.destino === destination.entry.slug_en && destination.entry.slug_es !== destination.entry.slug_en) {
    redirect(`/visa/${origin.entry.slug_es}/${destination.entry.slug_es}`);
  }

  const breadcrumbCrumbs = [
    { label: "Inicio", href: "/" },
    { label: "Visas", href: "/visa" },
    { label: `${origin.entry.name_es} → ${destination.entry.name_es}`, href: `/visa/${origin.entry.slug_es}/${destination.entry.slug_es}` },
  ];

  return (
    <div className="container-box py-10 space-y-8">
      <Breadcrumbs crumbs={breadcrumbCrumbs} />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          ¿Necesito visa para viajar a {destination.entry.name_es} si soy de {origin.entry.name_es}?
        </h1>
        <p className="text-lg font-semibold text-gray-900">Respuesta rápida: {requirement}</p>
        <p className="text-sm text-gray-700 max-w-3xl">
          Mostramos la información en español con slugs optimizados para SEO, pero los datos se leen desde los archivos generados en
          inglés. Si llegaste con una URL en inglés, te redirigimos a la versión canónica en español.
        </p>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Detalle de requisitos</h2>
        <p className="text-sm text-gray-700">
          El valor anterior proviene de <strong>{origin.entry.name_en}.json</strong> usando la clave de destino
          <strong> {destination.entry.name_en}</strong>.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Origen (en español): {origin.entry.name_es}</li>
          <li>Destino (en español): {destination.entry.name_es}</li>
          <li>Slug canónico: /visa/{origin.entry.slug_es}/{destination.entry.slug_es}</li>
        </ul>
      </div>
    </div>
  );
}
