import { Requirement } from "@/data/requirements";

type ExtendedRequirement = Requirement & {
  lastReviewedAt?: string;
  ultimaRevision?: string;
};

export type ReviewStatusKey = "green" | "yellow" | "red";

export type ReviewStatusInfo = {
  key: ReviewStatusKey;
  label: string;
  helperText: string;
  emoji: string;
};

export type ReviewMetadata = {
  status: ReviewStatusInfo;
  lastReviewedLabel: string;
  relativeText: string;
  lastReviewedDate: Date | null;
  ageInMs: number;
  ageInDays: number | null;
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const statusConfig: Record<ReviewStatusKey, ReviewStatusInfo> = {
  green: {
    key: "green",
    label: "Actualizado",
    helperText: "Actualizado en los últimos 7 días",
    emoji: "🟢",
  },
  yellow: {
    key: "yellow",
    label: "Por revisar",
    helperText: "Actualizado hace menos de 30 días",
    emoji: "🟡",
  },
  red: {
    key: "red",
    label: "Desactualizado",
    helperText: "Última revisión hace más de 30 días",
    emoji: "🔴",
  },
};

const getLastReviewedValue = (requirement: ExtendedRequirement) => {
  const raw =
    requirement.lastReviewed?.trim() ||
    requirement.lastReviewedAt?.trim() ||
    requirement.ultimaRevision?.trim() ||
    "";

  return raw.length > 0 ? raw : null;
};

const safeDateFromString = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
};

const buildFreshnessMetadata = (rawValue: string | null) => {
  const lastReviewedDate = safeDateFromString(rawValue);
  const now = new Date();

  const ageInMs = lastReviewedDate ? now.getTime() - lastReviewedDate.getTime() : Number.POSITIVE_INFINITY;
  const ageInDays = Number.isFinite(ageInMs) ? Math.floor(ageInMs / MS_IN_DAY) : null;

  let statusKey: ReviewStatusKey = "red";

  if (ageInDays !== null && ageInDays <= 7) {
    statusKey = "green";
  } else if (ageInDays !== null && ageInDays <= 30) {
    statusKey = "yellow";
  }

  const relativeText = (() => {
    if (!lastReviewedDate) return "Sin fecha";
    if (ageInDays === null || !Number.isFinite(ageInDays)) return "Sin fecha";
    if (ageInDays <= 0) return "Actualizado hoy";
    if (ageInDays === 1) return "Hace 1 día";
    return `Hace ${ageInDays} días`;
  })();

  return {
    lastReviewedLabel: rawValue ?? "Sin fecha",
    relativeText,
    lastReviewedDate,
    ageInMs,
    ageInDays,
    statusKey,
  } as const;
};

export const getFreshnessFromDate = (rawValue: string | null): ReviewMetadata => {
  const base = buildFreshnessMetadata(rawValue);
  return {
    ...base,
    status: statusConfig[base.statusKey],
  };
};

export const getReviewMetadata = (requirement: ExtendedRequirement): ReviewMetadata => {
  const base = buildFreshnessMetadata(getLastReviewedValue(requirement));
  return {
    ...base,
    status: statusConfig[base.statusKey],
  };
};

export const REVIEW_STATUS_CONFIG = statusConfig;
