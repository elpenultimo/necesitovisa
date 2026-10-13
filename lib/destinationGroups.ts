import type { DestinationEntry } from "@/lib/visaData";
import { normalizeRequirement } from "@/lib/visaRequirement";

export const destinationCategories = [
  { id: "sin-visa", title: "Sin visa", description: "No se exige visa para la visita corta indicada. Pueden existir formularios y otras condiciones de entrada." },
  { id: "autorizacion", title: "Autorización electrónica", description: "Requiere un permiso previo como ESTA o ETA. No lo cuentes como entrada sin trámites." },
  { id: "llegada", title: "Visa a la llegada", description: "El permiso se obtiene al llegar, sujeto a las condiciones de cada destino." },
  { id: "evisa", title: "eVisa", description: "Debes gestionar una visa por internet antes de viajar." },
] as const;

export function groupDestinations(destinations: DestinationEntry[], originKey: string) {
  const groups: Record<string, DestinationEntry[]> = Object.fromEntries(destinationCategories.map(c => [c.id, []]));
  let otherCount = 0;
  for (const dest of destinations) {
    if (dest.key === originKey) continue;
    const type = normalizeRequirement(dest.requirement).type;
    const category = type === "NO_VISA" || type === "NO_VISA_DAYS" ? "sin-visa" : type === "ESTA" || type === "ETA" ? "autorizacion" : type === "VOA" ? "llegada" : type === "E_VISA" ? "evisa" : null;
    if (category) groups[category].push(dest); else otherCount++;
  }
  for (const group of Object.values(groups)) group.sort((a,b) => a.name_es.localeCompare(b.name_es, "es"));
  return { groups, otherCount };
}
