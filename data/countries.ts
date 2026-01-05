export type Country = {
  name: string;
  slug: string;
  iso2?: string;
};

export const originCountries: Country[] = [
  { name: "Chile", slug: "chile", iso2: "CL" },
  { name: "Argentina", slug: "argentina", iso2: "AR" },
  { name: "México", slug: "mexico", iso2: "MX" },
  { name: "Colombia", slug: "colombia", iso2: "CO" },
  { name: "España", slug: "espana", iso2: "ES" },
];

export const destinationCountries: Country[] = [
  { name: "Estados Unidos", slug: "estados-unidos", iso2: "US" },
  { name: "Canadá", slug: "canada", iso2: "CA" },
  { name: "México", slug: "mexico", iso2: "MX" },
  { name: "Brasil", slug: "brasil", iso2: "BR" },
  { name: "Reino Unido", slug: "reino-unido", iso2: "GB" },
  { name: "Japón", slug: "japon", iso2: "JP" },
  { name: "Australia", slug: "australia", iso2: "AU" },
  { name: "China", slug: "china", iso2: "CN" },
  { name: "Turquía", slug: "turquia", iso2: "TR" },
  { name: "Espacio Schengen", slug: "schengen", iso2: "EU" },
];
