import { DatasetFreshnessStatus, getDatasetFreshness } from "@/lib/visaDataset";

const STATUS_STYLES: Record<DatasetFreshnessStatus, { className: string; label: string }> = {
  green: { className: "bg-green-100 text-green-800", label: "Actualizado" },
  yellow: { className: "bg-yellow-100 text-yellow-800", label: "Reciente" },
  red: { className: "bg-red-100 text-red-800", label: "Desactualizado" },
};

export function DatasetBadge({
  status,
  generatedAt,
}: {
  status: DatasetFreshnessStatus;
  generatedAt?: string | null;
}) {
  const freshness = getDatasetFreshness(generatedAt ?? undefined);
  const style = STATUS_STYLES[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}>
      <span aria-hidden>●</span>
      <span>{style.label}</span>
      <span className="text-[11px] font-normal text-gray-700">{freshness.generatedAtText}</span>
    </span>
  );
}
