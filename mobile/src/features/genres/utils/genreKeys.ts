export function normalizeGenreText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildGenreKey(name: string): string {
  return normalizeGenreText(name);
}

export function buildSubGenreKey(genreName: string, subGenreName: string): string {
  return `${normalizeGenreText(genreName)}|${normalizeGenreText(subGenreName)}`;
}