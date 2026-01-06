import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { resolveOrigin } from "@/lib/countryIndex";
import { normalizeRequirement } from "@/lib/visaRequirement";
import { readVisaDataByKey, resolveDestinationBySlug } from "@/lib/visaData";
import { VisaRequirementBadge } from "@/components/VisaRequirementBadge";
import { OfficialSources } from "@/components/OfficialSources";

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
  const normalizedRequirement = normalizeRequirement(destination.requirement);

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
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-gray-900">Respuesta rápida:</p>
          <div className="flex items-center gap-3">
            <VisaRequirementBadge requirement={normalizedRequirement} />
          </div>
        </div>
        <p className="text-sm text-gray-700 max-w-3xl">
          Mostramos la información en español con slugs optimizados para SEO, pero los datos se leen desde los archivos generados en inglés. Si llegaste con una URL en inglés, te redirigimos a la versión canónica en español.
        </p>
      </div>

      <OfficialSources
        originName={originNameEs}
        destinationName={destination.name_es}
        originSlug={data.origin_slug_es}
        destinationSlug={destination.slug_es}
      />
    </div>
  );
}
