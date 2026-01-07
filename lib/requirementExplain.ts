import { RequirementType } from "@/lib/visaRequirement";

type RequirementExplanationParams = {
  type?: RequirementType;
  days?: number;
  originName?: string;
  destinationName?: string;
};

const buildVisaFreeWithDays = (days: number) =>
  `No necesitas visa para turismo por hasta ${days} días (según la información disponible). ` +
  "Ojo: pueden existir condiciones como pasaje de salida, seguro o fondos. " +
  "Para estadías más largas o para trabajar/estudiar, normalmente se requiere un permiso o visa distinta.";

const buildExplanationByType = (type: RequirementType, days?: number) => {
  switch (type) {
    case "E_VISA":
      return (
        "Una e-Visa es una autorización electrónica que se solicita por internet antes del viaje. " +
        "Normalmente se aprueba y se asocia a tu pasaporte; en el aeropuerto pueden pedir comprobantes " +
        "(pasaje de salida, alojamiento, fondos). Revisa el sitio oficial para pasos y tiempos. " +
        "Evita webs intermediarias; usa el sitio oficial."
      );
    case "VOA":
      return (
        "La visa a la llegada se tramita al aterrizar (o al ingresar por frontera). " +
        "Suele requerir pasaporte vigente, formulario y pago de tasas; a veces piden pasaje de salida y reserva. " +
        "Confirma requisitos exactos antes de viajar."
      );
    case "REQUIRES_VISA":
      return (
        "Esto significa que necesitas solicitar una visa en una embajada o consulado (o plataforma oficial) antes de viajar. " +
        "Los requisitos varían según motivo (turismo, trabajo, estudio) y pueden incluir entrevista y documentos. " +
        "Revisa la fuente oficial para el procedimiento."
      );
    case "NO_VISA_DAYS":
      return days ? buildVisaFreeWithDays(days) : undefined;
    case "NO_VISA":
      return (
        "No necesitas visa para visitas cortas (turismo) según la información disponible. " +
        "Para estadías largas, trabajo o estudio, los requisitos suelen ser distintos. " +
        "Confirma condiciones en la fuente oficial."
      );
    case "ETA":
      return (
        "Una autorización electrónica (ETA/eTA/ESTA) no es una visa tradicional: es un permiso previo para abordar y entrar por turismo o tránsito. " +
        "Se solicita online, puede tener costo y toma desde minutos a días. Debe gestionarse antes del viaje. " +
        "Evita webs intermediarias; usa el sitio oficial."
      );
    case "UNKNOWN":
    default:
      return undefined;
  }
};

export function getRequirementExplanation({ type, days }: RequirementExplanationParams) {
  if (!type) {
    return (
      "Los requisitos pueden cambiar y dependen del tipo de viaje (turismo, trabajo, estudio). " +
      "Para confirmar el trámite exacto y documentos, revisa siempre fuentes oficiales."
    );
  }

  const explanation = buildExplanationByType(type, days);

  if (!explanation) {
    return (
      "Los requisitos pueden cambiar y dependen del tipo de viaje (turismo, trabajo, estudio). " +
      "Para confirmar el trámite exacto y documentos, revisa siempre fuentes oficiales."
    );
  }

  return explanation;
}

export type { RequirementExplanationParams };
