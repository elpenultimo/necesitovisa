import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getCountryNameEs, slugifyEs } from "../lib/countryEs.js";

function slugifyEn(input) {
  const normalized = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "");

  const replaced = normalized.replace(/[\s\/]+/g, "-");
  const sanitized = replaced.replace(/[^a-z0-9-]/g, "");
  const collapsed = sanitized.replace(/-+/g, "-");
  return collapsed.replace(/^-+|-+$/g, "");
}

const CSV_PATH = path.join(process.cwd(), "data/passport-index-matrix.csv");
const OUT_DIR = path.join(process.cwd(), "data/generated");
const META_PATH = path.join(OUT_DIR, "countries.meta.json");
const INDEX_PATH = path.join(OUT_DIR, "index.json");

fs.mkdirSync(OUT_DIR, { recursive: true });

const csvText = fs.readFileSync(CSV_PATH, "utf8");

const records = parse(csvText, {
  columns: false,
  skip_empty_lines: true,
});

const header = records[0].slice(1);
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
  return `${base}-${count}`;
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
    const value = row[j];

    if (!destinationKey) continue;

    rawDestinations[destinationKey] = value;

    const destinationNameEs = getCountryNameEs(destinationKey);
    const destSlugEn = slugifyEn(destinationKey);
    const destSlugEs = ensureUniqueSlug(
      slugifyEs(destinationNameEs) || destSlugEn,
      destSlugTracker,
    );

    if (destSlugEn && destSlugEn !== destSlugEs) {
      altSlugToSlug[destSlugEn] = destSlugEs;
    }

    slugToKey[destSlugEs] = destinationKey;

    destinations.push({
      key: destinationKey,
      name_es: destinationNameEs,
      slug_es: destSlugEs,
      requirement: value,
    });
  }

  fs.writeFileSync(
    path.join(OUT_DIR, `${originKey}.json`),
    JSON.stringify(
      {
        origin_key: originKey,
        origin_name_es: originNameEs,
        origin_slug_es: originSlugEs,
        destinations,
        slug_to_key: slugToKey,
        alt_slug_to_slug: altSlugToSlug,
        raw: {
          origin: originKey,
          destinations: rawDestinations,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  metaEntries.push({
    name_en: originKey,
    name_es: originNameEs,
    slug_es: originSlugEs,
    slug_en: originSlugEn,
  });

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
fs.writeFileSync(
  INDEX_PATH,
  JSON.stringify(
    {
      list: indexList,
      map_slug_to_key: mapSlugToKey,
      map_alt_to_slug: mapAltToSlug,
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`✅ Generados ${generated} países`);
