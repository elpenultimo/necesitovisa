import fs from "fs/promises";
import path from "path";

const resolveIso = () => {
  const argIso = process.argv.find((arg) => arg.startsWith("--iso="));
  const argValue = argIso ? argIso.split("=")[1] : undefined;
  const envIso = process.env.HENLEY_SOURCE_ISO;
  const fallbackIso = "ESP";
  return (argValue ?? envIso ?? fallbackIso).trim().toUpperCase();
};

const parseDateHeader = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const log = (message) => {
  // eslint-disable-next-line no-console
  console.log(`[henley] ${message}`);
};

const main = async () => {
  const iso = resolveIso();
  const sourceUrl = `https://cdn.henleyglobal.com/storage/app/media/HPI/${iso}_visa_full.pdf`;
  const generatedAt = new Date().toISOString();

  log(`Descargando PDF desde ${sourceUrl}`);
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`No se pudo descargar el PDF (status ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const outputDir = path.join(process.cwd(), "public", "data");
  await fs.mkdir(outputDir, { recursive: true });

  const pdfPath = path.join(outputDir, `henley-${iso}.pdf`);
  await fs.writeFile(pdfPath, buffer);

  const sourceDate = parseDateHeader(response.headers.get("last-modified"));

  const output = {
    iso,
    source_url: sourceUrl,
    source_date: sourceDate,
    generated_at: generatedAt,
    pdf_path: path.relative(process.cwd(), pdfPath),
    pdf_size_bytes: buffer.byteLength,
    note: "El PDF se descarga manualmente y puede requerir parsing adicional para generar la matriz.",
  };

  const jsonPath = path.join(outputDir, "visa-matrix.generated.json");
  await fs.writeFile(jsonPath, `${JSON.stringify(output, null, 2)}\n`, "utf-8");

  log(`Archivo JSON generado en ${path.relative(process.cwd(), jsonPath)}`);
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[henley] Error al actualizar el dataset:", error.message);
  process.exitCode = 1;
});
