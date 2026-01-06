import { slugify } from "@/lib/slug";
import { getVisaMatrix } from "@/lib/visaDataset";

export type Country = {
  name: string;
  slug: string;
  iso2?: string;
};

const fallbackOrigins: Country[] = [
  { name: "Chile", slug: "chile", iso2: "CL" },
  { name: "Argentina", slug: "argentina", iso2: "AR" },
  { name: "México", slug: "mexico", iso2: "MX" },
  { name: "Colombia", slug: "colombia", iso2: "CO" },
  { name: "España", slug: "espana", iso2: "ES" },
];

const fallbackDestinations: Country[] = [
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

const visaMatrix = getVisaMatrix();

const datasetOriginCountries = visaMatrix
  ? Object.entries(visaMatrix.origins)
      .map(([name, origin]) => ({
        name,
        slug: slugify(name),
        iso2: origin.code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  : null;

const buildDestinationsFromDataset = () => {
  if (!visaMatrix) return null;
  const destinations = new Map<string, Country>();

  Object.values(visaMatrix.origins).forEach((origin) => {
    Object.keys(origin.destinations).forEach((destName) => {
      const normalizedName = destName.trim();
      const slug = slugify(normalizedName);
      if (!destinations.has(slug)) {
        destinations.set(slug, { name: normalizedName, slug });
      }
    });
  });

  return Array.from(destinations.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const datasetDestinations = buildDestinationsFromDataset();

export const originCountries: Country[] = datasetOriginCountries ?? fallbackOrigins;

export const destinationCountries: Country[] = datasetDestinations ?? fallbackDestinations;
