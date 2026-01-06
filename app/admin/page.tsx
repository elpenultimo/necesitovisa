import { destinationCountries, originCountries } from "@/data/countries";
import { requirements } from "@/data/requirements";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";
import { REVIEW_STATUS_CONFIG, getReviewMetadata, ReviewStatusKey } from "@/lib/reviewStatus";
import { readHenleyDataset } from "@/lib/henleyDataset";
import { notFound } from "next/navigation";

export const metadata = {
  title: "NecesitoVisa.com",
  description: "Área interna",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type AdminPageProps = {
  searchParams?: {
    key?: string | string[];
    status?: string | string[];
    sort?: string | string[];
  };
};

const buildLookup = (items: { slug: string; name: string }[]) =>
  items.reduce<Record<string, string>>((acc, item) => {
    acc[item.slug] = item.name;
    return acc;
  }, {});

const originNameBySlug = buildLookup(originCountries);
const destinationNameBySlug = buildLookup(destinationCountries);

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="card p-4 space-y-2 bg-white shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

const RequirementRow = ({
  originSlug,
  destSlug,
  visaRequired,
  lastReviewedText,
  statusKey,
}: {
  originSlug: string;
  destSlug: string;
  visaRequired: boolean;
  lastReviewedText: string;
  statusKey: ReviewStatusKey;
}) => (
  <tr className="border-b border-gray-100">
    <td className="px-3 py-2 text-sm font-medium text-gray-900">{originNameBySlug[originSlug]}</td>
    <td className="px-3 py-2 text-sm text-gray-800">{destinationNameBySlug[destSlug]}</td>
    <td className="px-3 py-2 text-sm">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          visaRequired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}
      >
        {visaRequired ? "Requiere visa" : "Sin visa"}
      </span>
    </td>
    <td className="px-3 py-2 text-sm text-gray-700">{lastReviewedText}</td>
    <td className="px-3 py-2 text-sm">
      <ReviewStatusBadge statusKey={statusKey} />
    </td>
  </tr>
);

export default function AdminPage({ searchParams }: AdminPageProps) {
  const rawParam = Array.isArray(searchParams?.key) ? searchParams?.key[0] : searchParams?.key ?? "";
  const providedKey = rawParam.trim();
  const envKey = (process.env.ADMIN_KEY ?? "").trim();
  const hasAccess = envKey !== "" && providedKey === envKey;

  if (!hasAccess) {
    notFound();
  }

  const requiresVisaCount = requirements.filter((item) => item.visaRequired).length;

  const henleyDataset = readHenleyDataset();
  const formatDate = (value?: string | null, withTime = false) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(parsed);
  };

  const henleySourceDate = formatDate(henleyDataset?.source_date);
  const henleyGeneratedAt = formatDate(henleyDataset?.generated_at, true);

  const statusParamRaw = Array.isArray(searchParams?.status) ? searchParams?.status[0] : searchParams?.status;
  const rawStatusFilter = (statusParamRaw ?? "all").toLowerCase();
  const allowedStatuses: (ReviewStatusKey | "all")[] = ["all", "green", "yellow", "red"];
  const statusFilter: ReviewStatusKey | "all" = allowedStatuses.includes(rawStatusFilter as ReviewStatusKey | "all")
    ? (rawStatusFilter as ReviewStatusKey | "all")
    : "all";

  const sortParamRaw = Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : searchParams?.sort;
  const rawSortOption = (sortParamRaw ?? "stale").toLowerCase();
  const sortOption = ["stale", "recent"].includes(rawSortOption) ? rawSortOption : "stale";

  const requirementsWithMetadata = requirements.map((item) => {
    const reviewMetadata = getReviewMetadata(item);
    return {
      ...item,
      reviewMetadata,
    };
  });

  const statusCounts = requirementsWithMetadata.reduce<Record<ReviewStatusKey, number>>(
    (acc, item) => {
      acc[item.reviewMetadata.status.key] += 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

  const filteredRequirements = requirementsWithMetadata.filter((item) => {
    if (statusFilter === "all") return true;
    const normalizedFilter = statusFilter as ReviewStatusKey;
    return item.reviewMetadata.status.key === normalizedFilter;
  });

  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    if (sortOption === "recent") {
      return a.reviewMetadata.ageInMs - b.reviewMetadata.ageInMs;
    }
    return b.reviewMetadata.ageInMs - a.reviewMetadata.ageInMs;
  });

  return (
    <div className="container-box py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">Administración</p>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de requisitos</h1>
        <p className="text-sm text-gray-600">Revisa combinaciones de origen/destino y su estado de visado.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Países de origen" value={originCountries.length} />
        <StatCard label="Destinos" value={destinationCountries.length} />
        <StatCard label="Combinaciones" value={requirements.length} />
        <StatCard label="Requieren visa" value={`${requiresVisaCount} / ${requirements.length}`} />
      </div>

      <div className="card p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dataset Henley</h2>
            <p className="text-sm text-gray-600">Actualización manual, sin dependencias del build.</p>
          </div>
          {henleyDataset?.source_url ? (
            <a
              href={henleyDataset.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-brand-primary hover:text-brand-dark"
            >
              Ver fuente
            </a>
          ) : null}
        </div>
        <div className="space-y-1 text-sm text-gray-800">
          <p>
            Datos Henley actualizados al: <span className="font-semibold">{henleySourceDate ?? "Sin datos"}</span>
          </p>
          <p>
            Dataset generado el: <span className="font-semibold">{henleyGeneratedAt ?? "Sin datos"}</span>
          </p>
          {henleyDataset?.pdf_path ? (
            <p className="text-xs text-gray-600">Archivo local: {henleyDataset.pdf_path}</p>
          ) : (
            <p className="text-xs text-gray-500">Aún no se ha cargado el archivo generado en public/data.</p>
          )}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Listado de combinaciones</h2>
          <p className="text-sm text-gray-600">Última revisión y semáforo por fila.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(["green", "yellow", "red"] as ReviewStatusKey[]).map((statusKey) => (
            <div
              key={statusKey}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800"
            >
              <div className="flex items-center gap-2">
                <ReviewStatusBadge statusKey={statusKey} />
                <span>{REVIEW_STATUS_CONFIG[statusKey].label}</span>
              </div>
              <span className="font-semibold text-gray-900">{statusCounts[statusKey]}</span>
            </div>
          ))}
        </div>

        <form className="grid gap-3 md:grid-cols-3" method="get">
          <input type="hidden" name="key" value={providedKey} />
          <label className="flex flex-col gap-1 text-sm text-gray-800">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Semáforo</span>
            <select
              name="status"
              defaultValue={statusFilter}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none"
            >
              <option value="all">Todas</option>
              <option value="green">Actualizado (🟢)</option>
              <option value="yellow">Por revisar (🟡)</option>
              <option value="red">Desactualizado (🔴)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-800">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Ordenar</span>
            <select
              name="sort"
              defaultValue={sortOption}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none"
            >
              <option value="stale">Más desactualizado primero</option>
              <option value="recent">Más actualizado primero</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              Aplicar filtros
            </button>
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <th className="px-3 py-2">Origen</th>
                <th className="px-3 py-2">Destino</th>
                <th className="px-3 py-2">Visa</th>
                <th className="px-3 py-2">Última revisión</th>
                <th className="px-3 py-2">Semáforo</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequirements.map((item) => (
                <RequirementRow
                  key={`${item.originSlug}-${item.destSlug}`}
                  originSlug={item.originSlug}
                  destSlug={item.destSlug}
                  visaRequired={item.visaRequired}
                  lastReviewedText={item.reviewMetadata.lastReviewedText}
                  statusKey={item.reviewMetadata.status.key}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
