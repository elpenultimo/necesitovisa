import fs from "fs";
import path from "path";

export type CountryIndexEntry = {
  name_en: string;
  name_es: string;
  slug_es: string;
  slug_en: string;
};

const metaPath = path.join(process.cwd(), "data", "generated", "countries.meta.json");
let cached: CountryIndexEntry[] | null = null;

function loadIndex(): CountryIndexEntry[] {
  if (cached) return cached;
  if (!fs.existsSync(metaPath)) return [];
  const raw = fs.readFileSync(metaPath, "utf8");
  cached = JSON.parse(raw) as CountryIndexEntry[];
  return cached;
}

export function listAll(): CountryIndexEntry[] {
  return loadIndex();
}

export function getBySpanishSlug(slug: string): CountryIndexEntry | undefined {
  return loadIndex().find((entry) => entry.slug_es === slug);
}

export function getByEnglishSlug(slug: string): CountryIndexEntry | undefined {
  return loadIndex().find((entry) => entry.slug_en === slug);
}

export function getByEnglishName(name: string): CountryIndexEntry | undefined {
  return loadIndex().find((entry) => entry.name_en === name);
}
