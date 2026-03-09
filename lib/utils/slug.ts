const MULTI_HYPHEN_RE = /-+/g;
const NON_WORD_RE = /[^a-z0-9]+/g;

export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(NON_WORD_RE, "-")
    .replace(MULTI_HYPHEN_RE, "-")
    .replace(/^-|-$/g, "");
}
