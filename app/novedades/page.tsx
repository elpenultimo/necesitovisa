import type { Metadata } from "next";
import Link from "next/link";
import { newsEditions } from "@/lib/newsEditions";

export const metadata: Metadata = {
  title: "Novedades de visas y requisitos de entrada | NecesitoVisa.com",
  description: "Archivo de cambios de visas, autorizaciones y requisitos de entrada, con fuentes oficiales y consultas por nacionalidad.",
  alternates: { canonical: "/novedades" },
};

export default function NewsPage() {
  return (
    <div className="container-box max-w-4xl space-y-8 py-10">
      <header className="rounded-2xl bg-[#06283d] p-6 text-white sm:p-10">
        <p className="text-sm font-semibold text-sky-200">Archivo editorial</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Novedades de visas</h1>
        <p className="mt-3 max-w-2xl text-sky-100">Qué cambió en los requisitos de entrada, a quién afecta y dónde comprobarlo antes de viajar.</p>
      </header>
      <section aria-labelledby="ediciones" className="space-y-4">
        <h2 id="ediciones" className="text-2xl font-bold">Ediciones</h2>
        {newsEditions.map((edition) => (
          <article key={edition.slug} className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-600">{edition.period}</p>
            <h3 className="mt-2 text-xl font-semibold">
              <Link className="text-sky-800 underline-offset-4 hover:underline" href={`/novedades/${edition.slug}`}>{edition.title}</Link>
            </h3>
            <p className="mt-2 text-slate-700">{edition.summary}</p>
          </article>
        ))}
      </section>
      <section className="rounded-xl bg-sky-50 p-6">
        <h2 className="text-xl font-semibold">Cómo verificamos los cambios</h2>
        <p className="mt-2 text-slate-700">Cada edición enlaza las fuentes oficiales, distingue los anuncios de las medidas vigentes en la fecha del informe y señala las consultas afectadas. Si hay versiones oficiales contradictorias, la edición las separa de los cambios confirmados. Usa el archivo para entender qué cambió y la consulta por nacionalidad para revisar tu caso.</p>
      </section>
    </div>
  );
}
