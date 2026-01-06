import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath, pathToFileURL } from "url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DATA_DIR = path.join(ROOT_DIR, "public", "data");
const MATRIX_PATH = path.join(PUBLIC_DATA_DIR, "visa-matrix.generated.json");
const META_PATH = path.join(PUBLIC_DATA_DIR, "visa-matrix.generated.meta.json");
const SUPPORTED_ORIGIN_ISOS = new Set(["AR", "CL", "CO", "ES", "MX"]);

const log = (...message) => console.log("[henley]", ...message);
const warn = (...message) => console.warn("[henley]", ...message);

const transpileToTemp = async (sourcePath, tempDir) => {
  const source = await fs.readFile(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      esModuleInterop: true,
    },
  });

  let outputText = output.outputText;
  outputText = outputText.replace(/from "(\.\.?(?:\/[^"']+))"/g, (match, specifier) => {
    if (specifier.endsWith(".js") || specifier.endsWith(".json") || specifier.endsWith(".node")) {
      return match;
    }
    return `from "${specifier}.js"`;
  });

  const destPath = path.join(tempDir, `${path.parse(sourcePath).name}.js`);
  await fs.writeFile(destPath, outputText, "utf8");
  return destPath;
};

const loadSources = async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "henley-"));
  const countriesPath = path.join(ROOT_DIR, "data", "countries.ts");
  const requirementsPath = path.join(ROOT_DIR, "data", "requirements.ts");

  await Promise.all([
    transpileToTemp(countriesPath, tempDir),
    transpileToTemp(requirementsPath, tempDir),
  ]);

  const countriesModule = await import(pathToFileURL(path.join(tempDir, "countries.js")).href);
  const requirementsModule = await import(pathToFileURL(path.join(tempDir, "requirements.js")).href);

  return {
    originCountries: countriesModule.originCountries ?? [],
    destinationCountries: countriesModule.destinationCountries ?? [],
    requirements: requirementsModule.requirements ?? [],
  };
};

const buildMatrix = (requirements, originCountries, destinationCountries) => {
  const originIsoBySlug = new Map(
    originCountries.filter((item) => item.iso2).map((item) => [item.slug, item.iso2])
  );
  const destIsoBySlug = new Map(
    destinationCountries.filter((item) => item.iso2).map((item) => [item.slug, item.iso2])
  );

  const matrix = {};
  let skippedPairs = 0;

  requirements.forEach((item) => {
    const originIso = originIsoBySlug.get(item.originSlug);
    const destIso = destIsoBySlug.get(item.destSlug);

    if (!originIso || !destIso) {
      skippedPairs += 1;
      return;
    }

    if (!SUPPORTED_ORIGIN_ISOS.has(originIso)) {
      return;
    }

    const status = item.visaRequired ? "visa_required" : "visa_free";
    matrix[originIso] = matrix[originIso] ?? {};
    matrix[originIso][destIso] = status;
  });

  if (skippedPairs > 0) {
    warn(`Saltamos ${skippedPairs} combinaciones por datos incompletos (ISO faltante).`);
  }

  return matrix;
};

const ensureDir = (dirPath) => fs.mkdir(dirPath, { recursive: true });

const writeDataset = async (matrix) => {
  const generatedAt = new Date().toISOString();
  const sourceDate = new Date().toISOString().slice(0, 10);
  const supportedOrigins = Object.keys(matrix);

  await ensureDir(PUBLIC_DATA_DIR);

  const matrixPayload = { matrix };
  await fs.writeFile(MATRIX_PATH, JSON.stringify(matrixPayload, null, 2));

  const metaPayload = {
    source_date: sourceDate,
    generated_at: generatedAt,
    source: "Henley Passport Index (normalizado desde datos locales)",
    source_urls: ["https://www.henleyglobal.com/passport-index"],
    countries: supportedOrigins,
  };
  await fs.writeFile(META_PATH, JSON.stringify(metaPayload, null, 2));

  log(`Archivo principal: ${MATRIX_PATH}`);
  log(`Archivo meta: ${META_PATH}`);
};

const main = async () => {
  log("Generando dataset Henley normalizado...");

  try {
    const { originCountries, destinationCountries, requirements } = await loadSources();
    const matrix = buildMatrix(requirements, originCountries, destinationCountries);

    if (Object.keys(matrix).length === 0) {
      warn("No se encontraron datos para construir la matriz. Revisa los ISO en data/countries.ts.");
    }

    await writeDataset(matrix);
    log("Listo. Archivos generados en public/data.");
  } catch (error) {
    console.error("[henley] Error al generar el dataset:", error);
    process.exitCode = 1;
  }
};

main();
