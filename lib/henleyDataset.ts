import fs from "fs";
import path from "path";

export type HenleyDataset = {
  iso?: string;
  source_url?: string;
  source_date?: string | null;
  generated_at?: string;
  pdf_path?: string;
  pdf_size_bytes?: number;
  note?: string;
};

const datasetPath = path.join(process.cwd(), "public", "data", "visa-matrix.generated.json");

export const readHenleyDataset = (): HenleyDataset | null => {
  try {
    if (!fs.existsSync(datasetPath)) return null;
    const raw = fs.readFileSync(datasetPath, "utf-8");
    return JSON.parse(raw) as HenleyDataset;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("No se pudo leer el dataset Henley generado", error);
    return null;
  }
};
