import { Performance } from '../types/performance';
import {
  ArtistPerformancePayload,
  CatalogSyncRow,
  ConcertArtistPayload,
  ConcertSharedPayload,
  PerformancePayload,
} from '../types/performanceContextTypes';
import { buildShowId } from '../utils/showId';

export function toPerformanceWithShowId(
  payload: PerformancePayload
): Omit<Performance, 'id'> {
  return {
    ...payload,
    showId: buildShowId(payload.showName, payload.date),
  };
}

export function normalizeConcertSharedPayload(shared: ConcertSharedPayload) {
  return {
    showName: shared.showName.trim(),
    venue: shared.venue.trim(),
    city: shared.city.trim(),
    date: shared.date.trim(),
  };
}

export function normalizeConcertArtistRows(rows: ConcertArtistPayload[]) {
  return rows
    .map((row) => ({
      performanceId: row.performanceId,
      artist: row.artist.trim(),
      billing: row.billing.trim(),
      tags: row.tags.map((tag) => tag.trim()).filter(Boolean),
      genre: row.genre.trim(),
      subGenre: row.subGenre.trim(),
    }))
    .filter((row) => row.artist.length > 0);
}

export function normalizeArtistPerformanceRows(
  rows: ArtistPerformancePayload[]
) {
  return rows
    .map((row) => ({
      performanceId: row.performanceId,
      showName: row.showName.trim(),
      venue: row.venue.trim(),
      city: row.city.trim(),
      date: row.date.trim(),
      billing: row.billing.trim(),
      tags: row.tags.map((tag) => tag.trim()).filter(Boolean),
      genre: row.genre.trim(),
      subGenre: row.subGenre.trim(),
    }))
    .filter((row) => row.showName.length > 0);
}

export function toCatalogRowsFromPerformances(
  rows: Array<
    Pick<
      Performance,
      'venue' | 'city' | 'genre' | 'subGenre' | 'billing' | 'tags'
    >
  >
): CatalogSyncRow[] {
  return rows.map((row) => ({
    venue: row.venue,
    city: row.city,
    genre: row.genre,
    subGenre: row.subGenre,
    billing: row.billing,
    tags: row.tags,
  }));
}

export function toCatalogRowsFromConcert(
  rows: Array<Pick<ConcertArtistPayload, 'billing' | 'tags' | 'genre' | 'subGenre'>>,
  shared: Pick<ConcertSharedPayload, 'venue' | 'city'>
): CatalogSyncRow[] {
  return rows.map((row) => ({
    venue: shared.venue,
    city: shared.city,
    genre: row.genre,
    subGenre: row.subGenre,
    billing: row.billing,
    tags: row.tags,
  }));
}