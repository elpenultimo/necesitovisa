import countries from "i18n-iso-countries";
countries.registerLocale({ locale: "es" });

export const overrides = {
  "Antigua and Barbuda": "Antigua y Barbuda",
  "Dominican Republic": "República Dominicana",
  "Czech Republic": "República Checa",
  "United States": "Estados Unidos",
  "United Kingdom": "Reino Unido",
  "Ivory Coast": "Costa de Marfil",
  "DR Congo": "República Democrática del Congo",
  "North Korea": "Corea del Norte",
  "South Korea": "Corea del Sur",
  "Cape Verde": "Cabo Verde",
  "Timor-Leste": "Timor Oriental",
  Russia: "Rusia",
  Bolivia: "Bolivia",
};

export function getCountryNameEs(englishName) {
  if (!englishName) return englishName;
  if (overrides[englishName]) return overrides[englishName];

  const alpha2 = countries.getAlpha2Code(englishName, "en");
  if (alpha2) {
    const localized = countries.getName(alpha2, "es");
    if (localized) return localized;
  }

  return englishName;
}

export function slugifyEs(input) {
  const normalized = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/ñ/g, "n");

  const withConjunction = normalized.replace(/&/g, "y");
  const replaced = withConjunction.replace(/[\s\/]+/g, "-");
  const sanitized = replaced.replace(/[^a-z0-9-]/g, "");
  const collapsed = sanitized.replace(/-+/g, "-");
  return collapsed.replace(/^-+|-+$/g, "");
}
