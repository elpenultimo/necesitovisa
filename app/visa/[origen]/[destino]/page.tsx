import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { resolveOrigin } from "@/lib/countryIndex";
import { normalizeRequirement } from "@/lib/visaRequirement";
import { readVisaDataByKey, resolveDestinationBySlug } from "@/lib/visaData";
import { VisaRequirementBadge } from "@/components/VisaRequirementBadge";
import { OfficialSources } from "@/components/OfficialSources";
import { getRequirementExplanation } from "@/lib/requirementExplain";

export const runtime = "nodejs";

const extractEmojiAndLabel = (display: string) => {
  const [maybeEmoji, ...rest] = display.trim().split(" ");
  if (maybeEmoji && /\p{Extended_Pictographic}/u.test(maybeEmoji)) {
    return { emoji: maybeEmoji, label: rest.join(" ") };
  }
  return { emoji: "", label: display.trim() };
};

const buildRequirementLabel = (requirement: ReturnType<typeof normalizeRequirement>) => {
  switch (requirement.type) {
    case "NO_VISA_DAYS":
      return requirement.days ? `no necesitan visa (${requirement.days} días)` : "no necesitan visa";
    case "NO_VISA":
      return "no necesitan visa";
    case "REQUIRES_VISA":
      return "sí requieren visa";
    case "VOA":
      return "pueden obtener visa a la llegada";
    case "E_VISA":
      return "requieren eVisa";
    case "ETA":
      return "requieren ETA";
    case "UNKNOWN":
    default:
      return "tienen requisitos de visa por confirmar";
  }
};

const buildSeoSentence = ({
  origenEs,
  destinoEs,
  requirementLabel,
  requirementEmoji,
}: {
  origenEs: string;
  destinoEs: string;
  requirementLabel: string;
  requirementEmoji: string;
}) =>
  `Los ciudadanos de ${origenEs}${requirementEmoji ? ` ${requirementEmoji}` : ""} ${requirementLabel} para viajar a ${destinoEs}.`;

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
  const { emoji } = extractEmojiAndLabel(normalizedRequirement.display);
  const requirementLabel = buildRequirementLabel(normalizedRequirement);
  const seoSentence = buildSeoSentence({
    origenEs: originNameEs,
    destinoEs: destination.name_es,
    requirementLabel,
    requirementEmoji: emoji,
  });
  const explanation =
    getRequirementExplanation({
      type: normalizedRequirement.type,
      days: normalizedRequirement.days,
      originName: originNameEs,
      destinationName: destination.name_es,
    }) ||
    "Los requisitos pueden cambiar y dependen del tipo de viaje (turismo, trabajo, estudio). Para confirmar el trámite exacto y documentos, revisa siempre fuentes oficiales.";

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
        <h1 className="text-3xl font-bold text-slate-900">
          ¿Necesito visa para viajar a {destination.name_es} si soy de {originNameEs}?
        </h1>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-slate-900">Respuesta rápida:</p>
          <div className="flex items-center gap-3">
            <VisaRequirementBadge requirement={normalizedRequirement} />
          </div>
        </div>
        <div className="text-sm text-slate-600 max-w-3xl space-y-1">
          <p>{seoSentence}</p>
          <p className="text-slate-500">{explanation}</p>
        </div>
      </div>

      <OfficialSources originName={originNameEs} destinationName={destination.name_es} />
    </div>
  );
}
