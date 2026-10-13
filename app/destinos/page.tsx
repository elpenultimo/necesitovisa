import type { Metadata } from "next";
import Link from "next/link";
import { listAll } from "@/lib/countryIndex";
export const metadata: Metadata = { title: "Requisitos de entrada por destino | NecesitoVisa.com", description: "Explora destinos de todo el mundo y consulta sus requisitos según tu nacionalidad.", alternates: { canonical: "https://necesitovisa.com/destinos" } };
export default function DestinationsPage() {
 return <div className="container-box space-y-7 py-10"><header className="space-y-3"><p className="section-label text-cyan-700">Explora el mundo</p><h1 className="text-3xl font-bold">Requisitos de entrada por destino</h1><p className="text-slate-600">Elige el país que quieres visitar. En su página podrás seleccionar tu nacionalidad y consultar la ruta correspondiente.</p></header><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{listAll().map(c=><Link key={c.key} href={`/visa/destino/${c.slug_es}`} className="card p-4 font-semibold hover:border-cyan-300 hover:text-cyan-700">{c.name_es} →</Link>)}</div></div>;
}
