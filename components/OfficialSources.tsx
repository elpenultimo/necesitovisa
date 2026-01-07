import countries from "i18n-iso-countries";

countries.registerLocale({ locale: "es" });

type OfficialSourcesProps = {
  originName: string;
  destinationName: string;
};

function getFlagEmoji(countryName: string): string | null {
  const alpha2 = countries.getAlpha2Code(countryName, "es") ?? countries.getAlpha2Code(countryName, "en");
  if (!alpha2 || alpha2.length !== 2) return null;
  return alpha2
    .toUpperCase()
    .split("")
    .map((char: string) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function OfficialSources({ originName, destinationName }: OfficialSourcesProps) {
  const destinationFlag = getFlagEmoji(destinationName);
  const embassyQuery = `embajada de ${destinationName} en ${originName}`;
  const foreignAffairsQuery = `ministerio relaciones exteriores ${originName}`;
  const immigrationQuery = `sitio oficial inmigración ${destinationName}`;

  return (
    <div className="card p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">📌 Verificación y fuentes oficiales</h2>
        <p className="text-sm text-gray-700">
          La información mostrada en esta página es referencial y puede cambiar en cualquier momento. Para confirmar requisitos
          actualizados, siempre recomendamos verificar directamente con fuentes oficiales.
        </p>
      </div>

      <a
        className="inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
        href={buildGoogleSearchUrl(embassyQuery)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Buscar embajada de {destinationName} en {originName}
      </a>

      <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
        <li>
          <a
            className="text-brand-primary underline underline-offset-2 hover:text-brand-dark"
            href={buildGoogleSearchUrl(embassyQuery)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>
              Embajada o consulado de {destinationName}
              {destinationFlag ? ` ${destinationFlag}` : ""} en {originName}
            </strong>
          </a>
        </li>
        <li>
          <a
            className="text-brand-primary underline underline-offset-2 hover:text-brand-dark"
            href={buildGoogleSearchUrl(foreignAffairsQuery)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>Ministerio de Relaciones Exteriores de {originName}</strong>
          </a>
        </li>
        <li>
          <a
            className="text-brand-primary underline underline-offset-2 hover:text-brand-dark"
            href={buildGoogleSearchUrl(immigrationQuery)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>Sitio oficial de inmigración de {destinationName} (si aplica)</strong>
          </a>
        </li>
      </ul>

      <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
        <p>
          Las políticas migratorias pueden cambiar sin previo aviso. NecesitoVisa.com no se hace responsable por modificaciones
          posteriores a la fecha de consulta.
        </p>
      </div>
    </div>
  );
}
