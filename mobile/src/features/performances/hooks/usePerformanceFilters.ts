import { useMemo, useState } from 'react';

import { Performance } from '../types/performance';

import {
  groupPerformancesByArtist,
  groupPerformancesByShowId,
} from '../utils/grouping';

import { matchesPerformanceSearch } from '../utils/performanceSearch';
import { sortPerformances, SortMode } from '../utils/performanceSort';

import {
  matchesArtistGroupSearch,
  matchesConcertGroupSearch,
} from '../utils/groupSearch';

import {
  ArtistGroupSortMode,
  ConcertGroupSortMode,
  sortArtistGroups,
  sortConcertGroups,
} from '../utils/groupSort';

export function usePerformanceFilters(performances: Performance[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const [concertSearchQuery, setConcertSearchQuery] = useState('');
  const [concertSortMode, setConcertSortMode] =
    useState<ConcertGroupSortMode>('newest');

  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [artistSortMode, setArtistSortMode] =
    useState<ArtistGroupSortMode>('artist');

  const filteredPerformances = useMemo(() => {
    const filtered = performances.filter((performance) =>
      matchesPerformanceSearch(performance, searchQuery)
    );

    return sortPerformances(filtered, sortMode);
  }, [performances, searchQuery, sortMode]);

  const concertGroups = useMemo(
    () => groupPerformancesByShowId(performances),
    [performances]
  );

  const filteredConcertGroups = useMemo(() => {
    const filtered = concertGroups.filter((group) =>
      matchesConcertGroupSearch(group, concertSearchQuery)
    );

    return sortConcertGroups(filtered, concertSortMode);
  }, [concertGroups, concertSearchQuery, concertSortMode]);

  const artistGroups = useMemo(
    () => groupPerformancesByArtist(performances),
    [performances]
  );

  const filteredArtistGroups = useMemo(() => {
    const filtered = artistGroups.filter((group) =>
      matchesArtistGroupSearch(group, artistSearchQuery)
    );

    return sortArtistGroups(filtered, artistSortMode);
  }, [artistGroups, artistSearchQuery, artistSortMode]);

  return {
    filteredPerformances,

    concertGroups,
    filteredConcertGroups,

    artistGroups,
    filteredArtistGroups,

    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,

    concertSearchQuery,
    setConcertSearchQuery,
    concertSortMode,
    setConcertSortMode,

    artistSearchQuery,
    setArtistSearchQuery,
    artistSortMode,
    setArtistSortMode,
  };
}