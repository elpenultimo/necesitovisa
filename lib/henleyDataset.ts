import fs from "fs";
import path from "path";
import { destinationCountries, originCountries } from "@/data/countries";
import { Requirement, requirementIndex } from "@/data/requirements";

export type VisaStatus = "visa_free" | "visa_required";
export type HenleyMatrix = Record<string, Record<string, VisaStatus>>;

export type HenleyMeta = {
  source_date?: string;
  generated_at?: string;
  source?: string;
  source_urls?: string[];
  countries?: string[];
};

export type HenleyDataset = {
  matrix: HenleyMatrix;
  meta: HenleyMeta;
};

const DATA_DIR = path.join(process.cwd(), "public", "data");
const MATRIX_PATH = path.join(DATA_DIR, "visa-matrix.generated.json");
const META_PATH = path.join(DATA_DIR, "visa-matrix.generated.meta.json");

const originSlugByIso = new Map<string, string>(
  originCountries.filter((item) => item.iso2).map((item) => [item.iso2 as string, item.slug])
);
const destSlugByIso = new Map<string, string>(
  destinationCountries.filter((item) => item.iso2).map((item) => [item.iso2 as string, item.slug])
);

const createFallbackRequirement = (originSlug: string, destSlug: string, visaRequired: boolean, sourceDate?: string): Requirement => ({
  originSlug,
  destSlug,
  visaRequired,
  maxStayDays: null,
  altPermit: null,
  passportRule: "Revisa los requisitos oficiales del destino antes de viajar.",
  onwardTicket: "Confirma si exigen boleto de salida o itinerario completo.",
  fundsProof: "Asegúrate de contar con medios económicos demostrables para tu estadía.",
  notes: [],
  sources: [],
  embassy: {
    name: "Embajada o consulado del destino",
    url: "",
    email: null,
    phone: null,
    address: null,
  },
  lastReviewed: sourceDate ?? "",
});

export const loadHenleyDataset = (): HenleyDataset | null => {
  try {
    if (!fs.existsSync(MATRIX_PATH) || !fs.existsSync(META_PATH)) {
      return null;
    }

    const rawMatrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
    const rawMeta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));

    if (!rawMatrix?.matrix || typeof rawMatrix.matrix !== "object") {
      console.warn("[henley] Estructura inesperada en visa-matrix.generated.json");
      return null;
    }

    return {
      matrix: rawMatrix.matrix as HenleyMatrix,
      meta: rawMeta as HenleyMeta,
    };
  } catch (error) {
    console.error("[henley] No se pudo leer el dataset generado:", error);
    return null;
  }
};

export const buildRequirementsFromHenley = (dataset: HenleyDataset): Requirement[] => {
  const requirementsFromMatrix: Requirement[] = [];

  Object.entries(dataset.matrix).forEach(([originIso, destinations]) => {
    const originSlug = originSlugByIso.get(originIso);

    if (!originSlug) {
      return;
    }

    Object.entries(destinations).forEach(([destIso, status]) => {
      const destSlug = destSlugByIso.get(destIso);

      if (!destSlug) {
        return;
      }

      const visaRequired = status === "visa_required";
      const existingRequirement = requirementIndex.get(`${originSlug}-${destSlug}`);
      const baseRequirement = existingRequirement ?? createFallbackRequirement(originSlug, destSlug, visaRequired, dataset.meta.source_date);

      requirementsFromMatrix.push({
        ...baseRequirement,
        visaRequired,
        lastReviewed: baseRequirement.lastReviewed || dataset.meta.source_date || "",
      });
    });
  });

  return requirementsFromMatrix;
};
