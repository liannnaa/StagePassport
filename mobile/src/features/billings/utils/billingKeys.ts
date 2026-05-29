export function normalizeBillingText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildBillingKey(name: string): string {
  return normalizeBillingText(name);
}