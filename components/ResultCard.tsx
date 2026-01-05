import { Requirement } from "@/data/requirements";

interface ResultCardProps {
  requirement: Requirement;
}

export function ResultCard({ requirement }: ResultCardProps) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Respuesta rápida</p>
          <p className="text-2xl font-bold text-gray-900">
            {requirement.visaRequired ? "Sí, necesitas visa o autorización previa" : "No, no necesitas visa para una visita corta"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            requirement.visaRequired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {requirement.visaRequired ? "VISA" : "SIN VISA"}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        Última revisión: <strong>{requirement.lastReviewed}</strong>
      </p>
    </div>
  );
}
