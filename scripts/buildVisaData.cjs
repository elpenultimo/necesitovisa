const fs = require("fs");
const path = require("path");

function sniffDelimiter(sample) {
  const comma = (sample.match(/,/g) || []).length;
  const semi = (sample.match(/;/g) || []).length;
  return semi > comma ? ";" : ",";
}

// CSV parser simple pero correcto con comillas (RFC-ish)
function parseCSV(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    if (c === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (c === "\n") {
      row.push(field);
      field = "";
      // evita filas vacías
      if (row.some((x) => String(x).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    if (c === "\r") continue;

    field += c;
  }

  // último campo
  row.push(field);
  if (row.some((x) => String(x).trim() !== "")) rows.push(row);
  return rows;
}

function cleanCode(v) {
  return String(v || "").replace(/"/g, "").trim().toUpperCase();
}

function classify(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (!v || v === "-1") return { skip: true };
  if (v === "visa free") return { needsVisa: false, days: null };
  if (/^\d+$/.test(v)) return { needsVisa: false, days: Number(v) };
  if (v.includes("visa required")) return { needsVisa: true, days: null };
  // evisa / eta / visa on arrival => por ahora lo tratamos como “sí”
  return { needsVisa: true, days: null, special: true };
}

function main() {
  const csvPath = path.join(process.cwd(), "data", "passport-index-matrix.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ No encuentro el CSV:", csvPath);
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), "data", "generated");
  fs.mkdirSync(outDir, { recursive: true });

  const csv = fs.readFileSync(csvPath, "utf8");
  const sample = csv.slice(0, 2000);
  const delimiter = sniffDelimiter(sample);

  const records = parseCSV(csv, delimiter);
  if (!records || records.length < 2) {
    console.error("❌ CSV vacío o no parseable");
    process.exit(1);
  }

  const header = records[0];
  const destCodes = header.slice(1).map(cleanCode).filter(Boolean);

  // validación: deberían ser muchas columnas
  if (destCodes.length < 100) {
    console.error("❌ Header raro. Destinos detectados:", destCodes.length);
    console.error("Delimiter usado:", JSON.stringify(delimiter));
    console.error("Header (primeras 10 cols):", header.slice(0, 10));
    process.exit(1);
  }

  const origins = [];

  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    const origin = cleanCode(row[0]);

    // el dataset usa ISO2
    if (!origin || origin.length < 2 || origin.length > 3) continue;

    const destinations = [];

    for (let j = 1; j < row.length && j <= destCodes.length; j++) {
      const dest = destCodes[j - 1];
      if (!dest || dest.length !== 2) continue;
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

    const obj = {
      origin,
      generatedAt: new Date().toISOString().slice(0, 10),
      source: { mode: "local", dataset: "passport-index-matrix", delimiter },
      destinations,
    };

    fs.writeFileSync(
      path.join(outDir, `${origin}.json`),
      JSON.stringify(obj, null, 2),
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

  console.log(`✅ Generados ${origins.length} países en ${outDir}`);
}

main();
