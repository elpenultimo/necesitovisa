import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { resolveOrigin } from "@/lib/countryIndex";
import { normalizeRequirement } from "@/lib/visaRequirement";
import { readVisaDataByKey, resolveDestinationBySlug } from "@/lib/visaData";
import { VisaRequirementBadge } from "@/components/VisaRequirementBadge";
import { OfficialSources } from "@/components/OfficialSources";
import { getRequirementExplanation } from "@/lib/requirementExplain";
import { getVisaFaq } from "@/lib/visaFaq";

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
    case "ESTA":
      return "requieren ESTA";
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
  const isDomesticTrip = destination.key === data.origin_key;
  const normalizedRequirement = isDomesticTrip ? null : normalizeRequirement(destination.requirement);
  const { emoji } = normalizedRequirement ? extractEmojiAndLabel(normalizedRequirement.display) : { emoji: "", label: "" };
  const requirementLabel = normalizedRequirement ? buildRequirementLabel(normalizedRequirement) : "";
  const seoSentence = normalizedRequirement
    ? buildSeoSentence({
        origenEs: originNameEs,
        destinoEs: destination.name_es,
        requirementLabel,
        requirementEmoji: emoji,
      })
    : "";
  const explanation = normalizedRequirement
    ? getRequirementExplanation({
        type: normalizedRequirement.type,
        days: normalizedRequirement.days,
        originName: originNameEs,
        destinationName: destination.name_es,
      }) ||
      "Los requisitos pueden cambiar y dependen del tipo de viaje (turismo, trabajo, estudio). Para confirmar el trámite exacto y documentos, revisa siempre fuentes oficiales."
    : "";
  const visaFaq = normalizedRequirement ? getVisaFaq(normalizedRequirement.type, destination.name_es) : [];
  const faqJsonLd = normalizedRequirement
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: visaFaq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

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
        {isDomesticTrip ? (
          <div className="card border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                🏠
              </span>
              <h2 className="text-xl font-semibold">¿Necesito visa para viajar dentro de mi propio país?</h2>
            </div>
            <div className="mt-3 space-y-2 text-sm text-emerald-800">
              <p>
                Si eres ciudadano de {originNameEs} y viajas dentro de {originNameEs}, no necesitas visa ni
                autorización migratoria. El ingreso a tu propio país está permitido para sus ciudadanos, siempre
                que cuentes con documentos nacionales válidos.
              </p>
              <p className="font-medium">Estás viajando dentro de tu propio país 🏠</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold text-slate-900">Respuesta rápida:</p>
              <div className="flex items-center gap-3">
                {normalizedRequirement && <VisaRequirementBadge requirement={normalizedRequirement} />}
              </div>
            </div>
            <div className="text-sm text-slate-600 max-w-3xl space-y-1">
              <p>{seoSentence}</p>
              <p className="text-slate-500">{explanation}</p>
            </div>
          </>
        )}
      </div>

      {!isDomesticTrip && <OfficialSources originName={originNameEs} destinationName={destination.name_es} />}

      {!isDomesticTrip && faqJsonLd && (
        <div className="card p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">❓ Micro-FAQ sobre el requisito de viaje</h2>
            <p className="text-sm text-slate-600">
              Respuestas rápidas sobre el tipo de autorización más común para visitas cortas.
            </p>
          </div>
          <div className="space-y-2">
            {visaFaq.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <summary className="cursor-pointer font-semibold text-slate-900">{item.question}</summary>
                <div className="pt-2 text-slate-600">{item.answer}</div>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqJsonLd),
            }}
          />
        </div>
      )}
    </div>
  );
}
