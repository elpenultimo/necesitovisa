import fs from "node:fs/promises";
import path from "node:path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const SUPPORTED_COUNTRIES = ["AR", "CL", "CO", "ES", "MX"];
const SOURCE = "henley";
const BASE_URL = "https://cdn.henleyglobal.com/storage/app/media/HPI";
const OUTPUT_PATH = path.join(process.cwd(), "data", "visa-matrix.generated.json");

const emptyEntry = () => ({ visa_free: [], visa_required: [] });

async function readExistingDataset() {
  try {
    const content = await fs.readFile(OUTPUT_PATH, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`No se pudo leer dataset previo: ${error.message}`);
    }
    return null;
  }
}

async function downloadPdf(countryCode) {
  const url = `${BASE_URL}/${countryCode}_visa_full.pdf`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Descarga falló (${response.status}) para ${url}`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function extractTextFromPdf(pdfBytes) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes, disableWorker: true });
  const pdfDocument = await loadingTask.promise;
  const pagesText = [];

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum += 1) {
    const page = await pdfDocument.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    pagesText.push(text);
  }

  return pagesText.join("\n");
}

function cleanValue(value) {
  return value.replace(/\s+/g, " ").trim();
}

function dedupe(values) {
  return Array.from(new Set(values.map(cleanValue))).filter(Boolean);
}

function parseSection(text, startMarkers, endMarkers) {
  const lowerText = text.toLowerCase();
  const startIndex = startMarkers
    .map((marker) => lowerText.indexOf(marker.toLowerCase()))
    .filter((idx) => idx >= 0)
    .sort((a, b) => a - b)[0];

  if (startIndex === undefined) {
    return [];
  }

  const sliceFrom = startIndex;
  const sliceToCandidates = endMarkers
    .map((marker) => lowerText.indexOf(marker.toLowerCase(), sliceFrom + 1))
    .filter((idx) => idx > sliceFrom);
  const sliceTo = sliceToCandidates.length > 0 ? Math.min(...sliceToCandidates) : text.length;
  const rawSegment = text.slice(sliceFrom, sliceTo);

  return rawSegment
    .split(/[,;•\n]/)
    .map((item) => cleanValue(item))
    .filter((item) => item.length > 0 && !startMarkers.some((marker) => item.toLowerCase().includes(marker.toLowerCase())));
}

function parseVisaCategories(fullText) {
  const normalized = cleanValue(fullText);
  const visaFree = parseSection(normalized, ["visa free", "visa-free"], ["visa required", "visa-required"]);
  const visaRequired = parseSection(normalized, ["visa required", "visa-required"], []);

  return {
    visa_free: dedupe(visaFree),
    visa_required: dedupe(visaRequired),
  };
}

async function processCountry(countryCode, existingDataset) {
  const fallbackEntry = existingDataset?.matrix?.[countryCode] ?? emptyEntry();

  try {
    const pdfBytes = await downloadPdf(countryCode);
    const pdfText = await extractTextFromPdf(pdfBytes);
    const parsed = parseVisaCategories(pdfText);

    const safeParsed = {
      visa_free: parsed.visa_free.length > 0 ? parsed.visa_free : fallbackEntry.visa_free,
      visa_required: parsed.visa_required.length > 0 ? parsed.visa_required : fallbackEntry.visa_required,
    };

    return safeParsed;
  } catch (error) {
    console.warn(`No se pudo procesar ${countryCode}: ${error.message}`);
    return fallbackEntry;
  }
}

async function generateDataset() {
  const existingDataset = await readExistingDataset();
  const matrix = {};

  for (const country of SUPPORTED_COUNTRIES) {
    matrix[country] = await processCountry(country, existingDataset);
  }

  return {
    source: SOURCE,
    generatedAt: new Date().toISOString(),
    countriesCovered: SUPPORTED_COUNTRIES,
    matrix,
  };
}

async function main() {
  const dataset = await generateDataset();
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(`Dataset generado en ${OUTPUT_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Error fatal generando dataset Henley", error);
    process.exit(0);
  });
}
