import countries from "i18n-iso-countries";

countries.registerLocale({ locale: "es" });

const ISO2_REGEX = /^[A-Z]{2}$/;

export function getCountryIso2FromNameEs(countryName: string): string | undefined {
  const alpha2 = countries.getAlpha2Code(countryName, "es");
  if (alpha2 && ISO2_REGEX.test(alpha2)) return alpha2;
  return undefined;
}

export function iso2ToFlagEmoji(iso2: string): string | undefined {
  if (!ISO2_REGEX.test(iso2)) return undefined;

  try {
    const codePoints = iso2
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.codePointAt(0)!);
    return String.fromCodePoint(...codePoints);
  } catch {
    return undefined;
  }
}
