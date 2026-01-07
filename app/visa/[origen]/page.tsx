import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { listAll, resolveOrigin } from "@/lib/countryIndex";
import { normalizeRequirement } from "@/lib/visaRequirement";
import { readVisaDataByKey } from "@/lib/visaData";
import { VisaRequirementBadge } from "@/components/VisaRequirementBadge";

export const runtime = "nodejs";

export function generateStaticParams() {
  const countries = listAll();
  return countries.map((entry) => ({ origen: entry.slug_es }));
}

export function generateMetadata({ params }: { params: { origen: string } }): Metadata {
  const resolved = resolveOrigin(params.origen);
  if (!resolved) return { title: "País no encontrado" };

  const { entry, canonicalSlug } = resolved;
  const canonical = `https://necesitovisa.com/visa/${canonicalSlug}`;

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

  if (resolved.redirected) {
    redirect(`/visa/${resolved.canonicalSlug}`);
  }

  const { entry } = resolved;
  const visaData = readVisaDataByKey(entry.key);
  if (!visaData) return notFound();

  return (
    <div className="container-box py-10 space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Visa para ciudadanos de {visaData.origin_name_es}</h1>
        <p className="text-gray-700 text-sm max-w-2xl">
          Consulta los requisitos de visa para viajar desde {visaData.origin_name_es} a cualquier destino.
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
            {visaData.destinations.map((destination) => (
              <tr key={destination.slug_es} className="border-b last:border-b-0">
                <td className="px-4 py-2 text-gray-900">
                  <Link
                    href={`/visa/${visaData.origin_slug_es}/${destination.slug_es}`}
                    className="text-brand-primary hover:underline"
                  >
                    {destination.name_es}
                  </Link>
                </td>
                <td className="px-4 py-2 space-y-1 text-gray-700">
                  {(() => {
                    const normalized = normalizeRequirement(destination.requirement);
                    const requirement_type = normalized.type;
                    return (
                      <>
                        <VisaRequirementBadge requirement={normalized} />
                        {requirement_type === "UNKNOWN" && (
                          <p className="text-xs text-gray-500">Valor fuente: {destination.requirement || "N/D"}</p>
                        )}
                      </>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
