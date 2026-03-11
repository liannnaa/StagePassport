import { Performance, ConcertGroup, ArtistGroup } from '../types/performance';
import { compareStoredDatesDesc } from './dates';

export function groupPerformancesByShowId(performances: Performance[]): ConcertGroup[] {
  const groups = new Map<string, Performance[]>();

  for (const performance of performances) {
    const existing = groups.get(performance.showId) ?? [];
    existing.push(performance);
    groups.set(performance.showId, existing);
  }

  return Array.from(groups.entries())
    .map(([showId, items]) => {
      const sortedItems = [...items].sort((a, b) => compareStoredDatesDesc(a.date, b.date));
      const first = sortedItems[0];
      const uniqueArtists = new Set(items.map((item) => item.artist));

      return {
        showId,
        showName: first.showName,
        date: first.date,
        venue: first.venue,
        city: first.city,
        performances: sortedItems,
        artistCount: uniqueArtists.size,
      };
    })
    .sort((a, b) => compareStoredDatesDesc(a.date, b.date));
}

export function groupPerformancesByArtist(
  performances: Performance[]
): ArtistGroup[] {
  const groups = new Map<string, Performance[]>();

  for (const performance of performances) {
    const key = performance.artist;
    const existing = groups.get(key) ?? [];
    existing.push(performance);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([artistName, items]) => {
    const sortedByLatest = [...items].sort((a, b) =>
      compareStoredDatesDesc(a.date, b.date)
    );

    const latest = sortedByLatest[0];
    const first = items[0];

    return {
      artistName,
      performances: items,
      performanceCount: items.length,
      latestDate: latest?.date,
      genre: first?.genre || undefined,
      subGenre: first?.subGenre || undefined,
    };
  });
}