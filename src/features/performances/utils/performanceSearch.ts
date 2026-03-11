import { Performance } from '../types/performance';

export function matchesPerformanceSearch(performance: Performance, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return true;

  return (
    performance.artist.toLowerCase().includes(normalized) ||
    performance.venue.toLowerCase().includes(normalized) ||
    performance.city.toLowerCase().includes(normalized) ||
    performance.genre.toLowerCase().includes(normalized) ||
    performance.subGenre.toLowerCase().includes(normalized) ||
    performance.showId.toLowerCase().includes(normalized) ||
    (performance.showName?.toLowerCase().includes(normalized) ?? false)
  );
}