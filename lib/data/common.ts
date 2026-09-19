import { slugify, uid, nowIso } from "@/lib/utils";

export function newId(): string {
  return uid();
}
export function timestamps() {
  return { created_at: nowIso(), updated_at: nowIso() };
}
export function touch() {
  return { updated_at: nowIso() };
}
export function makeSlug(name: string, existing: string[]): string {
  const base = slugify(name) || "item";
  let slug = base;
  let i = 2;
  while (existing.includes(slug)) slug = `${base}-${i++}`;
  return slug;
}
