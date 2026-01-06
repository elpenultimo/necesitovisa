import { NormalizedRequirement, RequirementType } from "@/lib/visaRequirement";

const TYPE_STYLES: Record<RequirementType, string> = {
  REQUIRES_VISA: "bg-red-100 text-red-800",
  NO_VISA: "bg-green-100 text-green-800",
  NO_VISA_DAYS: "bg-green-100 text-green-800",
  E_VISA: "bg-amber-100 text-amber-800",
  ETA: "bg-blue-100 text-blue-800",
  VOA: "bg-orange-100 text-orange-800",
  UNKNOWN: "bg-gray-100 text-gray-800",
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
