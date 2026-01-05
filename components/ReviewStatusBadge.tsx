import { REVIEW_STATUS_CONFIG, ReviewStatusKey } from "@/lib/reviewStatus";

const badgeStyles: Record<ReviewStatusKey, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  red: "bg-red-100 text-red-800 border-red-200",
};

export function ReviewStatusBadge({
  statusKey,
  withLabel = true,
}: {
  statusKey: ReviewStatusKey;
  withLabel?: boolean;
}) {
  const status = REVIEW_STATUS_CONFIG[statusKey];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        badgeStyles[statusKey]
      }`}
      aria-label={`Estado de revisión: ${status.label}`}
    >
      <span aria-hidden>{status.emoji}</span>
      {withLabel && status.label}
    </span>
  );
}
