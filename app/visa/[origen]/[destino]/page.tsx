import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { resolveOrigin } from "@/lib/countryIndex";
import { readVisaDataByKey, resolveDestinationBySlug } from "@/lib/visaData";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: { origen: string; destino: string };
}): Promise<Metadata> {
  const origin = resolveOrigin(params.origen);
  if (!origin) return { title: "Ruta no encontrada" };

  const data = readVisaDataByKey(origin.entry.key);
  if (!data) return { title: "Ruta no encontrada" };

  const destination = resolveDestinationBySlug(data, params.destino);
  if (!destination) return { title: "Ruta no encontrada" };

  const canonicalSlug = destination.canonicalSlug;
  const originSlug = origin.canonicalSlug;
  const originNameEs = data.origin_name_es || origin.entry.name_es;
  const canonical = `https://necesitovisa.com/visa/${originSlug}/${canonicalSlug}`;

  return {
    title: `¿Necesito visa para ${destination.destination.name_es} si soy de ${originNameEs}?`,
    description: `Revisa el requisito de visa para viajar de ${originNameEs} a ${destination.destination.name_es}.`,
    alternates: {
      canonical,
    },
  };
}

export default function VisaDetailPage({ params }: { params: { origen: string; destino: string } }) {
  const origin = resolveOrigin(params.origen);
  if (!origin) return notFound();

  if (origin.redirected) {
    redirect(`/visa/${origin.canonicalSlug}/${params.destino}`);
  }

  const data = readVisaDataByKey(origin.entry.key);
  if (!data) return notFound();

  const destinationResolution = resolveDestinationBySlug(data, params.destino);
  if (!destinationResolution) return notFound();

  if (params.destino !== destinationResolution.canonicalSlug) {
    redirect(`/visa/${data.origin_slug_es}/${destinationResolution.canonicalSlug}`);
  }

  const { destination } = destinationResolution;
  const originNameEs = data.origin_name_es || origin.entry.name_es;

  const breadcrumbCrumbs = [
    { label: "Inicio", href: "/" },
    { label: "Visas", href: "/visa" },
    {
      label: `${originNameEs} → ${destination.name_es}`,
      href: `/visa/${data.origin_slug_es}/${destination.slug_es}`,
    },
  ];

  return (
    <div className="container-box py-10 space-y-8">
      <Breadcrumbs crumbs={breadcrumbCrumbs} />

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          ¿Necesito visa para viajar a {destination.name_es} si soy de {originNameEs}?
        </h1>
        <p className="text-lg font-semibold text-gray-900">Respuesta rápida: {destination.requirement}</p>
        <p className="text-sm text-gray-700 max-w-3xl">
          Mostramos la información en español con slugs optimizados para SEO, pero los datos se leen desde los archivos generados en inglés. Si llegaste con una URL en inglés, te redirigimos a la versión canónica en español.
        </p>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Detalle de requisitos</h2>
        <p className="text-sm text-gray-700">
          El valor anterior proviene de <strong>{origin.entry.name_en}.json</strong> usando la clave de destino
          <strong> {destination.key}</strong>.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Origen (en español): {originNameEs}</li>
          <li>Destino (en español): {destination.name_es}</li>
          <li>Slug canónico: /visa/{data.origin_slug_es}/{destination.slug_es}</li>
        </ul>
      </div>
    </div>
  );
}
