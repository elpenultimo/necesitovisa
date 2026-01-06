import { destinationCountries, originCountries } from "./countries";
import { buildHenleyOverrideMap, loadHenleyMatrix, loadHenleyMeta } from "@/lib/henleyDataset";

export type Requirement = {
  originSlug: string;
  destSlug: string;
  visaRequired: boolean;
  maxStayDays: number | null;
  altPermit: string | null;
  passportRule: string;
  onwardTicket: string;
  fundsProof: string;
  notes: string[];
  sources: { label: string; url: string }[];
  embassy: {
    name: string;
    url: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  lastReviewed: string; // YYYY-MM-DD
  lastReviewedAt?: string; // optional alias
  ultimaRevision?: string; // optional alias
  henleyPdfUpdatedAt?: string | null;
  henleySource?: string | null;
};

const defaultRequirement = {
  maxStayDays: 90,
  altPermit: null,
  passportRule: "Pasaporte vigente al menos 6 meses desde la fecha de ingreso.",
  onwardTicket: "Suele requerirse prueba de salida o boleto de retorno.",
  fundsProof: "Demuestra solvencia para cubrir gastos durante la estadía.",
  notes: [
    "Confirma requisitos sanitarios y seguros de viaje vigentes.",
    "Algunas aerolíneas solicitan formularios adicionales antes del embarque.",
  ],
  sources: [
    { label: "Sitio oficial de migraciones", url: "https://www.gov.example/requisitos" },
    { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
  ],
  embassy: {
    name: "Embajada o consulado del destino",
    url: "https://www.embajada.example",
    email: null,
    phone: null,
    address: null,
  },
  lastReviewed: "2024-06-01",
};

const destinationOverrides: Record<string, Partial<Requirement>> = {
  "estados-unidos": {
    visaRequired: true,
    altPermit: "ESTA",
    notes: [
      "La autorización ESTA aplica para viajes de turismo o negocios cortos.",
      "Si planeas trabajar o estudiar, se requiere una visa específica.",
    ],
    sources: [
      { label: "CBP / ESTA", url: "https://esta.cbp.dhs.gov/" },
      { label: "Embajada de EE.UU.", url: "https://travel.state.gov/" },
    ],
    embassy: {
      name: "Embajada o consulado de Estados Unidos",
      url: "https://www.usembassy.gov/",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-15",
  },
  canada: {
    visaRequired: true,
    altPermit: "eTA",
    sources: [
      { label: "Gobierno de Canadá", url: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
      { label: "eTA", url: "https://www.canada.ca/eta" },
    ],
    embassy: {
      name: "Embajada de Canadá",
      url: "https://www.international.gc.ca/",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-10",
  },
  mexico: {
    visaRequired: false,
    altPermit: "No aplica",
    sources: [
      { label: "Gobierno de México", url: "https://www.gob.mx/" },
      { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
    ],
    embassy: {
      name: "Instituto Nacional de Migración",
      url: "https://www.gob.mx/inm",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-05",
  },
  brasil: {
    visaRequired: false,
    altPermit: "No aplica",
    sources: [
      { label: "Policía Federal de Brasil", url: "https://www.gov.br/pf" },
      { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
    ],
    embassy: {
      name: "Embajada o consulado de Brasil",
      url: "https://www.gov.br/mre/pt-br",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-08",
  },
  "reino-unido": {
    visaRequired: true,
    altPermit: "ETA",
    notes: [
      "La ETA se gestiona en línea y es necesaria incluso para estancias cortas.",
      "Si estudiarás o trabajarás, revisa la categoría de visa correspondiente.",
    ],
    sources: [
      { label: "UK Home Office", url: "https://www.gov.uk/uk-border-control" },
      { label: "ETA UK", url: "https://www.gov.uk/guidance/electronic-travel-authorisation-eta" },
    ],
    embassy: {
      name: "Embajada británica",
      url: "https://www.gov.uk/world/embassies",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-12",
  },
  japon: {
    visaRequired: true,
    altPermit: null,
    notes: [
      "Algunas nacionalidades pueden acceder a exención parcial; verifica tu caso.",
      "Puede pedirse itinerario detallado y reservas de alojamiento.",
    ],
    sources: [
      { label: "MOFA Japan", url: "https://www.mofa.go.jp/j_info/visit/visa/" },
      { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
    ],
    embassy: {
      name: "Embajada o consulado de Japón",
      url: "https://www.mofa.go.jp/about/emb_cons/mofaserv.html",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-07",
  },
  australia: {
    visaRequired: true,
    altPermit: "ETA",
    sources: [
      { label: "Departamento de Home Affairs", url: "https://immi.homeaffairs.gov.au/" },
      { label: "ETA Australia", url: "https://www.eta.homeaffairs.gov.au/" },
    ],
    embassy: {
      name: "Embajada o consulado de Australia",
      url: "https://www.dfat.gov.au/about-us/our-locations/missions",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-11",
  },
  china: {
    visaRequired: true,
    altPermit: null,
    notes: [
      "Se suele requerir carta de invitación o reserva hotelera.",
      "Algunas ciudades permiten tránsito sin visa por 72/144 horas.",
    ],
    sources: [
      { label: "Embajada de China", url: "https://www.fmprc.gov.cn/" },
      { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
    ],
    embassy: {
      name: "Embajada o consulado de la República Popular China",
      url: "https://www.fmprc.gov.cn/eng/wjb_663304/zwjg_665342/",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-04",
  },
  turquia: {
    visaRequired: true,
    altPermit: "eVisa",
    sources: [
      { label: "República de Türkiye", url: "https://www.evisa.gov.tr/en/" },
      { label: "Ministerio de Asuntos Exteriores", url: "https://www.mfa.gov.tr/" },
    ],
    embassy: {
      name: "Embajada o consulado de Türkiye",
      url: "https://www.mfa.gov.tr/foreign-representations-of-turkiye.en.mfa",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-03",
  },
  schengen: {
    visaRequired: false,
    altPermit: null,
    notes: [
      "Para estancias hasta 90 días en un periodo de 180 días en el área Schengen.",
      "ETIAS será obligatorio cuando entre en vigor; sigue las actualizaciones oficiales.",
    ],
    sources: [
      { label: "Schengen Visa Info", url: "https://www.schengenvisainfo.com/" },
      { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
    ],
    embassy: {
      name: "Embajada o consulado del país Schengen principal",
      url: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2024-06-09",
  },
};

const henleyMatrix = loadHenleyMatrix();
export const henleyMeta = loadHenleyMeta();
const henleyOverrides = buildHenleyOverrideMap(henleyMatrix);

const pairOverrides: Record<string, Partial<Requirement>> = {
  "chile-japon": {
    visaRequired: false,
    maxStayDays: 90,
    altPermit: null,
    notes: [
      "Pasaporte chileno sin visa para turismo o negocios por hasta 90 días (sello de entrada).",
      "Se puede solicitar pasaje de salida, prueba de fondos y reserva de alojamiento al arribo.",
    ],
    sources: [
      {
        label: "MOFA Japan - Exención de visa de corta estadía",
        url: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html",
      },
      { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
    ],
    embassy: {
      name: "Embajada de Japón en Chile",
      url: "https://www.cl.emb-japan.go.jp/itpr_es/visas.html",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2026-01-05",
  },
  "chile-china": {
    visaRequired: false,
    maxStayDays: 30,
    altPermit: null,
    notes: [
      "Pasaporte chileno puede ingresar sin visa por hasta 30 días para turismo o negocios mientras esté vigente la exención.",
      "Confirma fechas de vigencia y requisitos adicionales (reservas, fondos, retorno) antes de viajar.",
    ],
    sources: [
      {
        label: "Embajada de China en Chile - Exención de visa para chilenos",
        url: "http://cl.china-embassy.gov.cn/esp/lsfw/qzyw/202311/t20231122_11194020.htm",
      },
      { label: "IATA/Timatic", url: "https://www.iatatravelcentre.com/" },
    ],
    embassy: {
      name: "Embajada de China en Chile",
      url: "http://cl.china-embassy.gov.cn/esp/",
      email: null,
      phone: null,
      address: null,
    },
    lastReviewed: "2026-01-05",
  },
  "chile-turquia": {
    notes: [
      "Revisar: pasaporte chileno podría estar exento de visa por estadías cortas; confirmar vigencia en fuentes oficiales de Türkiye antes de ajustar esta respuesta.",
      "Si aplica visa, revisa si corresponde visa electrónica o trámite consular antes del viaje.",
    ],
    lastReviewed: "2026-01-05",
  },
};

const buildRequirement = (
  originSlug: string,
  destSlug: string,
  overrides: Partial<Requirement>,
  pairOverride?: Partial<Requirement>
): Requirement => {
  const baseRequirement = {
    ...defaultRequirement,
    originSlug,
    destSlug,
    visaRequired: overrides.visaRequired ?? false,
    ...overrides,
  };

  return {
    ...baseRequirement,
    ...pairOverride,
    visaRequired: pairOverride?.visaRequired ?? baseRequirement.visaRequired,
    maxStayDays: pairOverride?.maxStayDays ?? baseRequirement.maxStayDays,
    altPermit: pairOverride?.altPermit ?? baseRequirement.altPermit,
    notes: pairOverride?.notes ?? baseRequirement.notes,
    sources: pairOverride?.sources ?? baseRequirement.sources,
    embassy: pairOverride?.embassy ?? baseRequirement.embassy,
    lastReviewed: pairOverride?.lastReviewed ?? baseRequirement.lastReviewed,
  };
};

const applyHenleyOverride = (requirement: Requirement): Requirement => {
  const override = henleyOverrides.get(`${requirement.originSlug}-${requirement.destSlug}`);
  if (!override) return requirement;

  const lastReviewed = override.pdfUpdatedAt ?? requirement.lastReviewed;

  return {
    ...requirement,
    visaRequired: override.requiresVisa ?? requirement.visaRequired,
    lastReviewed,
    henleyPdfUpdatedAt: override.pdfUpdatedAt ?? null,
    henleySource: "henley_pdf_local",
  };
};

export const requirements: Requirement[] = [];

originCountries.forEach((origin) => {
  destinationCountries.forEach((dest) => {
    const overrides = destinationOverrides[dest.slug] ?? {};
    const originDestOverrides = pairOverrides[`${origin.slug}-${dest.slug}`];
    requirements.push(
      applyHenleyOverride(
        buildRequirement(origin.slug, dest.slug, overrides, originDestOverrides)
      )
    );
  });
});

export const requirementIndex = new Map<string, Requirement>(
  requirements.map((item) => [`${item.originSlug}-${item.destSlug}`, item])
);

export const findRequirement = (originSlug: string, destSlug: string) =>
  requirementIndex.get(`${originSlug}-${destSlug}`);
