import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { listAll } from "@/lib/countryIndex";
import { readVisaDataByKey } from "@/lib/visaData";

export const runtime = "nodejs";

const priorityDestinations = ["cabo-verde", "cuba", "peru", "mexico", "republica-dominicana"];
const priorityOriginsForCapeVerde = [
  "peru", "mexico", "guatemala", "honduras", "venezuela", "republica-dominicana",
  "cuba", "ecuador", "nicaragua", "el-salvador", "colombia", "paraguay",
];

export function generateStaticParams() {
  return priorityDestinations.map((destino) => ({ destino }));
}

function resolveDestinationName(slug: string) {
  for (const origin of listAll()) {
    const data = readVisaDataByKey(origin.key);
    const destination = data?.destinations.find((item) => item.slug_es === slug);
    if (destination) return destination.name_es;
  }
  return null;
}

export function generateMetadata({ params }: { params: { destino: string } }): Metadata {
  const destinationName = resolveDestinationName(params.destino);
  if (!destinationName) return { title: "Destino no encontrado" };
  return {
    title: `Requisitos de visa para viajar a ${destinationName} | NecesitoVisa.com`,
    description: `Consulta qué nacionalidades necesitan visa para viajar a ${destinationName} y revisa las combinaciones más consultadas.`,
    alternates: { canonical: `https://necesitovisa.com/visa/destino/${params.destino}` },
  };
}

export default function DestinationHubPage({ params }: { params: { destino: string } }) {
  const destinationName = resolveDestinationName(params.destino);
  if (!destinationName) return null;

  const origins = listAll()
    .map((origin) => {
      const data = readVisaDataByKey(origin.key);
      const destination = data?.destinations.find((item) => item.slug_es === params.destino);
      return destination ? { origin, destination } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const priority = params.destino === "cabo-verde" ? priorityOriginsForCapeVerde : [];
  const ordered = [...origins].sort((a, b) => {
    const ai = priority.indexOf(a.origin.slug_es);
    const bi = priority.indexOf(b.origin.slug_es);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  const visibleOrigins = ordered.slice(0, 12);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://necesitovisa.com/" },
      { "@type": "ListItem", position: 2, name: "Visas", item: "https://necesitovisa.com/visa" },
      { "@type": "ListItem", position: 3, name: destinationName, item: `https://necesitovisa.com/visa/destino/${params.destino}` },
    ],
  };

  return (
    <div className="container-box space-y-8 py-10">
      <Breadcrumbs crumbs={[{ label: "Inicio", href: "/" }, { label: "Visas", href: "/visa" }, { label: destinationName, href: `/visa/destino/${params.destino}` }]} />
      <section className="space-y-3">
        <p className="section-label text-cyan-700">Guía de entrada</p>
        <h1 className="text-3xl font-bold text-slate-900">Requisitos de visa para viajar a {destinationName}</h1>
        <p className="max-w-3xl text-slate-600">
          El requisito depende del pasaporte y del propósito del viaje. Consulta algunas de las combinaciones más relevantes y verifica siempre con la autoridad oficial de {destinationName}.
        </p>
      </section>
      <section className="card space-y-4 p-6">
        <h2 className="text-xl font-semibold text-slate-900">¿Necesitas visa para viajar a {destinationName}?</h2>
        <p className="text-sm leading-relaxed text-slate-600">Selecciona tu nacionalidad para consultar el resultado específico, la modalidad de entrada y las fuentes de verificación disponibles.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleOrigins.map(({ origin, destination }) => (
            <Link key={origin.slug_es} href={`/visa/${origin.slug_es}/${destination.slug_es}`} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
              <span className="text-sm font-semibold text-slate-900">{origin.name_es} → {destinationName}</span>
              <span className="mt-2 block text-xs font-bold text-cyan-700">Ver requisito →</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-xl bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
        Los requisitos migratorios pueden cambiar sin previo aviso. NecesitoVisa.com ofrece información referencial; confirma el resultado con una embajada, consulado o autoridad migratoria oficial antes de comprar tu viaje.
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  );
}
