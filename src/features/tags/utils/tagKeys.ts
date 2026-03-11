export function normalizeTagText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildTagKey(name: string): string {
  return normalizeTagText(name);
}