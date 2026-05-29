import { Performance } from '../../performances/types/performance';

function normalizeArtistName(value: string): string {
  return value.trim().toLowerCase();
}

export function findMatchingPerformanceByArtist(
  performances: Performance[],
  currentPerformanceId: string | undefined,
  artistName: string
): Performance | undefined {
  const normalizedArtist = normalizeArtistName(artistName);
  if (!normalizedArtist) return undefined;

  return performances.find((performance) => {
    if (currentPerformanceId && performance.id === currentPerformanceId) {
      return false;
    }

    return normalizeArtistName(performance.artist) === normalizedArtist;
  });
}