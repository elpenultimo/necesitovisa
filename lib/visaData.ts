import fs from "fs";
import path from "path";

export type DestinationEntry = {
  key: string;
  name_es: string;
  slug_es: string;
  requirement: string;
};

export type OriginVisaData = {
  origin_key: string;
  origin_name_es: string;
  origin_slug_es: string;
  destinations: DestinationEntry[];
  slug_to_key: Record<string, string>;
  alt_slug_to_slug: Record<string, string>;
  raw?: {
    origin: string;
    destinations: Record<string, string>;
  };
};

const dataDir = path.join(process.cwd(), "data", "generated");

export function readVisaDataByKey(originKey: string): OriginVisaData | null {
  const filePath = path.join(dataDir, `${originKey}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as OriginVisaData;
}

export function resolveDestinationBySlug(
  data: OriginVisaData,
  slug: string,
): { canonicalSlug: string; destination: DestinationEntry } | null {
  const canonicalSlug = data.alt_slug_to_slug[slug] ?? slug;
  const key = data.slug_to_key[canonicalSlug];
  if (!key) return null;
  const destination = data.destinations.find((dest) => dest.key === key);
  if (!destination) return null;
  return { canonicalSlug, destination };
}
