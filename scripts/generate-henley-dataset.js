#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas } from "canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdf.worker.min.mjs",
  import.meta.url
);

const SUPPORTED_ORIGINS = [
  { name: "Argentina", code: "AR" },
  { name: "Chile", code: "CL" },
  { name: "Colombia", code: "CO" },
  { name: "España", code: "ES" },
  { name: "México", code: "MX" },
];

const OUTPUT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/data/visa-matrix.generated.json"
);

const DOWNLOAD_BASE = "https://cdn.henleyglobal.com/storage/app/media/HPI";
const ICON_BOX_SIZE = 24;
const ICON_OFFSET_X = 10;
const SCALE = 2;
const MIN_DARK_RATIO = 0.03;
const MIN_DIAGONAL_SCORE = 0.32;

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

const normalizeName = (value) => value.replace(/\s+/g, " ").trim();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const loadPreviousDataset = () => {
  try {
    if (fs.existsSync(OUTPUT_PATH)) {
      const raw = fs.readFileSync(OUTPUT_PATH, "utf8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn("[henley] No se pudo leer el dataset previo:", error.message);
  }
  return null;
};

const fetchPdf = async (originCode) => {
  const url = `${DOWNLOAD_BASE}/${originCode}_visa_full.pdf`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Descarga fallida (${response.status}) para ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return { url, buffer: Buffer.from(arrayBuffer) };
};

const groupTextItems = (items) => {
  const lines = [];

  items.forEach((item) => {
    const text = normalizeName(item.str ?? "");
    if (!text) return;

    const x = (item.transform?.[4] ?? 0) * SCALE;
    const y = (item.transform?.[5] ?? 0) * SCALE;
    const width = (item.width ?? text.length * 4) * SCALE;
    const height = (item.height ?? item.transform?.[0] ?? 8) * SCALE;

    const existingLine = lines.find((line) => Math.abs(line.y - y) < 3);
    if (existingLine) {
      existingLine.items.push({ text, x, y, width, height });
    } else {
      lines.push({ y, items: [{ text, x, y, width, height }] });
    }
  });

  return lines
    .map((line) => {
      const sorted = line.items.sort((a, b) => a.x - b.x);
      const content = normalizeName(sorted.map((item) => item.text).join(" "));
      const minX = Math.min(...sorted.map((item) => item.x));
      const maxX = Math.max(...sorted.map((item) => item.x + item.width));
      const minY = Math.min(...sorted.map((item) => item.y - item.height));
      const maxY = Math.max(...sorted.map((item) => item.y));

      return { text: content, minX, maxX, minY, maxY };
    })
    .filter((line) => line.text.length > 1);
};

const detectVisaRequired = (imageData) => {
  const { data, width, height } = imageData;
  let darkPixels = 0;
  let diagonalPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const isDark = luminance < 180;

      if (isDark) {
        darkPixels += 1;
        if (Math.abs(x - y) <= 1 || Math.abs(x - (width - 1 - y)) <= 1) {
          diagonalPixels += 1;
        }
      }
    }
  }

  const totalPixels = width * height;
  const darkRatio = darkPixels / totalPixels;
  const diagonalRatio = darkPixels === 0 ? 0 : diagonalPixels / darkPixels;

  return darkRatio >= MIN_DARK_RATIO && diagonalRatio >= MIN_DIAGONAL_SCORE;
};

const readPageRows = async (page, originName) => {
  const viewport = page.getViewport({ scale: SCALE });
  const canvasFactory = new NodeCanvasFactory();
  const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);

  await page.render({ canvasContext: context, viewport, canvasFactory }).promise;
  const textContent = await page.getTextContent({ normalizeWhitespace: true });
  const lines = groupTextItems(textContent.items);

  const entries = [];
  const pageWidth = viewport.width;

  lines.forEach((line) => {
    if (line.text.toLowerCase().includes("passport")) return;
    if (line.text.toLowerCase().includes(originName.toLowerCase())) return;

    const cropX = clamp(Math.round(line.maxX + ICON_OFFSET_X), 0, pageWidth - ICON_BOX_SIZE);
    const cropY = clamp(Math.round(line.minY - 4), 0, viewport.height - ICON_BOX_SIZE);
    const width = ICON_BOX_SIZE;
    const height = ICON_BOX_SIZE;

    const box = context.getImageData(cropX, cropY, width, height);
    const requiresVisa = detectVisaRequired(box);

    entries.push({
      name: normalizeName(line.text),
      requiresVisa,
    });
  });

  return entries;
};

const parsePdf = async ({ buffer, origin }) => {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const destinations = new Map();

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const rows = await readPageRows(page, origin.name);
    rows.forEach((row) => {
      if (!destinations.has(row.name)) {
        destinations.set(row.name, row.requiresVisa);
      }
    });
  }

  return Object.fromEntries(
    Array.from(destinations.entries()).map(([name, requiresVisa]) => [name, { requiresVisa }])
  );
};

const buildDataset = async () => {
  const previousDataset = loadPreviousDataset();
  const now = new Date();
  const dataset = {
    generatedAt: now.toISOString(),
    source: "Henley & Partners Passport Index (HPI PDFs)",
    origins: {},
  };

  for (const origin of SUPPORTED_ORIGINS) {
    try {
      const pdfData = await fetchPdf(origin.code);
      const destinations = await parsePdf({ buffer: pdfData.buffer, origin });

      dataset.origins[origin.name] = {
        code: origin.code,
        pdfUrl: pdfData.url,
        destinations,
      };
    } catch (error) {
      console.warn(`[henley] No se pudo procesar ${origin.name}:`, error.message);
      const fallback = previousDataset?.origins?.[origin.name];
      if (fallback) {
        dataset.origins[origin.name] = fallback;
      }
    }
  }

  return dataset;
};

const writeDataset = (data) => {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
};

const main = async () => {
  const previousDataset = loadPreviousDataset();

  try {
    const dataset = await buildDataset();

    const hasOrigins = Object.keys(dataset.origins).length > 0;
    if (!hasOrigins && previousDataset) {
      console.warn("[henley] Sin nuevos datos; se mantiene el dataset anterior.");
      writeDataset(previousDataset);
      return;
    }

    writeDataset(dataset);
    console.log("[henley] Dataset generado en", OUTPUT_PATH);
  } catch (error) {
    console.warn("[henley] Error generando dataset:", error.message);
    if (previousDataset) {
      console.warn("[henley] Usando dataset previo como fallback.");
      writeDataset(previousDataset);
    }
  }
};

main();
