import data from "@/data/document-guides.json";
export const documentGuides = data;
export function guidesForDestination(key: string) {
  return documentGuides.filter(guide => guide.destination === key);
}
