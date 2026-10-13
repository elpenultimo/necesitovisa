import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { destinationPhotos } from "@/lib/destinationPhotos";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { listAll, resolveOrigin } from "@/lib/countryIndex";
import { NationalityForm } from "@/components/NationalityForm";
import { guidesForDestination } from "@/lib/documentGuides";

export const runtime = "nodejs";
const priorityDestinations = ["cabo-verde", "cuba", "peru", "mexico", "republica-dominicana", "estados-unidos", "canada", "reino-unido", "australia", "japon", "tailandia", "malasia"];
export function generateStaticParams() { return priorityDestinations.map(destino=>({destino})); }
export function generateMetadata({ params }: { params: { destino: string } }): Metadata {
 const country=resolveOrigin(params.destino);if(!country)return {title:"Destino no encontrado"};
 return {title:`Requisitos de entrada para ${country.entry.name_es} según tu nacionalidad | NecesitoVisa.com`,description:`Selecciona tu nacionalidad para consultar visa, estancia y documentos de viaje a ${country.entry.name_es}.`,alternates:{canonical:`https://necesitovisa.com/visa/destino/${country.canonicalSlug}`}};
}
export default function DestinationHubPage({params,searchParams}:{params:{destino:string};searchParams:{nacionalidad?:string|string[]}}) {
 const dest=resolveOrigin(params.destino);if(!dest)notFound();
 const value=typeof searchParams.nacionalidad === "string" ? searchParams.nacionalidad : "";
 const origin=value ? resolveOrigin(value) : null;
 if(origin)redirect(`/visa/${origin.canonicalSlug}/${dest.canonicalSlug}`);
 if(dest.redirected)redirect(`/visa/destino/${dest.canonicalSlug}`);
 const guides=guidesForDestination(dest.entry.key);
 const photo=destinationPhotos[dest.canonicalSlug];
 return <div className="container-box space-y-8 py-10"><Breadcrumbs crumbs={[{label:"Inicio",href:"/"},{label:"Destinos",href:"/destinos"},{label:dest.entry.name_es,href:`/visa/destino/${dest.canonicalSlug}`}]} /><header className="space-y-3"><p className="section-label text-cyan-700">Guía de entrada</p><h1 className="text-3xl font-bold">Requisitos para viajar a {dest.entry.name_es}</h1><p className="max-w-3xl text-slate-600">La necesidad de visa y la estancia permitida dependen de tu pasaporte. Selecciona tu nacionalidad para abrir la información de tu ruta.</p></header>{photo && <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-200 sm:h-72"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1152px) 100vw, 1120px" className="object-cover" /></div>}<section className="card space-y-4 p-6"><h2 className="text-xl font-bold">Consulta los requisitos de tu pasaporte</h2><NationalityForm countries={listAll().map(c=>({name:c.name_es,slug:c.slug_es}))} action={`/visa/destino/${dest.canonicalSlug}`} button="Ver requisitos" />{value && !origin && <p role="alert" className="text-amber-800">Selecciona una nacionalidad válida de la lista.</p>}</section>{guides.length>0 && <section className="space-y-4"><h2 className="text-xl font-bold">Documentos y formularios de {dest.entry.name_es}</h2><p className="text-sm text-slate-600">Consulta la elegibilidad y excepciones de cada documento. Un formulario de llegada puede corresponder aunque no necesites visa.</p><div className="grid gap-4 sm:grid-cols-2">{guides.map(g=><Link key={g.slug} href={`/documentos/${g.slug}`} className="card space-y-2 p-5 hover:border-cyan-300"><p className="section-label text-cyan-700">{g.kind}</p><h3 className="font-bold">{g.title}</h3><p className="text-sm text-slate-600">{g.summary}</p><span className="text-sm font-semibold text-cyan-700">Guía y sitio oficial →</span></Link>)}</div></section>}<section className="grid gap-4 md:grid-cols-3">{[['Visa y autorización','Una visa, una autorización electrónica y una tarjeta de llegada cumplen funciones distintas. Comprueba qué combinación corresponde a tu ruta.'],['Pasaporte y estancia','Consulta el límite de días cuando esté disponible. Un resultado sin duración no significa estancia ilimitada.'],['Motivo y excepciones','Las reglas para turismo pueden diferir de trabajo, estudio o tránsito. Residencia y otros documentos pueden cambiar las condiciones.']].map(([title,text])=><div key={title} className="card p-5 space-y-2"><h2 className="font-bold">{title}</h2><p className="text-sm text-slate-600">{text}</p></div>)}</section><details className="card p-6"><summary className="cursor-pointer text-lg font-bold">Consultar por nacionalidad</summary><div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">{listAll().filter(c=>c.key!==dest.entry.key).map(c=><Link key={c.key} href={`/visa/${c.slug_es}/${dest.canonicalSlug}`} className="rounded-lg border p-3 text-sm hover:text-cyan-700">{c.name_es} → {dest.entry.name_es}</Link>)}</div></details><p className="rounded-xl bg-amber-50 p-5 text-sm text-amber-950">La decisión de ingreso corresponde a la autoridad fronteriza. Confirma las reglas aplicables a tu viaje en las fuentes oficiales antes de reservar.</p></div>;
}
