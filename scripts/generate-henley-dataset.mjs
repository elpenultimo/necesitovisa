#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGIN_CODES = {
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  ES: "España",
  MX: "México",
};

const OUTPUT_PATH = path.join(__dirname, "..", "public", "data", "visa-matrix.generated.json");
const DESTINATION_DIR = path.dirname(OUTPUT_PATH);
const ALLOW_EMPTY = process.env.ALLOW_EMPTY_DATASET === "1";
const USE_OFFLINE = process.env.HENLEY_OFFLINE === "1";

let pdfjsLib = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;

  const loaded = await import("pdfjs-dist/legacy/build/pdf.mjs");
  loaded.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.mjs", import.meta.url).toString();
  pdfjsLib = loaded;
  return pdfjsLib;
}

const VISA_FREE_PATTERNS = [/visa[-\s]?free/i, /visa not required/i, /no visa required/i, /visa waiver/i];
const REQUIREMENT_MARKERS = [
  { regex: /visa[-\s]?free/i, requiresVisa: false },
  { regex: /visa not required/i, requiresVisa: false },
  { regex: /no visa required/i, requiresVisa: false },
  { regex: /visa waiver/i, requiresVisa: false },
  { regex: /visa on arrival/i, requiresVisa: true },
  { regex: /e-?visa/i, requiresVisa: true },
  { regex: /visa required/i, requiresVisa: true },
];

const formatLogger = (origin) => ({
  info: (...args) => console.log(`[${origin}]`, ...args),
  warn: (...args) => console.warn(`[${origin}]`, ...args),
  error: (...args) => console.error(`[${origin}]`, ...args),
});

async function fetchPdfBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fallo al descargar ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function textContentToLines(textContent) {
  const rows = [];

  for (const item of textContent.items) {
    const text = (item.str ?? "").trim();
    if (!text) continue;
    const [, , , , x, y] = item.transform;

    const existingRow = rows.find((row) => Math.abs(row.y - y) < 2);
    if (existingRow) {
      existingRow.items.push({ x, text });
    } else {
      rows.push({ y, items: [{ x, text }] });
    }
  }

  rows.sort((a, b) => b.y - a.y);

  return rows.map((row) => row.items.sort((a, b) => a.x - b.x).map((part) => part.text).join(" "));
}

function extractSegments(line) {
  return line
    .split(/\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseRequirementSegment(segment) {
  const normalized = segment.replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  const marker = REQUIREMENT_MARKERS.map((entry) => ({
    entry,
    index: normalized.search(entry.regex),
  }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (!marker) return null;

  const destination = normalized.slice(0, marker.index).trim();
  const requirementText = normalized.slice(marker.index).trim();

  if (!destination || !requirementText) return null;

  return {
    destination,
    requirementText,
    requiresVisa: marker.entry.requiresVisa ?? !VISA_FREE_PATTERNS.some((pattern) => pattern.test(requirementText)),
  };
}

function aggregatePageEntries(textContent) {
  const lines = textContentToLines(textContent);
  const entries = [];

  for (const line of lines) {
    const segments = extractSegments(line);
    const targets = segments.length ? segments : [line];

    for (const segment of targets) {
      const parsed = parseRequirementSegment(segment);
      if (parsed) {
        entries.push(parsed);
      }
    }
  }

  return entries;
}

async function parsePdf(buffer) {
  const { getDocument } = await loadPdfJs();
  const pdf = await getDocument({ data: buffer }).promise;
  const entries = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent({ normalizeWhitespace: true });
    entries.push(...aggregatePageEntries(textContent));
  }

  return entries;
}

async function buildMatrixForOrigin(originCode) {
  const logger = formatLogger(originCode);
  const url = `https://cdn.henleyglobal.com/storage/app/media/HPI/${originCode}_visa_full.pdf`;
  const matrix = {};

  if (USE_OFFLINE) {
    logger.warn("Modo offline activo; se omitirá la descarga del PDF.");
    return { matrix, url, entries: [] };
  }

  logger.info("Descargando", url);
  const buffer = await fetchPdfBuffer(url);
  logger.info("Procesando PDF... esta operación puede tardar unos segundos");
  const entries = await parsePdf(buffer);

  for (const entry of entries) {
    if (!matrix[entry.destination]) {
      matrix[entry.destination] = entry.requiresVisa;
    }
  }

  return { matrix, url, entries };
}

function buildDatasetPayload(results) {
  const allDestinations = new Set();
  const matrix = {};
  const sources = [];

  for (const result of results) {
    if (!result) continue;
    const { origin, url, data } = result;
    matrix[origin] = data.matrix;
    if (url) sources.push(url);
    Object.keys(data.matrix).forEach((destination) => allDestinations.add(destination));
  }

  return {
    generatedAt: new Date().toISOString(),
    sources,
    matrix,
    destinations: Array.from(allDestinations).sort(),
  };
}

async function main() {
  await fs.mkdir(DESTINATION_DIR, { recursive: true });

  const results = [];
  for (const originCode of Object.keys(ORIGIN_CODES)) {
    try {
      const data = await buildMatrixForOrigin(originCode);
      results.push({ origin: originCode, data, url: data.url });
      const count = Object.keys(data.matrix).length;
      console.log(`[${originCode}] Entradas procesadas: ${count}`);
    } catch (error) {
      console.error(`[${originCode}] Error al procesar PDF:`, error.message);
      if (!ALLOW_EMPTY) {
        throw error;
      }
    }
  }

  const dataset = buildDatasetPayload(results);

  if (!ALLOW_EMPTY) {
    const hasData = Object.values(dataset.matrix).some((destinations) => Object.keys(destinations).length > 0);
    if (!hasData) {
      throw new Error("No se pudo construir el dataset de Henley. Activa ALLOW_EMPTY_DATASET=1 para continuar en modo tolerante.");
    }
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`Dataset guardado en ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("Fallo la generación del dataset de Henley:", error);
  process.exitCode = 1;
});
