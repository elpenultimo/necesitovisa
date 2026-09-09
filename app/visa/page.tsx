import { listAll } from "@/lib/countryIndex";
import { VisaSelector } from "./VisaSelector";
import Link from "next/link";

export const runtime = "nodejs";

const countries = listAll();
export const metadata = {
  title: "Visas por país | NecesitoVisa.com",
  description: "Explora combinaciones de origen y destino para saber si necesitas visa.",
};

export default function VisaIndexPage() {
  return (
    <div className="container-box py-10 space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Visas por país</h1>
        <p className="text-slate-600 max-w-3xl">
          Selecciona tu país de ciudadanía y el destino al que quieres viajar. Cada combinación te
          mostrará una respuesta rápida, resumen de requisitos, fuentes oficiales y la fecha de última revisión.
        </p>
      </section>

      <VisaSelector countries={countries} />

      <section className="card space-y-3 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Guías de destinos con mayor demanda</h2>
        <p className="text-sm text-slate-600">Explora requisitos agrupados por destino y accede a combinaciones específicas de nacionalidad y país.</p>
        <div className="flex flex-wrap gap-3 text-sm">
          {[['Cabo Verde','cabo-verde'],['Cuba','cuba'],['Perú','peru'],['México','mexico'],['República Dominicana','republica-dominicana']].map(([name, slug]) => (
            <Link key={slug} href={`/visa/destino/${slug}`} className="font-semibold text-brand-primary hover:underline">{name} →</Link>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">¿Cómo funciona NecesitoVisa.com?</h2>
        <p className="text-sm text-slate-600">
          Selecciona tu país de origen y el destino al que quieres viajar. En segundos verás si necesitas
          visa, autorización electrónica (eVisa / ESTA), visa a la llegada o si no se requiere visa para
          estancias cortas. Siempre podrás contrastar la información con fuentes oficiales antes de viajar.
        </p>
      </section>
    </div>
  );
}
