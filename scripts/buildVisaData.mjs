import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getCountryNameEs, slugifyEs } from "../lib/countryEs.js";

function slugifyEn(input) {
  const normalized = input.toLowerCase().normalize("NFD").replace(/\p{Diacritic}+/gu, "");
  const replaced = normalized.replace(/[\s/]+/g, "-");
  const sanitized = replaced.replace(/[^a-z0-9-]/g, "");
  return sanitized.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

const CSV_PATH = path.join(process.cwd(), "data/passport-index-matrix.csv");
const OVERRIDES_PATH = path.join(process.cwd(), "data/visa-overrides.json");
const OUT_DIR = path.join(process.cwd(), "data/generated");
const META_PATH = path.join(OUT_DIR, "countries.meta.json");
const INDEX_PATH = path.join(OUT_DIR, "index.json");

function loadOverrides(originKeys, destinationKeys) {
  if (!fs.existsSync(OVERRIDES_PATH)) return new Map();

  const { schemaVersion, overrides } = JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"));
  if (schemaVersion !== 1 || !Array.isArray(overrides)) {
    throw new Error("Formato inválido en data/visa-overrides.json");
  }

  const result = new Map();
  for (const override of overrides) {
    const { origin, destination, requirement, source, verifiedAt, expiresAt } = override;
    if (![origin, destination, requirement, source, verifiedAt].every(value => typeof value === "string" && value.trim())) {
      throw new Error("Cada override requiere origin, destination, requirement, source y verifiedAt");
    }
    if (!originKeys.has(origin) || !destinationKeys.has(destination)) {
      throw new Error("Override apunta a país desconocido: " + origin + " -> " + destination);
    }
    if (expiresAt) {
      const expiry = new Date(expiresAt + "T23:59:59Z");
      if (Number.isNaN(expiry.valueOf())) throw new Error("Fecha expiresAt inválida: " + expiresAt);
      if (expiry < new Date()) throw new Error("Override vencido: " + origin + " -> " + destination + " (" + expiresAt + ")");
    }
    const key = origin + "\t" + destination;
    if (result.has(key)) throw new Error("Override duplicado: " + origin + " -> " + destination);
    result.set(key, override);
  }
  return result;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const csvText = fs.readFileSync(CSV_PATH, "utf8");
const records = parse(csvText, { columns: false, skip_empty_lines: true });
const header = records[0].slice(1);
const originKeys = new Set(records.slice(1).map(row => row[0]).filter(Boolean));
const destinationKeys = new Set(header);
const overrides = loadOverrides(originKeys, destinationKeys);

let generated = 0;
const metaEntries = [];
const indexList = [];
const mapSlugToKey = {};
const mapAltToSlug = {};

function ensureUniqueSlug(base, tracker) {
  if (!tracker.has(base)) {
    tracker.set(base, 1);
    return base;
  }
  const count = tracker.get(base) + 1;
  tracker.set(base, count);
  return base + "-" + count;
}

const originSlugTracker = new Map();

for (let i = 1; i < records.length; i++) {
  const row = records[i];
  const originKey = row[0];
  if (!originKey) continue;

  const originNameEs = getCountryNameEs(originKey);
  const originSlugEn = slugifyEn(originKey);
  const originSlugEs = ensureUniqueSlug(slugifyEs(originNameEs) || originSlugEn, originSlugTracker);
  mapSlugToKey[originSlugEs] = originKey;

  const originAltSlugs = [];
  if (originSlugEn && originSlugEn !== originSlugEs) {
    originAltSlugs.push(originSlugEn);
    mapAltToSlug[originSlugEn] = originSlugEs;
  }

  const rawDestinations = {};
  const destinations = [];
  const slugToKey = {};
  const altSlugToSlug = {};
  const destSlugTracker = new Map();

  for (let j = 1; j < row.length; j++) {
    const destinationKey = header[j - 1];
    const csvValue = row[j];
    if (!destinationKey) continue;

    const override = overrides.get(originKey + "\t" + destinationKey);
    const value = override ? override.requirement : csvValue;
    rawDestinations[destinationKey] = value;

    const destinationNameEs = getCountryNameEs(destinationKey);
    const destSlugEn = slugifyEn(destinationKey);
    const destSlugEs = ensureUniqueSlug(slugifyEs(destinationNameEs) || destSlugEn, destSlugTracker);

    if (destSlugEn && destSlugEn !== destSlugEs) {
      altSlugToSlug[destSlugEn] = destSlugEs;
    }

    slugToKey[destSlugEs] = destinationKey;
    const destination = {
      key: destinationKey,
      name_es: destinationNameEs,
      slug_es: destSlugEs,
      requirement: value,
    };
    if (override) {
      destination.override = {
        source: override.source,
        verifiedAt: override.verifiedAt,
        effectiveFrom: override.effectiveFrom || null,
        expiresAt: override.expiresAt || null,
        note: override.note || null,
      };
    }
    destinations.push(destination);
  }

  fs.writeFileSync(
    path.join(OUT_DIR, originKey + ".json"),
    JSON.stringify({
      origin_key: originKey,
      origin_name_es: originNameEs,
      origin_slug_es: originSlugEs,
      destinations,
      slug_to_key: slugToKey,
      alt_slug_to_slug: altSlugToSlug,
      raw: { origin: originKey, destinations: rawDestinations },
    }, null, 2),
    "utf8",
  );

  metaEntries.push({ name_en: originKey, name_es: originNameEs, slug_es: originSlugEs, slug_en: originSlugEn });
  indexList.push({
    key: originKey,
    name_en: originKey,
    name_es: originNameEs,
    slug_es: originSlugEs,
    slug_en: originSlugEn,
    alt_slugs: originAltSlugs,
  });
  generated++;
}

metaEntries.sort((a, b) => a.name_es.localeCompare(b.name_es || b.name_en));
indexList.sort((a, b) => a.name_es.localeCompare(b.name_es || b.name_en));

fs.writeFileSync(META_PATH, JSON.stringify(metaEntries, null, 2), "utf8");
fs.writeFileSync(INDEX_PATH, JSON.stringify({
  list: indexList,
  map_slug_to_key: mapSlugToKey,
  map_alt_to_slug: mapAltToSlug,
}, null, 2), "utf8");

console.log("✅ Generados " + generated + " países");
console.log("✅ Aplicados " + overrides.size + " overrides auditables");
