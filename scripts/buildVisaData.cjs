const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const countries = require("i18n-iso-countries");

function slugify(input) {
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

fs.mkdirSync(OUT_DIR, { recursive: true });

const csvText = fs.readFileSync(CSV_PATH, "utf8");

// el archivo es COMA separada
const records = parse(csvText, {
  columns: false,
  skip_empty_lines: true,
});

const header = records[0].slice(1); // destinos
let generated = 0;
const metaEntries = [];
const slugTracker = new Map();

countries.registerLocale({ locale: "es" });

function ensureUniqueSlug(base) {
  if (!slugTracker.has(base)) {
    slugTracker.set(base, 1);
    return base;
  }

  const count = slugTracker.get(base) + 1;
  slugTracker.set(base, count);
  return `${base}-${count}`;
}

for (let i = 1; i < records.length; i++) {
  const row = records[i];
  const origin = row[0];

  if (!origin) continue;

  const alpha2 = countries.getAlpha2Code(origin, "en");
  const nameEs = alpha2 ? countries.getName(alpha2, "es") || origin : origin;
  const slugEn = slugify(origin);
  const slugEsRaw = slugify(nameEs);
  const slugEs = ensureUniqueSlug(slugEsRaw || slugEn);

  const data = {};

  for (let j = 1; j < row.length; j++) {
    const destination = header[j - 1];
    const value = row[j];

    if (!destination) continue;

    data[destination] = value;
  }

  fs.writeFileSync(
    path.join(OUT_DIR, `${origin}.json`),
    JSON.stringify({ origin, destinations: data }, null, 2),
    "utf8"
  );

  metaEntries.push({
    name_en: origin,
    name_es: nameEs,
    slug_es: slugEs,
    slug_en: slugEn,
  });

  generated++;
}

metaEntries.sort((a, b) => a.name_es.localeCompare(b.name_es || b.name_en));

fs.writeFileSync(META_PATH, JSON.stringify(metaEntries, null, 2), "utf8");

console.log(`✅ Generados ${generated} países`);
