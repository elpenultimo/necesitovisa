const registeredLocales = new Set(["en"]);
const localeCache = new Map();

function discoverRegionCodes() {
  if (typeof Intl === "undefined" || !Intl.DisplayNames) return [];
  const display = new Intl.DisplayNames(["en"], { type: "region" });
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const codes = [];

  for (const first of letters) {
    for (const second of letters) {
      const code = `${first}${second}`;
      const name = display.of(code);
      if (name && name !== code) {
        codes.push(code);
      }
    }
  }

  return codes;
}

const REGION_CODES = discoverRegionCodes();

function buildLocaleData(locale) {
  if (localeCache.has(locale)) return localeCache.get(locale);
  if (typeof Intl === "undefined" || !Intl.DisplayNames) {
    localeCache.set(locale, { byCode: new Map(), byName: new Map() });
    return localeCache.get(locale);
  }

  const display = new Intl.DisplayNames([locale], { type: "region" });
  const displayEn = new Intl.DisplayNames(["en"], { type: "region" });

  const byCode = new Map();
  const byName = new Map();

  REGION_CODES.forEach((code) => {
    const nameLocale = display.of(code);
    const nameEn = displayEn.of(code);
    if (nameLocale && nameLocale !== code) {
      byCode.set(code.toUpperCase(), nameLocale);
    }
    if (nameEn && nameEn !== code) {
      byName.set(nameEn.toLowerCase(), code.toUpperCase());
    }
  });

  const localeData = { byCode, byName };
  localeCache.set(locale, localeData);
  return localeData;
}

export function registerLocale(localeData) {
  if (localeData && localeData.locale) {
    registeredLocales.add(localeData.locale);
  }
}

export function getAlpha2Code(name, locale = "en") {
  const normalized = name?.toLowerCase();
  if (!normalized) return undefined;
  const data = buildLocaleData(locale);
  return data.byName.get(normalized);
}

export function getName(code, locale = "en") {
  const upper = code?.toUpperCase();
  if (!upper) return undefined;
  if (!registeredLocales.has(locale)) return undefined;
  const data = buildLocaleData(locale);
  return data.byCode.get(upper);
}

export default {
  registerLocale,
  getAlpha2Code,
  getName,
};
