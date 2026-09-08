import fs from "fs";
import { parse } from "csv-parse/sync";

const currentPath = "data/passport-index-matrix.csv";
const incomingPath = process.argv[2] || "/tmp/passport-index-matrix.csv";

function readMatrix(file) {
  const text = fs.readFileSync(file, "utf8");
  const rows = parse(text, { columns: false, skip_empty_lines: true });
  if (rows.length < 190) throw new Error(`Dataset sospechosamente pequeño: ${rows.length - 1} pasaportes`);
  const header = rows[0];
  if (header[0] !== "Passport" || header.length < 190) throw new Error("Cabecera del dataset no válida");
  const destinations = header.slice(1);
  if (new Set(destinations).size !== destinations.length) throw new Error("Hay destinos duplicados en la cabecera");
  const passports = rows.slice(1).map(r => r[0]);
  if (new Set(passports).size !== passports.length) throw new Error("Hay pasaportes duplicados");
  for (const row of rows.slice(1)) {
    if (row.length !== header.length) throw new Error(`Fila inválida para ${row[0]}: ${row.length} columnas; esperadas ${header.length}`);
  }
  return { text, rows, header, destinations, passports };
}

const oldData = readMatrix(currentPath);
const newData = readMatrix(incomingPath);

// Evita cambios estructurales silenciosos que podrían alterar slugs/URLs.
const oldCountries = new Set([...oldData.destinations, ...oldData.passports]);
const newCountries = new Set([...newData.destinations, ...newData.passports]);
const added = [...newCountries].filter(x => !oldCountries.has(x));
const removed = [...oldCountries].filter(x => !newCountries.has(x));
if (added.length || removed.length) {
  throw new Error(`Cambió la lista/nombre de países. Revisión manual requerida. Añadidos: ${added.join(", ") || "ninguno"}. Eliminados: ${removed.join(", ") || "ninguno"}.`);
}

function toMap(data) {
  const m = new Map();
  for (const row of data.rows.slice(1)) {
    const origin = row[0];
    data.destinations.forEach((dest, i) => m.set(`${origin}\t${dest}`, String(row[i + 1] ?? "")));
  }
  return m;
}
const oldMap = toMap(oldData);
const newMap = toMap(newData);
const changes = [];
for (const [pair, next] of newMap) {
  const prev = oldMap.get(pair);
  if (prev !== next) {
    const [origin, destination] = pair.split("\t");
    changes.push({ origin, destination, before: prev, after: next });
  }
}

if (!changes.length) {
  console.log("Sin cambios en requisitos de visa.");
  process.exit(0);
}

fs.copyFileSync(incomingPath, currentPath);
fs.mkdirSync("data/generated", { recursive: true });
fs.writeFileSync("data/generated/dataset-changes.json", JSON.stringify({ updatedAt: new Date().toISOString(), source: "https://github.com/imorte/passport-index-data", changes }, null, 2));
console.log(`Dataset válido. ${changes.length} combinaciones cambiaron.`);
for (const c of changes.slice(0, 50)) console.log(`${c.origin} -> ${c.destination}: ${c.before} => ${c.after}`);
if (changes.length > 50) console.log(`... y ${changes.length - 50} cambios más.`);
