import { Performance } from '../types/performance';
import { ArtistGenreDefault } from '../types/performanceContextTypes';

function normalizeArtistName(value: string): string {
  return value.trim().toLowerCase();
}

export function getArtistGenreDefaultFromPerformances(
  performances: Performance[],
  artistName: string
): ArtistGenreDefault | undefined {
  const artistKey = normalizeArtistName(artistName);

  if (!artistKey) {
    return undefined;
  }

  const matchingPerformance = performances.find(
    (performance) =>
      normalizeArtistName(performance.artist) === artistKey &&
      performance.genre.trim()
  );

  if (!matchingPerformance) {
    return undefined;
  }

  return {
    genre: matchingPerformance.genre,
    subGenre: matchingPerformance.subGenre,
  };
}