import { RequirementType } from "@/lib/visaRequirement";

type VisaFaqItem = {
  question: string;
  answer: string;
};

type VisaFaqType = RequirementType;

const normalizeFaqType = (requirementType: string): VisaFaqType => {
  const normalized = requirementType.trim().toLowerCase();

  if (normalized.includes("evisa") || normalized.includes("e-visa")) {
    return "E_VISA";
  }

  if (normalized.includes("esta")) {
    return "ESTA";
  }

  if (normalized === "eta" || normalized.includes("eta")) {
    return "ETA";
  }

  if (normalized.includes("visa_free") || normalized.includes("visa-free") || normalized.includes("visa free")) {
    return "NO_VISA";
  }

  if (normalized.includes("visa_required") || normalized.includes("visa required") || normalized === "required") {
    return "REQUIRES_VISA";
  }

  if (normalized.includes("voa") || normalized.includes("visa on arrival") || normalized.includes("on arrival")) {
    return "VOA";
  }

  return normalized.toUpperCase() as VisaFaqType;
};

const baseQuestions = (destination: string): VisaFaqItem[] => [
  {
    question: "¿Qué es una visa?",
    answer:
      "Es una autorización que emite el país de destino para permitir el ingreso por un período y motivo específicos, como turismo.",
  },
  {
    question: "¿La visa garantiza la entrada al país?",
    answer:
      "No. La decisión final de entrada la toma la autoridad migratoria al llegar, y puede pedir documentos adicionales.",
  },
  {
    question: "¿Con cuánta anticipación conviene iniciar el trámite?",
    answer:
      "Depende del tipo de permiso, pero es recomendable empezar con varias semanas de anticipación para evitar contratiempos.",
  },
  {
    question: `¿Qué documentos suelen pedir para viajar a ${destination}?`,
    answer:
      "Generalmente se solicita pasaporte vigente y, en algunos casos, prueba de fondos, alojamiento o pasaje de salida.",
  },
];

const faqByType: Record<VisaFaqType, (destination: string) => VisaFaqItem[]> = {
  NO_VISA: (destination) => [
    {
      question: "¿Qué significa ingreso sin visa?",
      answer: "Significa que para viajes cortos de turismo no necesitas una visa previa para entrar.",
    },
    {
      question: "¿Puedo quedarme por tiempo indefinido?",
      answer: "No. Aunque no se exija visa, normalmente hay un límite de días permitido para turismo.",
    },
    {
      question: "¿Pueden pedirme documentos al llegar?",
      answer: "Sí. Pueden solicitar pasaje de salida, reservas o evidencia de solvencia.",
    },
    ...baseQuestions(destination),
  ],
  NO_VISA_DAYS: (destination) => [
    {
      question: "¿Qué significa entrada sin visa por días limitados?",
      answer: "Puedes viajar por turismo sin visa, pero solo por un número máximo de días.",
    },
    {
      question: "¿Qué pasa si necesito quedarme más tiempo?",
      answer: "Deberías gestionar una visa o permiso distinto antes del viaje o según las reglas locales.",
    },
    {
      question: "¿Pueden pedirme documentos al llegar?",
      answer: "Sí. Aun sin visa, pueden pedir pasaje de salida, reservas o fondos.",
    },
    ...baseQuestions(destination),
  ],
  E_VISA: (destination) => [
    {
      question: "¿Qué es una eVisa?",
      answer:
        "Es una autorización electrónica que se solicita online antes del viaje y se asocia a tu pasaporte.",
    },
    {
      question: "¿Cómo se solicita una eVisa?",
      answer:
        "Normalmente se completa un formulario en línea, se suben documentos y se paga una tasa.",
    },
    {
      question: "¿Cuánto tarda en aprobarse?",
      answer: "Puede tardar desde horas hasta varios días, según el país y la temporada.",
    },
    {
      question: `¿Necesito imprimir la eVisa para viajar a ${destination}?`,
      answer:
        "En muchos casos basta con el registro electrónico, pero es útil llevar una copia digital o impresa.",
    },
    ...baseQuestions(destination),
  ],
  ESTA: (destination) => [
    {
      question: "¿Qué es la autorización ESTA?",
      answer:
        "Es un permiso electrónico previo que habilita viajes cortos por turismo o tránsito sin visa tradicional.",
    },
    {
      question: "¿La ESTA es una visa?",
      answer: "No. Es una autorización de viaje que se tramita en línea antes de volar.",
    },
    {
      question: "¿Cuánto tiempo antes debo solicitarla?",
      answer: "Es recomendable hacerlo con días o semanas de anticipación para evitar retrasos.",
    },
    {
      question: `¿La ESTA sirve para cualquier motivo de viaje a ${destination}?`,
      answer: "No. Usualmente aplica para turismo o tránsito; trabajo o estudio requieren otro trámite.",
    },
    ...baseQuestions(destination),
  ],
  ETA: (destination) => [
    {
      question: "¿Qué es una ETA?",
      answer:
        "Es una autorización electrónica previa que se solicita online antes de viajar por turismo o tránsito.",
    },
    {
      question: "¿La ETA reemplaza a la visa tradicional?",
      answer: "Para viajes cortos sí, pero no cubre trabajo o estudio.",
    },
    {
      question: "¿Cuándo debo solicitar la ETA?",
      answer: "Conviene hacerlo con anticipación, ya que la aprobación puede tomar tiempo.",
    },
    {
      question: `¿Debo llevar prueba de la ETA al viajar a ${destination}?`,
      answer: "Es útil tener el comprobante a mano, aunque muchas veces queda asociada al pasaporte.",
    },
    ...baseQuestions(destination),
  ],
  VOA: (destination) => [
    {
      question: "¿Qué es la visa a la llegada?",
      answer: "Es un permiso que se tramita al aterrizar o ingresar por frontera.",
    },
    {
      question: "¿Qué se necesita para obtenerla?",
      answer: "Suele requerir pasaporte vigente, formulario y pago de tasas.",
    },
    {
      question: "¿Puedo viajar sin preparación previa?",
      answer: "Aun con visa a la llegada, es aconsejable llevar documentos y fondos comprobables.",
    },
    ...baseQuestions(destination),
  ],
  REQUIRES_VISA: (destination) => [
    {
      question: "¿Qué es una visa consular tradicional?",
      answer:
        "Es un permiso que se solicita antes del viaje en un consulado o embajada, con requisitos y tiempos definidos.",
    },
    {
      question: "¿Quién otorga la visa?",
      answer: "La otorga la autoridad migratoria del país de destino a través de su consulado o sistema oficial.",
    },
    {
      question: "¿Cuánto tiempo antes debo solicitarla?",
      answer: "Se recomienda iniciar el trámite con varias semanas de anticipación.",
    },
    {
      question: `¿Puedo hacer escala en ${destination} sin visa?`,
      answer:
        "Depende de si hay tránsito internacional sin pasar migración; algunas escalas exigen visado.",
    },
    ...baseQuestions(destination),
  ],
  UNKNOWN: (destination) => [
    {
      question: "¿Qué significa requisito de visa por confirmar?",
      answer: "La información disponible no es concluyente y puede requerir verificación adicional.",
    },
    {
      question: "¿Qué es una visa?",
      answer:
        "Es una autorización que emite el país de destino para permitir el ingreso por un período y motivo específicos.",
    },
    {
      question: "¿La visa garantiza la entrada?",
      answer: "No. La autoridad migratoria define el ingreso al llegar.",
    },
    ...baseQuestions(destination),
  ],
};

export const getVisaFaq = (requirementType: string, destination: string): VisaFaqItem[] => {
  const normalizedType = normalizeFaqType(requirementType);
  const generator = faqByType[normalizedType] ?? faqByType.UNKNOWN;
  const items = generator(destination).slice(0, 6);
  return items.length < 4 ? items.concat(baseQuestions(destination)).slice(0, 4) : items;
};

export type { VisaFaqItem };
