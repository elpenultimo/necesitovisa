import { listAll } from "@/lib/countryIndex";
import { VisaSelector } from "./VisaSelector";

export const runtime = "nodejs";
const countries = listAll();

export const metadata = {
  title: "Consulta de visas por país | NecesitoVisa.com",
  description: "Selecciona tu nacionalidad y destino para consultar los requisitos de entrada.",
};

export default function VisaIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="travel-hero relative overflow-hidden text-white">
        <div className="container-box relative z-10 py-12 sm:py-16">
          <p className="section-label text-cyan-200">Explora tus opciones</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Consulta de visas por país</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-sky-100">
            Elige tu nacionalidad y destino. Te mostraremos rápidamente qué autorización podrías necesitar antes de viajar.
          </p>
        </div>
      </section>
      <div className="container-box relative z-10 -mt-8 space-y-10 pb-14">
        <VisaSelector countries={countries} />
        <section className="grid gap-5 md:grid-cols-3">
          <div className="card border-t-4 border-cyan-400 p-6"><p className="mb-3 text-2xl">🌍</p><h2 className="font-bold text-slate-900">Elige una ruta</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Indica el país que aparece en tu pasaporte y el destino que quieres visitar.</p></div>
          <div className="card border-t-4 border-orange-400 p-6"><p className="mb-3 text-2xl">⚡</p><h2 className="font-bold text-slate-900">Obtén una respuesta</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Consulta si corresponde visa, eVisa, autorización electrónica o entrada sin visa.</p></div>
          <div className="card border-t-4 border-violet-400 p-6"><p className="mb-3 text-2xl">🛂</p><h2 className="font-bold text-slate-900">Verifica antes de viajar</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Contrasta siempre el resultado con las fuentes oficiales del país de destino.</p></div>
        </section>
      </div>
    </div>
  );
}
