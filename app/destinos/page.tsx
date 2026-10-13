import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/DestinationCard";
import { destinationPhotos } from "@/lib/destinationPhotos";
import { listAll } from "@/lib/countryIndex";
export const metadata: Metadata = { title: "Requisitos de entrada por destino | NecesitoVisa.com", description: "Explora destinos de todo el mundo y consulta sus requisitos según tu nacionalidad.", alternates: { canonical: "https://necesitovisa.com/destinos" } };
export default function DestinationsPage() {
 return <div className="container-box space-y-7 py-10"><header className="space-y-3"><p className="section-label text-cyan-700">Explora el mundo</p><h1 className="text-3xl font-bold">Requisitos de entrada por destino</h1><p className="text-slate-600">Elige el país que quieres visitar. En su página podrás seleccionar tu nacionalidad y consultar la ruta correspondiente.</p></header><section className="space-y-4"><h2 className="text-xl font-bold">Destinos destacados</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{listAll().filter(c => destinationPhotos[c.slug_es]).map(c => <DestinationCard key={c.key} slug={c.slug_es} name={c.name_es} />)}</div></section><section className="space-y-4"><h2 className="text-xl font-bold">Todos los destinos</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{listAll().map(c=><Link key={c.key} href={`/visa/destino/${c.slug_es}`} className="card p-4 font-semibold hover:border-cyan-300 hover:text-cyan-700">{c.name_es} →</Link>)}</div></section></div>;
}
