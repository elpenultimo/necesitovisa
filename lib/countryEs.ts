import {
  getCountryNameEs as getCountryNameEsJs,
  slugifyEs as slugifyEsJs,
  overrides as overridesJs,
} from "./countryEs.js";

export const overrides = overridesJs as Record<string, string>;

export function getCountryNameEs(englishName: string): string {
  return getCountryNameEsJs(englishName);
}

export function slugifyEs(name: string): string {
  return slugifyEsJs(name);
}
