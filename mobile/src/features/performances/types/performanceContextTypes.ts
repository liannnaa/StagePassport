import React from 'react';

import {
  Performance,
  ArtistGroup,
  ConcertGroup,
} from './performance';

import { SortMode } from '../utils/performanceSort';
import {
  ArtistGroupSortMode,
  ConcertGroupSortMode,
} from '../utils/groupSort';

import { VenueOption } from '../../venues/types/venue';
import { GenreOption, SubGenreOption } from '../../genres/types/genre';
import { BillingOption } from '../../billings/types/billing';

import { TagOption } from '../../tags/types/tag';

export type PerformancePayload = Omit<Performance, 'id' | 'showId'>;

export type ConcertSharedPayload = {
  showName: string;
  venue: string;
  city: string;
  date: string;
};

export type ConcertArtistPayload = {
  performanceId?: string;
  artist: string;
  billing: string;
  tags: string[];
  genre: string;
  subGenre: string;
};

export type ConcertPayload = {
  shared: ConcertSharedPayload;
  artists: ConcertArtistPayload[];
};

export type ArtistSharedPayload = {
  artist: string;
};

export type ArtistPerformancePayload = {
  performanceId?: string;
  showName: string;
  venue: string;
  city: string;
  date: string;
  billing: string;
  tags: string[];
  genre: string;
  subGenre: string;
};

export type ArtistPayload = {
  shared: ArtistSharedPayload;
  performances: ArtistPerformancePayload[];
};

export type ArtistGenreDefault = {
  genre: string;
  subGenre: string;
};

export type CatalogType = 'billing' | 'tag' | 'venue' | 'genre' | 'subGenre';

export type CatalogReplacement = {
  billing?: string;
  tag?: string;
  venue?: string;
  city?: string;
  genre?: string;
  subGenre?: string;
  genreId?: string;
};

export type CatalogUsageExtra = {
  genreId?: string;
  usageCount?: number;
  usageCountLabel?: string;
};

export type CatalogSyncRow = {
  venue: string;
  city: string;
  genre: string;
  subGenre: string;
  billing: string;
  tags: string[];
};

export type PerformancesContextValue = {
  performances: Performance[];
  filteredPerformances: Performance[];

  concertGroups: ConcertGroup[];
  filteredConcertGroups: ConcertGroup[];

  artistGroups: ArtistGroup[];
  filteredArtistGroups: ArtistGroup[];

  venueOptions: VenueOption[];
  genreOptions: GenreOption[];
  subGenreOptions: SubGenreOption[];
  billingOptions: BillingOption[];
  tagOptions: TagOption[];

  isLoading: boolean;

  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sortMode: SortMode;
  setSortMode: React.Dispatch<React.SetStateAction<SortMode>>;

  concertSearchQuery: string;
  setConcertSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  concertSortMode: ConcertGroupSortMode;
  setConcertSortMode: React.Dispatch<React.SetStateAction<ConcertGroupSortMode>>;

  artistSearchQuery: string;
  setArtistSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  artistSortMode: ArtistGroupSortMode;
  setArtistSortMode: React.Dispatch<React.SetStateAction<ArtistGroupSortMode>>;

  refresh: () => Promise<void>;

  addPerformance: (payload: PerformancePayload) => Promise<string>;
  updatePerformance: (
    performanceId: string,
    payload: PerformancePayload
  ) => Promise<void>;
  deletePerformance: (performanceId: string) => Promise<void>;
  deleteConcertPerformances: (showId: string) => Promise<void>;
  deleteArtistPerformances: (artistName: string) => Promise<void>;
  getPerformanceById: (performanceId: string) => Performance | undefined;

  addConcertPerformances: (payload: ConcertPayload) => Promise<void>;
  updateConcertPerformances: (
    showId: string,
    payload: ConcertPayload
  ) => Promise<void>;
  getPerformancesByShowId: (showId: string) => Performance[];

  addArtistPerformances: (payload: ArtistPayload) => Promise<void>;
  updateArtistPerformances: (
    artistName: string,
    payload: ArtistPayload
  ) => Promise<void>;
  getPerformancesByArtistName: (artistName: string) => Performance[];

  addVenueOption: (venueName: string, city: string) => Promise<VenueOption>;
  deleteVenueOption: (id: string) => Promise<void>;
  isVenueOptionInUse: (id: string) => boolean;

  addGenreOption: (name: string) => Promise<GenreOption>;
  deleteGenreOption: (id: string) => Promise<void>;
  isGenreOptionInUse: (id: string) => boolean;

  getSubGenreOptionsByGenreId: (genreId: string) => SubGenreOption[];
  getAllSubGenreOptions: () => SubGenreOption[];
  addSubGenreOption: (
    genreId: string,
    genreName: string,
    name: string
  ) => Promise<SubGenreOption>;
  deleteSubGenreOption: (id: string) => Promise<void>;
  isSubGenreOptionInUse: (id: string) => boolean;
  getGenreById: (genreId: string) => GenreOption | undefined;

  addBillingOption: (name: string) => Promise<BillingOption>;
  deleteBillingOption: (id: string) => Promise<void>;
  isBillingOptionInUse: (id: string) => boolean;

  addTagOption: (name: string) => Promise<TagOption>;
  deleteTagOption: (id: string) => Promise<void>;
  isTagOptionInUse: (id: string) => boolean;

  syncGenresForArtist: (
    artistName: string,
    genre: string,
    subGenre: string
  ) => Promise<void>;

  getArtistGenreDefault: (artistName: string) => ArtistGenreDefault | undefined;

  getCatalogUsage: (
    type: CatalogType,
    id: string,
    extra?: CatalogUsageExtra
  ) => Performance[];

  removeCatalogValueFromPerformance: (
    performanceId: string,
    type: CatalogType,
    catalogId?: string
  ) => Promise<void>;

  replaceCatalogValue: (
    type: CatalogType,
    oldId: string,
    replacement: CatalogReplacement
  ) => Promise<void>;
};