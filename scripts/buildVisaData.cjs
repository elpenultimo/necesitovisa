// scripts/buildVisaData.js
const fs = require("fs");
const path = require("path");

function parseCSVLine(line) {
  // Parser simple: funciona si el CSV no trae comillas complejas.
  // Este dataset normalmente viene “limpio”.
  return line.split(",").map((s) => s.trim());
}

function classify(raw) {
  const v = (raw || "").trim().toLowerCase();

  if (!v || v === "-1") return { skip: true };
  if (v === "visa free") return { needsVisa: false, days: null };
  if (/^\d+$/.test(v)) return { needsVisa: false, days: Number(v) };
  if (v.includes("visa required")) return { needsVisa: true, days: null };

  // evisa / eta / visa on arrival => por ahora lo tratamos como “sí requiere”
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

  const text = fs.readFileSync(csvPath, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    console.error("❌ CSV vacío o inválido");
    process.exit(1);
  }

  const header = parseCSVLine(lines[0]);
  const destCodes = header.slice(1); // desde la 2da columna
  if (destCodes.length < 50) {
    console.error("❌ Header extraño (muy pocas columnas). Revisa el CSV.");
    process.exit(1);
  }

  const origins = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    const origin = row[0];
    if (!origin || origin.length !== 2) continue;

    const destinations = [];
    for (let j = 1; j < row.length && j <= destCodes.length; j++) {
      const dest = destCodes[j - 1];
      const raw = row[j];

      if (!dest || dest.length !== 2) continue;
      if (dest === origin) continue;

      const c = classify(raw);
      if (c.skip) continue;

      destinations.push({
        dest,
        raw,
        needsVisa: c.needsVisa,
        days: c.days ?? null,
      });
    }

    // ordenar por código destino
    destinations.sort((a, b) => a.dest.localeCompare(b.dest));

    const obj = {
      origin,
      generatedAt: new Date().toISOString().slice(0, 10),
      source: { mode: "local", note: "passport-index-matrix" },
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
    JSON.stringify({ origins, generatedAt: new Date().toISOString().slice(0, 10) }, null, 2),
    "utf8"
  );

  console.log(`✅ Generados ${origins.length} países en ${outDir}`);
}

main();
