import fs from "fs";
import path from "path";
import { originCountries } from "@/data/countries";

export type HenleyVisaEntry = {
  requiresVisa: boolean | null;
  source?: string;
  pdfUpdatedAt?: string | null;
};

export type HenleyMatrix = Record<string, Record<string, HenleyVisaEntry>>;

export type HenleySourceMeta = {
  originISO: string;
  pdfPath: string;
  pdfUpdatedAt: string | null;
  status: string;
  parseError?: string;
};

export type HenleyMeta = {
  generatedAt: string;
  sources: HenleySourceMeta[];
};

const matrixPath = path.join(process.cwd(), "public", "data", "visa-matrix.generated.json");
const metaPath = path.join(process.cwd(), "public", "data", "visa-matrix.generated.meta.json");

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const destinationAliases: Record<string, string[]> = {
  "estados-unidos": ["united states", "united states of america", "usa", "us", "eeuu", "estados unidos"],
  canada: ["canada", "canadá"],
  mexico: ["mexico", "méxico"],
  brasil: ["brazil", "brasil"],
  "reino-unido": ["united kingdom", "uk", "reino unido", "great britain"],
  japon: ["japan", "japon"],
  australia: ["australia"],
  china: ["china"],
  turquia: ["turkey", "türkiye", "turquia", "tuerkiye"],
  schengen: ["schengen", "schengen area", "europe", "european union"],
};

const originSlugByIso = originCountries.reduce<Record<string, string>>((acc, country) => {
  if (country.iso2) {
    acc[country.iso2.toUpperCase()] = country.slug;
  }
  return acc;
}, {});

const destinationSlugByAlias = Object.entries(destinationAliases).reduce<Record<string, string>>(
  (acc, [slug, aliases]) => {
    aliases.forEach((alias) => {
      acc[normalize(alias)] = slug;
    });
    return acc;
  },
  {}
);

export const loadHenleyMatrix = (): HenleyMatrix | null => {
  try {
    if (!fs.existsSync(matrixPath)) return null;
    const content = fs.readFileSync(matrixPath, "utf8");
    if (!content.trim()) return null;
    return JSON.parse(content) as HenleyMatrix;
  } catch (err) {
    console.warn("No se pudo leer el archivo generado de Henley", err);
    return null;
  }
};

export const loadHenleyMeta = (): HenleyMeta | null => {
  try {
    if (!fs.existsSync(metaPath)) return null;
    const content = fs.readFileSync(metaPath, "utf8");
    if (!content.trim()) return null;
    return JSON.parse(content) as HenleyMeta;
  } catch (err) {
    console.warn("No se pudo leer el archivo meta de Henley", err);
    return null;
  }
};

export const buildHenleyOverrideMap = (matrix: HenleyMatrix | null) => {
  const overrides = new Map<string, { requiresVisa: boolean | null; pdfUpdatedAt: string | null }>();
  if (!matrix) return overrides;

  Object.entries(matrix).forEach(([originISO, destinations]) => {
    const originSlug = originSlugByIso[originISO];
    if (!originSlug) return;

    Object.entries(destinations).forEach(([destinationName, info]) => {
      const normalized = normalize(destinationName);
      const destSlug = destinationSlugByAlias[normalized];
      if (!destSlug) return;

      overrides.set(`${originSlug}-${destSlug}`, {
        requiresVisa: info.requiresVisa,
        pdfUpdatedAt: info.pdfUpdatedAt ?? null,
      });
    });
  });

  return overrides;
};
