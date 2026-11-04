import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { newsEditions } from "@/lib/newsEditions";

type Props = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return newsEditions.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const edition = newsEditions.find(({ slug }) => slug === params.slug);
  if (!edition) return {};
  return {
    title: `${edition.title} | NecesitoVisa.com`,
    description: edition.summary,
    alternates: { canonical: `/novedades/${edition.slug}` },
    openGraph: { type: "article", title: edition.title, description: edition.summary },
  };
}

export default function NewsEdition({ params }: Props) {
  const edition = newsEditions.find(({ slug }) => slug === params.slug);
  if (!edition) notFound();

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: edition.title,
    description: edition.summary,
    author: { "@type": "Organization", name: "NecesitoVisa.com", url: "https://necesitovisa.com/" },
    mainEntityOfPage: `https://necesitovisa.com/novedades/${edition.slug}`,
  };

  return (
    <article className="container-box max-w-4xl space-y-8 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
      <Link href="/novedades" className="font-medium text-sky-800 underline underline-offset-4">← Todas las novedades</Link>
      <header>
        <p className="text-sm font-medium text-slate-600">Archivo · {edition.period} · NecesitoVisa.com</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{edition.title}</h1>
        <p className="mt-3 text-lg text-slate-700">{edition.summary}</p>
      </header>
      <p className="rounded-xl bg-sky-50 p-4 text-slate-700">Esta edición documenta cambios de ese período. Si vas a viajar, revisa la consulta y la fuente oficial para tu fecha de entrada.</p>
      {edition.changes.map((change) => (
        <section key={change.title} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">{change.title}</h2>
          <p>{change.explanation}</p>
          <p>{change.action}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-sky-800">
            <a className="underline underline-offset-4" href={change.source}>{change.sourceLabel}</a>
            <Link prefetch={false} className="underline underline-offset-4" href={change.route}>{change.routeLabel}</Link>
          </div>
        </section>
      ))}
    </article>
  );
}
