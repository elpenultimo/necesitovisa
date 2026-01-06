const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

function classify(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (!v || v === "-1") return { skip: true };
  if (v === "visa free") return { needsVisa: false, days: null };
  if (/^\d+$/.test(v)) return { needsVisa: false, days: Number(v) };
  if (v.includes("visa required")) return { needsVisa: true, days: null };
  return { needsVisa: true, days: null, special: true };
}

const csvPath = path.join(process.cwd(), "data", "passport-index-matrix.csv");
const outDir = path.join(process.cwd(), "data", "generated");
fs.mkdirSync(outDir, { recursive: true });

const csv = fs.readFileSync(csvPath, "utf8");
const records = parse(csv, { relax_quotes: true });

const header = records[0].slice(1);
const origins = [];

for (let i = 1; i < records.length; i++) {
  const row = records[i];
  const origin = row[0]?.replace(/"/g, "").trim();
  if (!origin || origin.length !== 2) continue;

  const destinations = [];

  for (let j = 1; j < row.length && j <= header.length; j++) {
    const dest = header[j - 1]?.replace(/"/g, "").trim();
    if (!dest || dest === origin) continue;

    const c = classify(row[j]);
    if (c.skip) continue;

    destinations.push({
      dest,
      raw: row[j],
      needsVisa: c.needsVisa,
      days: c.days ?? null,
    });
  }

  if (destinations.length === 0) continue;

  destinations.sort((a, b) => a.dest.localeCompare(b.dest));

  fs.writeFileSync(
    path.join(outDir, `${origin}.json`),
    JSON.stringify(
      {
        origin,
        generatedAt: new Date().toISOString().slice(0, 10),
        source: { mode: "local", dataset: "passport-index-matrix" },
        destinations,
      },
      null,
      2
    )
  );

  origins.push(origin);
}

fs.writeFileSync(
  path.join(outDir, "index.json"),
  JSON.stringify({ origins, count: origins.length }, null, 2)
);

console.log(`✅ Generados ${origins.length} países en ${outDir}`);
