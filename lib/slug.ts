export function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "");

  const replaced = normalized.replace(/[\s\/]+/g, "-");
  const sanitized = replaced.replace(/[^a-z0-9-]/g, "");
  const collapsed = sanitized.replace(/-+/g, "-");
  return collapsed.replace(/^-+|-+$/g, "");
}
