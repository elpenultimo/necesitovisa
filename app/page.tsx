import { listAll } from "@/lib/countryIndex";
import Link from "next/link";
import { HomeForm } from "./partials/HomeForm";

export const runtime = "nodejs";

const countries = listAll();

const originCountries = countries;
const destinationCountries = countries;

export default function HomePage() {
  const popularDestinations = ["estados-unidos", "canada", "reino-unido", "schengen", "australia"];

  return (
    <div className="container-box py-12 space-y-16">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary">
            NecesitoVisa.com
          </p>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">
            ¿Necesito visa para viajar a cualquier destino?
          </h1>
          <p className="text-lg text-slate-600">
            Información clara sobre requisitos de visa, basada en fuentes oficiales y pensada para viajeros reales.
          </p>
          <HomeForm
            origins={originCountries.map((c) => ({ name: c.name_es, slug: c.slug_es }))}
            destinations={destinationCountries.map((c) => ({ name: c.name_es, slug: c.slug_es }))}
          />
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Destinos populares (Chile)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularDestinations.map((slug) => {
              const dest = destinationCountries.find((d) => d.slug_es === slug || d.slug_en === slug);
              if (!dest) return null;
              return (
                <Link
                  key={dest.slug_es}
                  href={`/visa/chile/${dest.slug_es}`}
                  className="card p-4 transition hover:shadow-soft"
                >
                  <p className="font-semibold text-slate-900">{dest.name_es}</p>
                  <p className="text-sm text-slate-600">Ver requisitos para personas de Chile</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="card p-6 space-y-2">
          <h3 className="font-semibold text-slate-900">🛂 ¿Qué es una visa?</h3>
          <p className="text-sm text-slate-600">
            Una visa es una autorización que otorga un país para permitir la entrada, permanencia o tránsito de
            ciudadanos extranjeros por un tiempo determinado y bajo ciertas condiciones.
          </p>
        </div>
        <div className="card p-6 space-y-2">
          <h3 className="font-semibold text-slate-900">🏛️ ¿Quién otorga las visas?</h3>
          <p className="text-sm text-slate-600">
            Las visas son otorgadas por el país de destino, normalmente a través de sus embajadas, consulados o
            sistemas oficiales de inmigración.
          </p>
        </div>
        <div className="card p-6 space-y-2">
          <h3 className="font-semibold text-slate-900">🌍 Cobertura global</h3>
          <p className="text-sm text-slate-600">
            Consulta requisitos de visa para cientos de combinaciones de nacionalidad y destino en un solo lugar.
          </p>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Fuentes oficiales</h2>
        <p className="text-sm text-slate-600">
          Siempre verifica en sitios oficiales antes de viajar. Recomendamos:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
          <li>IATA/Timatic para condiciones de ingreso.</li>
          <li>Páginas de gobiernos y ministerios de relaciones exteriores.</li>
          <li>Embajadas y consulados del país destino.</li>
        </ul>
        <p className="text-xs text-slate-500">
          Esta web es referencial. No constituye asesoría legal ni migratoria.
        </p>
      </section>
    </div>
  );
}
