import { destinationCountries, originCountries } from "@/data/countries";
import Link from "next/link";
import { HomeForm } from "./partials/HomeForm";

export default function HomePage() {
  const popularDestinations = ["estados-unidos", "canada", "reino-unido", "schengen", "australia"];

  return (
    <div className="container-box py-10 space-y-12">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-semibold text-brand-primary">
            NecesitoVisa.com
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            ¿Necesito visa para viajar a cualquier destino?
          </h1>
          <p className="text-lg text-gray-700">
            Resuelve en segundos si necesitas visa según tu nacionalidad y país destino. Listo para
            SEO y pensado para mantenerse actualizado con fuentes oficiales.
          </p>
          <HomeForm origins={originCountries} destinations={destinationCountries} />
        </div>
        <div className="card p-6 space-y-4 bg-gradient-to-br from-white via-white to-brand-primary/5">
          <h2 className="text-xl font-semibold text-gray-900">Destinos populares (Chile)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularDestinations.map((slug) => {
              const dest = destinationCountries.find((d) => d.slug === slug);
              if (!dest) return null;
              return (
                <Link
                  key={dest.slug}
                  href={`/visa/chile/${dest.slug}`}
                  className="card p-4 hover:shadow-md transition shadow-sm"
                >
                  <p className="font-semibold">{dest.name}</p>
                  <p className="text-sm text-gray-600">Ver requisitos para personas de Chile</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="card p-5 space-y-2">
          <h3 className="font-semibold text-gray-900">Actualizado y transparente</h3>
          <p className="text-sm text-gray-700">Cada combinación muestra la última fecha de revisión.</p>
        </div>
        <div className="card p-5 space-y-2">
          <h3 className="font-semibold text-gray-900">Basado en datos locales</h3>
          <p className="text-sm text-gray-700">Toda la información vive en JSON, fácil de editar y versionar.</p>
        </div>
        <div className="card p-5 space-y-2">
          <h3 className="font-semibold text-gray-900">SEO listo</h3>
          <p className="text-sm text-gray-700">URLs limpias, sitemap y metadatos optimizados.</p>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Fuentes oficiales</h2>
        <p className="text-sm text-gray-700">
          Siempre verifica en sitios oficiales antes de viajar. Recomendamos:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>IATA/Timatic para condiciones de ingreso.</li>
          <li>Páginas de gobiernos y ministerios de relaciones exteriores.</li>
          <li>Embajadas y consulados del país destino.</li>
        </ul>
        <p className="text-xs text-gray-500">
          Esta web es referencial. No constituye asesoría legal ni migratoria.
        </p>
      </section>
    </div>
  );
}
