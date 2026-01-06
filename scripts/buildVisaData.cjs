const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const CSV_PATH = path.join(process.cwd(), "data/passport-index-matrix.csv");
const OUT_DIR = path.join(process.cwd(), "data/generated");

fs.mkdirSync(OUT_DIR, { recursive: true });

const csvText = fs.readFileSync(CSV_PATH, "utf8");

// el archivo es COMA separada
const records = parse(csvText, {
  columns: false,
  skip_empty_lines: true,
});

const header = records[0].slice(1); // destinos
let generated = 0;

for (let i = 1; i < records.length; i++) {
  const row = records[i];
  const origin = row[0];

  if (!origin) continue;

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

  generated++;
}

console.log(`✅ Generados ${generated} países`);
