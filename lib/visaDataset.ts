import fs from "fs";
import path from "path";

export type VisaDestination = {
  requiresVisa: boolean;
};

export type VisaOrigin = {
  code: string;
  pdfUrl: string;
  destinations: Record<string, VisaDestination>;
};

export type VisaMatrix = {
  generatedAt: string;
  source: string;
  origins: Record<string, VisaOrigin>;
};

export type DatasetFreshnessStatus = "green" | "yellow" | "red";

export type DatasetFreshness = {
  status: DatasetFreshnessStatus;
  ageInDays: number | null;
  generatedAtText: string;
  generatedAtDate: Date | null;
};

const GENERATED_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "visa-matrix.generated.json"
);

let cachedVisaMatrix: VisaMatrix | null | undefined;

export const getVisaMatrix = (): VisaMatrix | null => {
  if (cachedVisaMatrix !== undefined) {
    return cachedVisaMatrix;
  }

  try {
    const raw = fs.readFileSync(GENERATED_DATA_PATH, "utf8");
    cachedVisaMatrix = JSON.parse(raw);
  } catch (error) {
    cachedVisaMatrix = null;
  }

  return cachedVisaMatrix;
};

export const getDatasetFreshness = (generatedAt?: string | null): DatasetFreshness => {
  const generatedAtDate = generatedAt ? new Date(generatedAt) : null;
  const now = new Date();
  const ageInDays = generatedAtDate
    ? Math.floor((now.getTime() - generatedAtDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let status: DatasetFreshnessStatus = "red";
  if (ageInDays !== null && ageInDays <= 30) {
    status = "green";
  } else if (ageInDays !== null && ageInDays <= 90) {
    status = "yellow";
  }

  const generatedAtText = generatedAtDate ? generatedAtDate.toISOString().slice(0, 10) : "Desconocido";

  return { status, ageInDays, generatedAtText, generatedAtDate };
};
