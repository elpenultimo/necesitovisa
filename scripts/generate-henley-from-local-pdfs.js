import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";

const ORIGIN_ISOS = ["AR", "CL", "CO", "ES", "MX"];
const DATA_DIR = path.join(process.cwd(), "data", "henley-pdfs");
const OUTPUT_DIR = path.join(process.cwd(), "public", "data");
const MATRIX_PATH = path.join(OUTPUT_DIR, "visa-matrix.generated.json");
const META_PATH = path.join(OUTPUT_DIR, "visa-matrix.generated.meta.json");

const monthMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const extractDate = (text) => {
  const match = text.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
  if (!match) return null;
  const day = String(match[1]).padStart(2, "0");
  const monthKey = match[2].toLowerCase();
  const month = monthMap[monthKey];
  const year = match[3];
  if (!month) return null;
  return `${year}-${String(month).padStart(2, "0")}-${day}`;
};

const splitLineIntoCountries = (line) => {
  const cleaned = line.replace(/^[-•\d\s.]+/, "");
  const parts = cleaned.split(/,{1}\s*|\s{2,}|;+/);
  return parts
    .map((item) => item.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'().\s-]/g, "").trim())
    .filter((item) => item.length > 1);
};

const extractSections = (text) => {
  const visaFree = new Set();
  const visaRequired = new Set();
  let mode = null;

  const lines = text.split(/\r?\n+/);
  for (const rawLine of lines) {
    const line = normalizeText(rawLine);
    const lower = line.toLowerCase();
    if (!line) continue;

    if (lower.includes("visa free")) {
      mode = "free";
      continue;
    }
    if (lower.includes("visa required")) {
      mode = "required";
      continue;
    }
    if (lower.includes("visa on arrival") || lower.includes("electronic visa")) {
      mode = null;
      continue;
    }

    if (mode === "free") {
      splitLineIntoCountries(line).forEach((country) => visaFree.add(country));
    }
    if (mode === "required") {
      splitLineIntoCountries(line).forEach((country) => visaRequired.add(country));
    }
  }

  if (visaFree.size === 0 && visaRequired.size === 0) {
    return null;
  }

  return {
    visaFreeDestinations: Array.from(visaFree).sort(),
    visaRequiredDestinations: Array.from(visaRequired).sort(),
  };
};

const buildMetaEntry = ({ originISO, pdfPath, pdfUpdatedAt, status, error }) => ({
  originISO,
  pdfPath,
  pdfUpdatedAt,
  status,
  ...(error ? { parseError: error } : {}),
});

async function processPdf(originISO) {
  const pdfFile = path.join(DATA_DIR, `${originISO}_visa_full.pdf`);
  try {
    await fs.access(pdfFile);
  } catch (err) {
    return {
      status: "missing_pdf",
      meta: buildMetaEntry({ originISO, pdfPath: pdfFile, pdfUpdatedAt: null, status: "missing_pdf" }),
    };
  }

  try {
    const buffer = await fs.readFile(pdfFile);
    const parsed = await pdfParse(buffer);
    const text = parsed.text ?? "";
    const date = extractDate(text);
    const sections = extractSections(text);

    if (!sections) {
      return {
        status: "parse_error",
        meta: buildMetaEntry({
          originISO,
          pdfPath: pdfFile,
          pdfUpdatedAt: date,
          status: "parse_error",
          error: "No se encontraron secciones de visa",
        }),
      };
    }

    return {
      status: date ? "ok" : "unknown_date",
      pdfUpdatedAt: date,
      data: sections,
      meta: buildMetaEntry({
        originISO,
        pdfPath: pdfFile,
        pdfUpdatedAt: date,
        status: date ? "ok" : "unknown_date",
      }),
    };
  } catch (err) {
    return {
      status: "parse_error",
      meta: buildMetaEntry({
        originISO,
        pdfPath: pdfFile,
        pdfUpdatedAt: null,
        status: "parse_error",
        error: err instanceof Error ? err.message : String(err),
      }),
    };
  }
}

async function main() {
  const visaMatrix = {};
  const metaEntries = [];
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const originISO of ORIGIN_ISOS) {
    const result = await processPdf(originISO);
    metaEntries.push(result.meta);

    if (result.data) {
      const { visaFreeDestinations, visaRequiredDestinations } = result.data;
      visaMatrix[originISO] = {};

      visaFreeDestinations.forEach((destination) => {
        visaMatrix[originISO][destination] = {
          requiresVisa: false,
          source: "henley_pdf_local",
          pdfUpdatedAt: result.pdfUpdatedAt ?? null,
        };
      });

      visaRequiredDestinations.forEach((destination) => {
        visaMatrix[originISO][destination] = {
          requiresVisa: true,
          source: "henley_pdf_local",
          pdfUpdatedAt: result.pdfUpdatedAt ?? null,
        };
      });
    }
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    sources: metaEntries,
  };

  await fs.writeFile(MATRIX_PATH, JSON.stringify(visaMatrix, null, 2), "utf8");
  await fs.writeFile(META_PATH, JSON.stringify(meta, null, 2), "utf8");

  console.log(`Generación completada. Archivo guardado en ${MATRIX_PATH}`);
}

main().catch((error) => {
  console.error("Error al generar dataset Henley", error);
});
