import { NormalizedRequirement, RequirementType } from "@/lib/visaRequirement";

const TYPE_STYLES: Record<RequirementType, string> = {
  REQUIRES_VISA: "bg-rose-100 text-rose-800",
  NO_VISA: "bg-emerald-100 text-emerald-800",
  NO_VISA_DAYS: "bg-emerald-100 text-emerald-800",
  E_VISA: "bg-amber-100 text-amber-800",
  ETA: "bg-amber-100 text-amber-800",
  VOA: "bg-amber-100 text-amber-800",
  UNKNOWN: "bg-slate-100 text-slate-700",
};

type VisaRequirementBadgeProps = {
  requirement: NormalizedRequirement;
};

export function VisaRequirementBadge({ requirement }: VisaRequirementBadgeProps) {
  const requirement_type = requirement.type;
  const requirement_display = requirement.display;
  const requirement_raw = requirement.raw;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${TYPE_STYLES[requirement_type]}`}
      title={requirement_raw ? `Valor fuente: ${requirement_raw}` : undefined}
    >
      {requirement_display}
    </span>
  );
}
