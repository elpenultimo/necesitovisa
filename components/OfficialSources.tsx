type OfficialSourcesProps = {
  originName: string;
  destinationName: string;
};

export function OfficialSources({ originName, destinationName }: OfficialSourcesProps) {
  return (
    <div className="card p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">📌 Verificación y fuentes oficiales</h2>
        <p className="text-sm text-gray-700">
          La información mostrada en esta página es referencial y puede cambiar en cualquier momento. Para confirmar requisitos
          actualizados, siempre recomendamos verificar directamente con fuentes oficiales.
        </p>
      </div>

      <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
        <li>
          <strong>Embajada o consulado de {destinationName} en {originName}</strong>
        </li>
        <li>
          <strong>Ministerio de Relaciones Exteriores de {originName}</strong>
        </li>
        <li>
          <strong>Sitio oficial de inmigración de {destinationName} (si aplica)</strong>
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
