import countries from "i18n-iso-countries";

countries.registerLocale({ locale: "es" });

const directSources: Record<string, { label: string; url: string }[]> = {
  "Estados Unidos": [{label:"CBP: programa ESTA",url:"https://www.help.cbp.gov/s/article/Article-1437?language=en_US"},{label:"Solicitud oficial ESTA",url:"https://esta.cbp.dhs.gov/"}],
  "Reino Unido": [{label:"GOV.UK: comprobar visa o ETA",url:"https://www.gov.uk/check-uk-visa"},{label:"Solicitud oficial ETA",url:"https://www.gov.uk/eta/apply"}],
  "Tailandia": [{label:"Inmigración: tarjeta TDAC y excepciones",url:"https://tdac.immigration.go.th/manual/en/faq.html"}],
  "Malasia": [{label:"Inmigración: MDAC",url:"https://www.imi.gov.my/index.php/en/pengumuman/malaysia-digital-arrival-card-mdac/"}],
  "Cabo Verde": [{label:"Gobierno: nacionalidades con visa obligatoria",url:"https://www.gov.cv/en/paises-com-visto-obrigatorio-para-cabo-verde"}],
  "Arabia Saudí": [{label:"Portal oficial de eVisa turística",url:"https://visa.visitsaudi.com/"}],
  "Surinam": [{label:"Portal oficial de eVisa",url:"https://suriname.vfsevisa.com/"}],
};

type OfficialSourcesProps = {
  originName: string;
  destinationName: string;
  isDomesticTrip?: boolean;
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

export function OfficialSources({ originName, destinationName, isDomesticTrip = false }: OfficialSourcesProps) {
  if (isDomesticTrip) {
    return (
      <div className="card p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">📌 Documentación para viajar dentro de tu país</h2>
          <p className="text-sm text-slate-600">
            Para viajar dentro de tu propio país no necesitas visa. Solo asegúrate de llevar tu documentación
            oficial vigente (por ejemplo, cédula de identidad o pasaporte, según corresponda). En algunos casos (vuelos
            domésticos o zonas especiales) podrían pedirte identificación al embarcar o en controles.
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <p>Las normas internas pueden cambiar. Verifica requisitos de identificación según el medio de transporte y normativa local.</p>
        </div>
      </div>
    );
  }

  const destinationFlag = getFlagEmoji(destinationName);
  const originFlag = getFlagEmoji(originName);
  const embassyQuery = `embajada de ${destinationName} en ${originName}`;
  const foreignAffairsQuery = `ministerio relaciones exteriores ${originName}`;
  const immigrationQuery = `sitio oficial inmigración ${destinationName}`;
  const migrationBorderQuery = `sitio oficial migración frontera ${destinationName}`;

  return (
    <div className="card p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          📌 Fuentes y verificación{destinationFlag ? ` ${destinationFlag}` : ""}
        </h2>
        <p className="text-sm text-slate-600">
          La información mostrada en esta página es referencial y puede cambiar en cualquier momento. Para confirmar requisitos
          actualizados, siempre recomendamos verificar directamente con fuentes oficiales.
        </p>
      </div>

      {(directSources[destinationName] || []).map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-semibold text-cyan-700 underline">{source.label} ↗</a>)}
      <p className="text-xs text-slate-500">Los siguientes enlaces abren búsquedas para localizar representaciones y autoridades. Comprueba que el resultado pertenezca al organismo oficial.</p>

      {!isDomesticTrip && (
        <a
          className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark"
          href={buildGoogleSearchUrl(embassyQuery)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buscar embajada de {destinationName} en {originName}
        </a>
      )}

      <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
        <li>
          <a
            className="text-brand-primary underline underline-offset-2 hover:text-brand-dark"
            href={buildGoogleSearchUrl(isDomesticTrip ? migrationBorderQuery : embassyQuery)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>
              {isDomesticTrip ? (
                <>Sitio oficial de migración / frontera de {destinationName} (si aplica)</>
              ) : (
                <>
                  Buscar embajada o consulado de {destinationFlag ? `${destinationFlag} ` : ""}
                  {destinationName} en {originFlag ? `${originFlag} ` : ""}
                  {originName}
                </>
              )}
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
            <strong>Buscar Ministerio de Relaciones Exteriores de {originName}</strong>
          </a>
        </li>
        <li>
          <a
            className="text-brand-primary underline underline-offset-2 hover:text-brand-dark"
            href={buildGoogleSearchUrl(immigrationQuery)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>
              {isDomesticTrip
                ? `Autoridad de migración / control fronterizo de ${destinationName} (si aplica)`
                : `Buscar autoridad de inmigración de ${destinationName}`}
            </strong>
          </a>
        </li>
      </ul>

      <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        <p>
          Las políticas migratorias pueden cambiar sin previo aviso. NecesitoVisa.com no se hace responsable por modificaciones
          posteriores a la fecha de consulta.
        </p>
      </div>
    </div>
  );
}
