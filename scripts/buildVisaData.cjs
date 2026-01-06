const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

function stripBOM(s) {
  return s && s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}
function cleanCode(v) {
  return stripBOM(String(v || "")).replace(/"/g, "").trim().toUpperCase();
}

function classify(raw) {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v || v === "-1") return { skip: true };

  if (v === "visa free") return { needsVisa: false, days: null };
  if (/^\d+$/.test(v)) return { needsVisa: false, days: Number(v) };
  if (v.includes("visa required")) return { needsVisa: true, days: null };

  // evisa / eta / visa on arrival / etc.
  return { needsVisa: true, days: null, special: true };
}

function main() {
  const csvPath = path.join(process.cwd(), "data", "passport-index-matrix.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ No encuentro el CSV en:", csvPath);
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), "data", "generated");
  fs.mkdirSync(outDir, { recursive: true });

  const csv = fs.readFileSync(csvPath, "utf8");
  const firstLine = csv.split(/\r?\n/)[0] || "";
  const comma = (firstLine.match(/,/g) || []).length;
  const semi = (firstLine.match(/;/g) || []).length;
  const delimiter = semi > comma ? ";" : ",";

  const records = parse(csv, {
    delimiter,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
  });

  if (!records || records.length < 2) {
    console.error("❌ CSV vacío o no parseable");
    process.exit(1);
  }

  const header = records[0];
  const destCodes = header.slice(1).map(cleanCode).filter(Boolean);

  console.log("ℹ️ Delimiter:", JSON.stringify(delimiter), "| Destinos en header:", destCodes.length);
  console.log("ℹ️ Header sample:", destCodes.slice(0, 10).join(", "));

  const origins = [];
  let rowsWithValidOrigin = 0;

  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    const origin = cleanCode(row[0]);

    // Acepta ISO2 o ISO3
    if (!origin || origin.length < 2 || origin.length > 3) continue;
    rowsWithValidOrigin++;

    const destinations = [];

    for (let j = 1; j < row.length && j <= destCodes.length; j++) {
      const dest = destCodes[j - 1];
      if (!dest || dest.length < 2 || dest.length > 3) continue;
      if (dest === origin) continue;

      const c = classify(row[j]);
      if (c.skip) continue;

      destinations.push({
        dest,
        raw: String(row[j] ?? "").trim(),
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
          source: { dataset: "passport-index-matrix", delimiter },
          destinations,
        },
        null,
        2
      ),
      "utf8"
    );

    origins.push(origin);
  }

  origins.sort();
  fs.writeFileSync(
    path.join(outDir, "index.json"),
    JSON.stringify({ origins, count: origins.length }, null, 2),
    "utf8"
  );

  console.log("ℹ️ Filas con origin válido:", rowsWithValidOrigin);
  console.log(`✅ Generados ${origins.length} países en ${outDir}`);
}

main();
