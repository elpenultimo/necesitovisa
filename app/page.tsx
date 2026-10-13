import { listAll } from "@/lib/countryIndex";
import Link from "next/link";
import Image from "next/image";
import { DestinationCard } from "@/components/DestinationCard";
import { NationalityForm } from "@/components/NationalityForm";
import { documentGuides } from "@/lib/documentGuides";
import { HomeForm } from "./partials/HomeForm";

export const runtime = "nodejs";

const countries = listAll();

export default function HomePage() {
  const popularDestinations = ["estados-unidos", "canada", "reino-unido", "japon", "australia"];
  const seoPairs = [
    { origin: "peru", destination: "cabo-verde", flag: "🇵🇪 → 🇨🇻", label: "¿Necesita visa un peruano para viajar a Cabo Verde?" },
    { origin: "mexico", destination: "cabo-verde", flag: "🇲🇽 → 🇨🇻", label: "¿Necesita visa un mexicano para viajar a Cabo Verde?" },
    { origin: "guatemala", destination: "cabo-verde", flag: "🇬🇹 → 🇨🇻", label: "¿Necesita visa un guatemalteco para viajar a Cabo Verde?" },
    { origin: "honduras", destination: "cabo-verde", flag: "🇭🇳 → 🇨🇻", label: "¿Necesita visa un hondureño para viajar a Cabo Verde?" },
    { origin: "venezuela", destination: "cabo-verde", flag: "🇻🇪 → 🇨🇻", label: "¿Necesita visa un venezolano para viajar a Cabo Verde?" },
    { origin: "republica-dominicana", destination: "cabo-verde", flag: "🇩🇴 → 🇨🇻", label: "¿Necesita visa un dominicano para viajar a Cabo Verde?" },
    { origin: "mexico", destination: "nicaragua", flag: "🇲🇽 → 🇳🇮", label: "¿Necesita visa un mexicano para viajar a Nicaragua?" },
    { origin: "guatemala", destination: "japon", flag: "🇬🇹 → 🇯🇵", label: "¿Necesita visa un guatemalteco para viajar a Japón?" },
    { origin: "ecuador", destination: "bahamas", flag: "🇪🇨 → 🇧🇸", label: "¿Necesita visa un ecuatoriano para viajar a Bahamas?" },
    { origin: "peru", destination: "bahamas", flag: "🇵🇪 → 🇧🇸", label: "¿Necesita visa un peruano para viajar a Bahamas?" },
    { origin: "cuba", destination: "guyana", flag: "🇨🇺 → 🇬🇾", label: "¿Necesita visa un cubano para viajar a Guyana?" },
    { origin: "republica-dominicana", destination: "venezuela", flag: "🇩🇴 → 🇻🇪", label: "¿Necesita visa un dominicano para viajar a Venezuela?" },
  ];

  return (
    <div>
      <section className="travel-hero relative overflow-hidden text-white">
        <Image src="/images/travel-hero.webp" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/40" aria-hidden="true" />
        <div className="container-box relative z-10 grid gap-10 py-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-20">
          <div className="space-y-6">
            <p className="section-label text-cyan-200">Tu próximo viaje empieza aquí</p>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              ¿Necesito visa para viajar a cualquier destino?
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-sky-100">
              Consulta los requisitos de entrada según tu nacionalidad y descubre qué necesitas antes de despegar.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-sky-100">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">🌍 Cobertura global</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">✓ Información clara</span>
            </div>
          </div>
          <HomeForm
            origins={countries.map((c) => ({ name: c.name_es, slug: c.slug_es }))}
            destinations={countries.map((c) => ({ name: c.name_es, slug: c.slug_es }))}
          />
        </div>
      </section>

      <div className="container-box space-y-14 py-12">
        <section className="space-y-5" aria-labelledby="featured-destinations">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="section-label text-cyan-700">Inspira tu próximo viaje</p><h2 id="featured-destinations" className="mt-2 text-2xl font-bold">Explora destinos del mundo</h2><p className="mt-2 text-sm text-slate-600">Cada viaje empieza con tu pasaporte. Consulta qué necesitas para entrar.</p></div>
            <Link href="/destinos" className="text-sm font-semibold text-cyan-700">Ver todos los destinos →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {popularDestinations.map(slug => {
              const dest = countries.find(d => d.slug_es === slug);
              return dest ? <DestinationCard key={slug} slug={slug} name={dest.name_es} /> : null;
            })}
          </div>
        </section>

        <section className="card space-y-5 p-6 sm:p-8">
          <p className="section-label text-cyan-700">Viaja con tu pasaporte</p>
          <h2 className="text-2xl font-bold">¿A qué países puedes viajar sin visa?</h2>
          <p className="text-sm text-slate-600">Elige tu nacionalidad para comparar destinos sin visa, con autorización electrónica, visa a la llegada y eVisa.</p>
          <NationalityForm countries={countries.map(c=>({name:c.name_es,slug:c.slug_es}))} action="/paises-sin-visa" />
        </section>
        <section className="space-y-5">
          <div><p className="section-label text-cyan-700">Autorizaciones y formularios</p><h2 className="mt-2 text-2xl font-bold">Prepara los documentos de tu viaje</h2><p className="mt-2 text-sm text-slate-600">Guías internacionales para entender el requisito y gestionarlo directamente en el sitio oficial.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{documentGuides.map(g=><Link key={g.slug} href={`/documentos/${g.slug}`} className="card space-y-3 p-5 hover:border-cyan-300"><span className="text-xs font-semibold text-cyan-700">{g.kind}</span><h3 className="font-bold">{g.title}</h3><span className="text-sm text-cyan-700">Consultar guía →</span></Link>)}</div>
        </section>

        <section>
          <div className="mb-5">
            <p className="section-label text-cyan-700">Consultas por ruta</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Consultas frecuentes por nacionalidad y destino</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Explora rutas de distintas nacionalidades. Para consultar la tuya, selecciona tu pasaporte y destino.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {seoPairs.map((pair) => {
              const origin = countries.find((country) => country.slug_es === pair.origin);
              const destination = countries.find((country) => country.slug_es === pair.destination);
              if (!origin || !destination) return null;
              return (
                <Link
                  key={`${pair.origin}-${pair.destination}`}
                  href={`/visa/${origin.slug_es}/${destination.slug_es}`}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
                >
                  <span className="text-xl" aria-hidden>{pair.flag}</span>
                  <p className="mt-2 text-sm font-semibold leading-snug text-slate-800 group-hover:text-cyan-700">{pair.label}</p>
                  <span className="mt-3 inline-block text-xs font-bold text-cyan-700">Ver requisitos →</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <p className="section-label text-cyan-700">Guías por destino</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Requisitos de visa según el destino</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Explora destinos y consulta las condiciones de entrada según el pasaporte con el que viajarás.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Cabo Verde", "Cuba", "Perú", "México", "República Dominicana"].map((name, index) => {
              const slugs = ["cabo-verde", "cuba", "peru", "mexico", "republica-dominicana"];
              return <Link key={slugs[index]} href={`/visa/destino/${slugs[index]}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700">Visa para {name} →</Link>;
            })}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="section-label text-cyan-700">Antes de viajar</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Lo esencial sobre visas</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="card border-t-4 border-cyan-400 p-6 space-y-2">
              <h3 className="font-bold text-slate-900">🛂 ¿Qué es una visa?</h3>
              <p className="text-sm leading-relaxed text-slate-600">Una autorización que permite la entrada, permanencia o tránsito de ciudadanos extranjeros por un tiempo determinado.</p>
            </div>
            <div className="card border-t-4 border-orange-400 p-6 space-y-2">
              <h3 className="font-bold text-slate-900">🏛️ ¿Quién la otorga?</h3>
              <p className="text-sm leading-relaxed text-slate-600">El país de destino, normalmente a través de sus embajadas, consulados o sistemas oficiales de inmigración.</p>
            </div>
            <div className="card border-t-4 border-violet-400 p-6 space-y-2">
              <h3 className="font-bold text-slate-900">🌍 Cobertura global</h3>
              <p className="text-sm leading-relaxed text-slate-600">Consulta cientos de combinaciones de nacionalidad y destino en un solo lugar.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-7 text-white shadow-xl">
          <p className="section-label text-cyan-300">Fuentes y responsabilidad</p>
          <h2 className="mt-2 text-xl font-bold">Viaja con la información correcta</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            Verifica siempre en IATA/Timatic, páginas de gobiernos, ministerios de relaciones exteriores, embajadas y consulados.
            Esta web es referencial y no constituye asesoría legal ni migratoria.
          </p>
        </section>
      </div>
    </div>
  );
}
