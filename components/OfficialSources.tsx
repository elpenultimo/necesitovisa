import embassies from "@/data/embassies.json";
import { getCountryIso2FromNameEs, iso2ToFlagEmoji } from "@/lib/countryFlag";

type OfficialSourcesProps = {
  originName: string;
  destinationName: string;
  originSlug: string;
  destinationSlug: string;
};

type EmbassyDataset = Record<string, Record<string, { title: string; url: string }>>;

export function OfficialSources({
  originName,
  destinationName,
  originSlug,
  destinationSlug,
}: OfficialSourcesProps) {
  const iso2 = getCountryIso2FromNameEs(destinationName);
  const flagEmoji = iso2 ? iso2ToFlagEmoji(iso2) : undefined;
  const embassyDataset = embassies as EmbassyDataset;
  const directEmbassyLink = embassyDataset[originSlug]?.[destinationSlug];

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `embajada de ${destinationName} en ${originName}`,
  )}`;

  const flagElement = flagEmoji ? (
    <span aria-hidden className="text-2xl">{flagEmoji}</span>
  ) : iso2 ? (
    <img
      src={`https://flagcdn.com/w40/${iso2.toLowerCase()}.png`}
      alt={`Bandera de ${destinationName}`}
      className="h-5 w-7 rounded-sm object-cover"
    />
  ) : null;

  return (
    <div className="card p-6 space-y-4">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">📌 Verificación y fuentes oficiales</h2>
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          {flagElement}
          <span>{destinationName}</span>
        </div>
        <p className="text-sm text-gray-700">
          La información mostrada en esta página es referencial y puede cambiar en cualquier momento. Para confirmar requisitos
          actualizados, siempre recomendamos verificar directamente con fuentes oficiales.
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-800">
        <a
          href={googleSearchUrl}
          className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 font-medium text-blue-700 transition hover:bg-blue-100"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden>🔎</span>
          <span>
            Buscar embajada de {destinationName} en {originName}
          </span>
        </a>

        {directEmbassyLink && (
          <div>
            <a
              href={directEmbassyLink.url}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 font-medium text-emerald-700 transition hover:bg-emerald-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden>🔗</span>
              <span>Sitio oficial de la embajada/consulado</span>
            </a>
            <p className="mt-1 text-xs text-gray-600">{directEmbassyLink.title}</p>
          </div>
        )}
      </div>

      <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
        <p>
          Las políticas migratorias pueden cambiar sin previo aviso. NecesitoVisa.com no se hace responsable por modificaciones
          posteriores a la fecha de consulta.
        </p>
      </div>
    </div>
  );
}
