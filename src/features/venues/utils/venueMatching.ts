import { Performance } from '../../performances/types/performance';

export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ');
}

export function buildVenueKey(venueName: string, city: string): string {
  return `${normalizeText(venueName)}|${normalizeText(city)}`;
}

export function findMatchingPerformanceByShowId(
  performances: Performance[],
  currentPerformanceId: string | undefined,
  showId: string
): Performance | undefined {
  const normalizedShowId = normalizeText(showId);
  if (!normalizedShowId) return undefined;

  return performances.find((performance) => {
    if (currentPerformanceId && performance.id === currentPerformanceId) {
      return false;
    }

    return normalizeText(performance.showId) === normalizedShowId;
  });
}