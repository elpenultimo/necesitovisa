import { destinationCountries, originCountries } from "@/data/countries";
import { requirements } from "@/data/requirements";

export const metadata = {
  title: "Panel de revisión | NecesitoVisa.com",
  description: "Panel interno para revisar combinaciones de visa.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type AdminPageProps = {
  searchParams?: {
    key?: string | string[];
  };
};

const buildLookup = (items: { slug: string; name: string }[]) =>
  items.reduce<Record<string, string>>((acc, item) => {
    acc[item.slug] = item.name;
    return acc;
  }, {});

const originNameBySlug = buildLookup(originCountries);
const destinationNameBySlug = buildLookup(destinationCountries);

const RestrictedCard = ({ suggestedKey }: { suggestedKey: string }) => (
  <div className="card p-6 space-y-4">
    <div className="space-y-1">
      <h2 className="text-xl font-semibold text-gray-900">Acceso restringido</h2>
      <p className="text-gray-700">
        Para ingresar al panel agrega el parámetro <code>?key=</code> en la URL. Si no tienes la clave, pide acceso al administrador.
      </p>
    </div>
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-800" htmlFor="admin-key-input">
        Ejemplo de URL con clave
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id="admin-key-input"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-inner focus:border-brand-primary focus:outline-none"
          defaultValue={`?key=${suggestedKey || "tu_clave"}`}
          readOnly
        />
        <span className="text-sm text-gray-600">Pegala al final de /admin</span>
      </div>
    </div>
    <p className="text-xs text-gray-500">
      Configura ADMIN_KEY en Vercel (Preview y Production) y redeploy.
    </p>
  </div>
);

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
  lastReviewed,
}: {
  originSlug: string;
  destSlug: string;
  visaRequired: boolean;
  lastReviewed: string;
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
    <td className="px-3 py-2 text-sm text-gray-700">{lastReviewed}</td>
  </tr>
);

export default function AdminPage({ searchParams }: AdminPageProps) {
  const rawParam = Array.isArray(searchParams?.key) ? searchParams?.key[0] : searchParams?.key ?? "";
  const providedKey = rawParam.trim();
  const envKey = (process.env.ADMIN_KEY ?? "").trim();
  const hasAccess = envKey !== "" && providedKey === envKey;

  const requiresVisaCount = requirements.filter((item) => item.visaRequired).length;

  if (!hasAccess) {
    return (
      <div className="container-box py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">Panel de revisión</p>
          <h1 className="text-3xl font-bold text-gray-900">Panel de revisión</h1>
          <p className="text-sm text-gray-600">Configura ADMIN_KEY en Vercel (Preview y Production) y redeploy.</p>
        </div>
        <RestrictedCard suggestedKey={envKey} />
      </div>
    );
  }

  return (
    <div className="container-box py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">Panel de revisión</p>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de requisitos</h1>
        <p className="text-sm text-gray-600">
          Revisa combinaciones de origen/destino y su estado de visado. Configura ADMIN_KEY en Vercel (Preview y Production) y redeploy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Países de origen" value={originCountries.length} />
        <StatCard label="Destinos" value={destinationCountries.length} />
        <StatCard label="Combinaciones" value={requirements.length} />
        <StatCard label="Requieren visa" value={`${requiresVisaCount} / ${requirements.length}`} />
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Listado de combinaciones</h2>
          <p className="text-sm text-gray-600">Última revisión por fila.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <th className="px-3 py-2">Origen</th>
                <th className="px-3 py-2">Destino</th>
                <th className="px-3 py-2">Visa</th>
                <th className="px-3 py-2">Última revisión</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((item) => (
                <RequirementRow
                  key={`${item.originSlug}-${item.destSlug}`}
                  originSlug={item.originSlug}
                  destSlug={item.destSlug}
                  visaRequired={item.visaRequired}
                  lastReviewed={item.lastReviewed}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
