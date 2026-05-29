import { ArtistGroup, ConcertGroup } from '../types/performance';
import { compareStoredDatesAsc, compareStoredDatesDesc } from './dates';

export type ConcertGroupSortMode = 'newest' | 'oldest' | 'showName';
export type ArtistGroupSortMode = 'artist' | 'mostPerformances' | 'latest';

export function sortConcertGroups(
  groups: ConcertGroup[],
  sortMode: ConcertGroupSortMode
): ConcertGroup[] {
  const next = [...groups];

  next.sort((a, b) => {
    if (sortMode === 'newest') return compareStoredDatesDesc(a.date, b.date);
    if (sortMode === 'oldest') return compareStoredDatesAsc(a.date, b.date);

    const aName = a.showName?.trim() || a.showId;
    const bName = b.showName?.trim() || b.showId;

    return aName.localeCompare(bName);
  });

  return next;
}

export function sortArtistGroups(
  groups: ArtistGroup[],
  sortMode: ArtistGroupSortMode
): ArtistGroup[] {
  const next = [...groups];

  next.sort((a, b) => {
    if (sortMode === 'mostPerformances') {
      return b.performanceCount - a.performanceCount;
    }

    if (sortMode === 'latest') {
      const aDate = a.latestDate ?? '01-01-00';
      const bDate = b.latestDate ?? '01-01-00';
      return compareStoredDatesDesc(aDate, bDate);
    }

    return a.artistName.localeCompare(b.artistName);
  });

  return next;
}