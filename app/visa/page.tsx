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
          mostrará una respuesta rápida y enlaces de verificación. Las correcciones revisadas incluyen su fuente y fecha.
        </p>
      </section>

      <div className="flex flex-wrap gap-4 text-sm font-semibold text-cyan-700"><Link href="/paises-sin-visa" className="underline">Países sin visa según tu nacionalidad →</Link><Link href="/destinos" className="underline">Todos los destinos →</Link><Link href="/documentos" className="underline">Autorizaciones y formularios →</Link></div>
      <VisaSelector countries={countries} />

      <section className="card space-y-3 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Explorar por destino</h2>
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
          visa previa, eVisa, autorización electrónica (ESTA / ETA), visa a la llegada o si no se requiere visa para
          estancias cortas. Siempre podrás contrastar la información con fuentes oficiales antes de viajar.
        </p>
      </section>
    </div>
  );
}
