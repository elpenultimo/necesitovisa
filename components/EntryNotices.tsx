import notices from "@/data/entry-notices.json";
import type { DestinationEntry } from "@/lib/visaData";
import type { RequirementType } from "@/lib/visaRequirement";

type Notice = {
  id: string;
  destination: string;
  origins?: string[];
  requirementTypes?: string[];
  title: string;
  text: string;
  effectiveFrom?: string;
  verifiedAt: string;
  source: string;
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function EntryNotices({ origin, destination, requirementType }: {
  origin: string;
  destination: DestinationEntry;
  requirementType: RequirementType;
}) {
  const applicable = (notices as Notice[]).filter(notice =>
    notice.destination === destination.key &&
    (!notice.origins || notice.origins.includes(origin)) &&
    (!notice.requirementTypes || notice.requirementTypes.includes(requirementType))
  );
  const override = destination.override;
  if (!override && applicable.length === 0) return null;

  return (
    <section className="card p-6 space-y-5" aria-labelledby="entry-notices-title">
      <h2 id="entry-notices-title" className="text-xl font-semibold text-slate-900">Actualizaciones y condiciones de entrada</h2>
      {override && (
        <article className="space-y-2 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-900">Requisito verificado en fuente oficial</h3>
          {override.note && <p>{override.note}</p>}
          {override.effectiveFrom && <p>Aplicable desde: {formatDate(override.effectiveFrom)}.</p>}
          {override.expiresAt && <p>Vigencia hasta: {formatDate(override.expiresAt)}.</p>}
          <p className="text-slate-500">Verificado el {formatDate(override.verifiedAt)}. <a href={override.source} target="_blank" rel="noopener noreferrer" className="underline text-sky-700">Fuente oficial</a></p>
        </article>
      )}
      {applicable.map(notice => (
        <article key={notice.id} className="border-t border-slate-200 pt-4 space-y-2 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-900">{notice.title}</h3>
          <p>{notice.text}</p>
          {notice.effectiveFrom && <p>Fecha de aplicación: {formatDate(notice.effectiveFrom)}.</p>}
          <p className="text-slate-500">Verificado el {formatDate(notice.verifiedAt)}. <a href={notice.source} target="_blank" rel="noopener noreferrer" className="underline text-sky-700">Fuente oficial</a></p>
        </article>
      ))}
    </section>
  );
}
