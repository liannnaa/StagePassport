import { Performance } from '../types/performance';
import { compareStoredDatesAsc, compareStoredDatesDesc } from './dates';

export type SortMode = 'newest' | 'oldest' | 'artist';

export function sortPerformances(performances: Performance[], sortMode: SortMode): Performance[] {
    const next = [...performances];

    next.sort((a, b) => {
        if (sortMode === 'newest') return compareStoredDatesDesc(a.date, b.date);
        if (sortMode === 'oldest') return compareStoredDatesAsc(a.date, b.date);
        return a.artist.localeCompare(b.artist);
    });

    return next;
}