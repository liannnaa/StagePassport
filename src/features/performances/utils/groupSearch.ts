import {
  ArtistGroup,
  ConcertGroup,
} from '../types/performance';

export function matchesArtistGroupSearch(
  group: ArtistGroup,
  query: string
): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return true;

  return (
    group.artistName.toLowerCase().includes(normalized) ||
    (group.genre?.toLowerCase().includes(normalized) ?? false) ||
    (group.subGenre?.toLowerCase().includes(normalized) ?? false)
  );
}

export function matchesConcertGroupSearch(
  group: ConcertGroup,
  query: string
): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return true;

  return (
    group.showName.toLowerCase().includes(normalized) ||
    group.venue.toLowerCase().includes(normalized) ||
    group.city.toLowerCase().includes(normalized) ||
    group.performances.some((performance) =>
      performance.artist.toLowerCase().includes(normalized)
    )
  );
}