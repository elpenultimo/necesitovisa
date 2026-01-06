import fs from "fs";
import path from "path";

export type CountryIndexEntry = {
  key: string;
  name_en: string;
  name_es: string;
  slug_es: string;
  slug_en: string;
  alt_slugs: string[];
};

export type CountryIndex = {
  list: CountryIndexEntry[];
  map_slug_to_key: Record<string, string>;
  map_alt_to_slug: Record<string, string>;
};

const indexPath = path.join(process.cwd(), "data", "generated", "index.json");
let cachedData: CountryIndex | null = null;
let cachedMap: Map<string, CountryIndexEntry> | null = null;

function defaultIndex(): CountryIndex {
  return { list: [], map_slug_to_key: {}, map_alt_to_slug: {} };
}

function loadIndex(): CountryIndex {
  if (cachedData) return cachedData;
  if (!fs.existsSync(indexPath)) return defaultIndex();

  const raw = fs.readFileSync(indexPath, "utf8");
  cachedData = JSON.parse(raw) as CountryIndex;
  return cachedData;
}

function ensureMap(): Map<string, CountryIndexEntry> {
  if (cachedMap) return cachedMap;
  const data = loadIndex();
  cachedMap = new Map(data.list.map((entry) => [entry.key, entry]));
  return cachedMap;
}

export function listAll(): CountryIndexEntry[] {
  return loadIndex().list;
}

export function getByKey(key: string): CountryIndexEntry | undefined {
  return ensureMap().get(key);
}

export function resolveOrigin(slug: string):
  | { entry: CountryIndexEntry; canonicalSlug: string; redirected: boolean }
  | null {
  const data = loadIndex();

  if (data.map_slug_to_key[slug]) {
    const entry = getByKey(data.map_slug_to_key[slug]);
    if (!entry) return null;
    return { entry, canonicalSlug: slug, redirected: false };
  }

  const canonicalSlug = data.map_alt_to_slug[slug];
  if (canonicalSlug && data.map_slug_to_key[canonicalSlug]) {
    const entry = getByKey(data.map_slug_to_key[canonicalSlug]);
    if (!entry) return null;
    return { entry, canonicalSlug, redirected: true };
  }

  return null;
}
