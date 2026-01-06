import { listAll } from "@/lib/countryIndex";
import Link from "next/link";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

const countries = listAll();
const originCountries = countries;
const destinationCountries = countries;

export const metadata = {
  title: "Visas por país | NecesitoVisa.com",
  description: "Explora combinaciones de origen y destino para saber si necesitas visa.",
};

export default function VisaIndexPage() {
  return (
    <div className="container-box py-10 space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Visas por país</h1>
        <p className="text-gray-700 max-w-3xl">
          Selecciona tu país de ciudadanía y el destino al que quieres viajar. Cada combinación te
          mostrará una respuesta rápida, resumen de requisitos, fuentes oficiales y la fecha de última revisión.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">País de ciudadanía</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {originCountries.map((country) => (
              <Link
                key={country.slug_es}
                href={`/visa/${country.slug_es}/${destinationCountries[0]?.slug_es ?? slugify(destinationCountries[0]?.name_en ?? "")}`}
                className="rounded-lg border border-gray-200 px-3 py-2 hover:border-brand-primary hover:text-brand-primary"
              >
                {country.name_es}
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Destinos disponibles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {destinationCountries.map((country) => (
              <Link
                key={country.slug_es}
                href={`/visa/${originCountries[0]?.slug_es ?? slugify(originCountries[0]?.name_en ?? "")}/${country.slug_es}`}
                className="rounded-lg border border-gray-200 px-3 py-2 hover:border-brand-primary hover:text-brand-primary"
              >
                {country.name_es}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">¿Cómo funciona?</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Elige tu país de origen y el destino.</li>
          <li>Revisa la respuesta rápida y el resumen de requisitos.</li>
          <li>Consulta las fuentes oficiales y completa los campos con la información más reciente.</li>
        </ol>
        <p className="text-sm text-gray-600">
          Puedes ampliar los datos editando <code>data/requirements.ts</code>. El sitemap se actualiza
          automáticamente al agregar nuevas combinaciones.
        </p>
      </section>
    </div>
  );
}
