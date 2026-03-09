import { toSlug } from "@/lib/utils/slug";

export function normalizeCity(city: string): string {
  return city
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function cityToSlug(city: string): string {
  return toSlug(city);
}

export function citySlugToName(slug: string): string {
  return normalizeCity(slug.replace(/-/g, " "));
}
