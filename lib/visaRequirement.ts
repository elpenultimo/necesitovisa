export type RequirementType =
  | "NO_VISA"
  | "NO_VISA_DAYS"
  | "E_VISA"
  | "ESTA"
  | "ETA"
  | "VOA"
  | "REQUIRES_VISA"
  | "UNKNOWN";

type NormalizedRequirement = {
  raw: string;
  type: RequirementType;
  days?: number;
  label: string;
  display: string;
};

export const NORMALIZATION_RULES = [
  { match: "NUMBER_ONLY", type: "NO_VISA_DAYS", icon: "☑️", label: (d: number) => `No necesita visa (${d} días)` },
  { includes: ["visa free", "visa-free"], type: "NO_VISA", icon: "☑️", label: "No necesita visa" },
  { includes: ["e-visa", "evisa"], type: "E_VISA", icon: "🟨", label: "e-Visa (trámite online)" },
  { includes: ["esta"], type: "ESTA", icon: "🟦", label: "ESTA (autorización electrónica)" },
  { includes: ["eta"], type: "ETA", icon: "🟦", label: "eTA / ETA (autorización electrónica)" },
  { includes: ["visa on arrival", "on arrival"], type: "VOA", icon: "🟧", label: "Visa a la llegada" },
  { includes: ["visa required", "required"], type: "REQUIRES_VISA", icon: "❌", label: "Sí requiere visa" },
  { fallback: true, type: "UNKNOWN", icon: "⚠️", label: "Requisito no especificado" },
] as const;

export function normalizeRequirement(raw: string | null | undefined): NormalizedRequirement {
  const sanitized = (raw ?? "").trim().toLowerCase().replace(/\s+/g, " ");

  if (/^\d+$/.test(sanitized)) {
    const days = parseInt(sanitized, 10);
    return {
      raw: raw ?? "",
      type: "NO_VISA_DAYS",
      days,
      label: `No necesita visa (${days} días)`,
      display: `☑️ No necesita visa (${days} días)`,
    };
  }

  if (sanitized.includes("visa free") || sanitized.includes("visa-free")) {
    return {
      raw: raw ?? "",
      type: "NO_VISA",
      label: "No necesita visa",
      display: "☑️ No necesita visa",
    };
  }

  if (sanitized.includes("e-visa") || sanitized.includes("evisa")) {
    return {
      raw: raw ?? "",
      type: "E_VISA",
      label: "e-Visa (trámite online)",
      display: "🟨 e-Visa (trámite online)",
    };
  }

  if (sanitized.includes("esta")) {
    return {
      raw: raw ?? "",
      type: "ESTA",
      label: "ESTA (autorización electrónica)",
      display: "🟦 ESTA (autorización electrónica)",
    };
  }

  if (sanitized === "eta" || sanitized.includes("eta")) {
    return {
      raw: raw ?? "",
      type: "ETA",
      label: "eTA / ETA (autorización electrónica)",
      display: "🟦 eTA / ETA (autorización electrónica)",
    };
  }

  if (sanitized.includes("visa on arrival") || sanitized.includes("on arrival")) {
    return {
      raw: raw ?? "",
      type: "VOA",
      label: "Visa a la llegada",
      display: "🟧 Visa a la llegada",
    };
  }

  if (sanitized.includes("visa required") || sanitized.includes("required")) {
    return {
      raw: raw ?? "",
      type: "REQUIRES_VISA",
      label: "Sí requiere visa",
      display: "❌ Sí requiere visa",
    };
  }

  return {
    raw: raw ?? "",
    type: "UNKNOWN",
    label: "Requisito no especificado",
    display: "⚠️ Requisito no especificado",
  };
}

export type { NormalizedRequirement };
