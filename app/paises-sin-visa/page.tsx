import type { Metadata } from "next";
import Link from "next/link";
import { listAll, resolveOrigin } from "@/lib/countryIndex";
import { readVisaDataByKey } from "@/lib/visaData";
import { normalizeRequirement } from "@/lib/visaRequirement";
import { destinationCategories, groupDestinations } from "@/lib/destinationGroups";
import { NationalityForm } from "@/components/NationalityForm";

export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Países sin visa según tu nacionalidad | NecesitoVisa.com",
  description: "Elige tu nacionalidad y compara destinos sin visa, con autorización electrónica, visa a la llegada y eVisa. Consulta la duración disponible y los requisitos de cada ruta.",
  alternates: { canonical: "https://necesitovisa.com/paises-sin-visa" },
};

export default function VisaFreePage({ searchParams }: { searchParams: { nacionalidad?: string | string[] } }) {
  const value = typeof searchParams.nacionalidad === "string" ? searchParams.nacionalidad : "";
  const origin = value ? resolveOrigin(value) : null;
  const data = origin ? readVisaDataByKey(origin.entry.key) : null;
  const grouped = data ? groupDestinations(data.destinations, data.origin_key) : null;
  return <div className="container-box space-y-8 py-10">
    <header className="space-y-3"><p className="section-label text-cyan-700">Tu pasaporte, tus posibilidades</p><h1 className="text-3xl font-bold">Países sin visa según tu nacionalidad</h1><p className="max-w-3xl text-slate-600">Selecciona el pasaporte con el que viajarás. Compara las modalidades de entrada para visitas cortas y abre cada destino para revisar sus condiciones.</p></header>
    <section className="card p-6"><NationalityForm countries={listAll().map(c=>({name:c.name_es,slug:c.slug_es}))} action="/paises-sin-visa" selected={origin?.canonicalSlug || ""} /></section>
    {value && !data && <p role="alert" className="rounded-xl bg-amber-50 p-4">No encontramos esa nacionalidad. Selecciona una de la lista.</p>}
    {!data && !value && <div className="grid gap-4 md:grid-cols-2">{destinationCategories.map(c=><div key={c.id} className="card p-5"><h2 className="font-bold">{c.title}</h2><p className="mt-2 text-sm text-slate-600">{c.description}</p></div>)}</div>}
    {data && grouped && <>
      <div className="space-y-3" aria-live="polite"><h2 className="text-2xl font-bold">Destinos para personas de {data.origin_name_es}</h2><p className="text-sm text-slate-600">Resultados de la información disponible para visitas cortas con pasaporte ordinario. Residencia, doble nacionalidad, historial de viajes y propósito pueden modificar el requisito. {grouped.otherCount} destinos adicionales requieren visa previa o confirmación: <Link className="underline text-cyan-700" href={`/visa/${data.origin_slug_es}`}>ver todas las rutas</Link>.</p></div>
      <nav aria-label="Modalidades de entrada" className="flex flex-wrap gap-3">{destinationCategories.map(c=><a href={`#${c.id}`} key={c.id} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold">{c.title} · {grouped.groups[c.id].length}</a>)}</nav>
      {destinationCategories.map(c=><section id={c.id} key={c.id} className="scroll-mt-40 space-y-4"><h2 className="text-2xl font-bold">{c.title} <span className="text-slate-500">({grouped.groups[c.id].length})</span></h2><p className="text-sm text-slate-600">{c.description}</p>{grouped.groups[c.id].length === 0 ? <p className="text-sm text-slate-500">No hay destinos registrados en esta categoría para esta nacionalidad.</p> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{grouped.groups[c.id].map(d=><Link key={d.key} href={`/visa/${data.origin_slug_es}/${d.slug_es}`} className="card space-y-2 p-4 hover:border-cyan-300"><h3 className="font-bold">{d.name_es}</h3><p className="text-sm text-slate-600">{normalizeRequirement(d.requirement).label}</p><span className="text-xs font-semibold text-cyan-700">Condiciones de esta ruta →</span></Link>)}</div>}</section>)}
      <p className="rounded-xl bg-amber-50 p-5 text-sm text-amber-950">La exención de visa no garantiza la entrada. Puede exigirse una tarjeta de llegada, pasaje de salida, fondos u otros documentos. Los datos sin duración indican que debes confirmarla; no significan estancia ilimitada.</p>
    </>}
  </div>;
}
