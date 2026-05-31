import { useCallback, useRef } from 'react';

import { Performance } from '../types/performance';
import {
  ArtistGenreDefault,
  ArtistPayload,
  ConcertPayload,
  PerformancePayload,
} from '../types/performanceContextTypes';

import { buildShowId } from '../utils/showId';

import {
  normalizeArtistPerformanceRows,
  normalizeConcertArtistRows,
  normalizeConcertSharedPayload,
  toPerformanceWithShowId,
} from '../services/performancePayloadService';

import { syncCatalogOptions as syncCatalogOptionsService } from '../services/catalogSyncService';
import {
  createPerformanceFromApi,
  createPerformancesBatchFromApi,
  updatePerformanceFromApi,
  deletePerformanceFromApi,
  updatePerformancesBatchFromApi,
  deletePerformancesBatchFromApi,
} from '../../../api/stagePassportApi';
import { TagOption } from '../../tags/types/tag';
import { BillingOption } from '../../billings/types/billing';
import { GenreOption, SubGenreOption } from '../../genres/types/genre';
import { VenueOption } from '../../venues/types/venue';

type AuthUser = {
  uid: string;
} | null | undefined;

type UsePerformanceActionsParams = {
  user: AuthUser;
  performances: Performance[];
  getArtistGenreDefault: (artistName: string) => ArtistGenreDefault | undefined;
  addPerformanceToState: (performance: Performance) => void;
  addPerformancesToState: (performances: Performance[]) => void;
  updatePerformanceInState: (performanceId: string, updatedPerformance: Performance) => void;
  deletePerformanceFromState: (performanceId: string) => void;
  updatePerformancesInState: (performances: Performance[]) => void;
  deletePerformancesFromState: (performanceIds: string[]) => void;
  setCatalogState: (catalog: {
    venues: VenueOption[];
    genres: GenreOption[];
    subGenres: SubGenreOption[];
    billings: BillingOption[];
    tags: TagOption[];
  }) => void;
};

function buildPerformanceKey(row: {
  artist?: string;
  showName?: string;
  venue?: string;
  city?: string;
  date?: string;
  billing?: string;
  tags?: string[];
  genre?: string;
  subGenre?: string;
}) {
  return [
    row.artist?.trim().toLowerCase() ?? '',
    row.showName?.trim().toLowerCase() ?? '',
    row.venue?.trim().toLowerCase() ?? '',
    row.city?.trim().toLowerCase() ?? '',
    row.date?.trim() ?? '',
    row.billing?.trim().toLowerCase() ?? '',
    [...(row.tags ?? [])].sort().join('|').toLowerCase(),
    row.genre?.trim().toLowerCase() ?? '',
    row.subGenre?.trim().toLowerCase() ?? '',
  ].join('::');
}

function uniqueByKey<T>(rows: T[], getKey: (row: T) => string): T[] {
  const seen = new Set<string>();

  return rows.filter((row) => {
    const key = getKey(row);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function withArtistGenreDefault<T extends { artist: string; genre: string; subGenre: string }>(
  row: T,
  getArtistGenreDefault: (artistName: string) => ArtistGenreDefault | undefined
): T {
  const defaultGenre = getArtistGenreDefault(row.artist);

  if (!defaultGenre) {
    return row;
  }

  return {
    ...row,
    genre: row.genre.trim() || defaultGenre.genre,
    subGenre: row.subGenre.trim() || defaultGenre.subGenre,
  };
}

export function usePerformanceActions({
  user,
  performances,
  getArtistGenreDefault,
  addPerformanceToState,
  addPerformancesToState,
  updatePerformanceInState,
  deletePerformanceFromState,
  updatePerformancesInState,
  deletePerformancesFromState,
  setCatalogState,
}: UsePerformanceActionsParams) {
  const isSavingConcertRef = useRef(false);
  const isSavingArtistRef = useRef(false);

  const addPerformance = useCallback(
    async (payload: PerformancePayload) => {
      if (!user) {
        throw new Error('You must be logged in to add a performance.');
      }

      const performance = toPerformanceWithShowId(payload);
      const createdPerformance = await createPerformanceFromApi(payload);
      addPerformanceToState(createdPerformance);

      const catalog = await syncCatalogOptionsService(user.uid, [
        {
          venue: performance.venue,
          city: performance.city,
          genre: performance.genre,
          subGenre: performance.subGenre,
          billing: performance.billing,
          tags: performance.tags,
        },
      ]);
      setCatalogState(catalog);
      return createdPerformance.id;
    },
    [user, addPerformanceToState]
  );

  const updatePerformance = useCallback(
    async (performanceId: string, payload: PerformancePayload) => {
      if (!user) {
        throw new Error('You must be logged in to update a performance.');
      }

      const updatedPerformance = toPerformanceWithShowId(payload);
      await updatePerformanceFromApi(performanceId, payload);

      updatePerformanceInState(performanceId, {
        id: performanceId,
        ...updatedPerformance,
      });

      const catalog = await syncCatalogOptionsService(user.uid, [
        {
          venue: updatedPerformance.venue,
          city: updatedPerformance.city,
          genre: updatedPerformance.genre,
          subGenre: updatedPerformance.subGenre,
          billing: updatedPerformance.billing,
          tags: updatedPerformance.tags,
        },
      ]);
      setCatalogState(catalog);
    },
    [user, updatePerformanceInState]
  );

  const deletePerformance = useCallback(
    async (performanceId: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete a performance.');
      }

      await deletePerformanceFromApi(performanceId);
      deletePerformanceFromState(performanceId);
    },
    [user, deletePerformanceFromState]
  );

  const deleteConcertPerformances = useCallback(
    async (showId: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete a concert.');
      }

      const rowsToDelete = performances.filter(
        (performance) => performance.showId === showId
      );

      if (rowsToDelete.length === 0) {
        throw new Error('Concert not found.');
      }

      const idsToDelete = rowsToDelete.map((row) => row.id);
      await deletePerformancesBatchFromApi(idsToDelete);
      deletePerformancesFromState(idsToDelete);
    },
    [performances, user]
  );

  const deleteArtistPerformances = useCallback(
    async (artistName: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete an artist.');
      }

      const normalizedArtistName = artistName.trim().toLowerCase();

      const rowsToDelete = performances.filter(
        (performance) =>
          performance.artist.trim().toLowerCase() === normalizedArtistName
      );

      if (rowsToDelete.length === 0) {
        throw new Error('Artist not found.');
      }

      const idsToDelete = rowsToDelete.map((row) => row.id);
      await deletePerformancesBatchFromApi(idsToDelete);
      deletePerformancesFromState(idsToDelete);
    },
    [performances, user]
  );

  const getPerformanceById = useCallback(
    (performanceId: string) =>
      performances.find((performance) => performance.id === performanceId),
    [performances]
  );

  const getPerformancesByShowId = useCallback(
    (showId: string) =>
      performances.filter((performance) => performance.showId === showId),
    [performances]
  );

  const getPerformancesByArtistName = useCallback(
    (artistName: string) => {
      const normalizedArtistName = artistName.trim().toLowerCase();

      return performances.filter(
        (performance) =>
          performance.artist.trim().toLowerCase() === normalizedArtistName
      );
    },
    [performances]
  );

  const addConcertPerformances = useCallback(
    async ({ shared, artists }: ConcertPayload) => {
      if (!user) {
        throw new Error('You must be logged in to add a concert.');
      }

      if (isSavingConcertRef.current) {
        throw new Error('A concert save is already in progress.');
      }

      const normalizedShared = normalizeConcertSharedPayload(shared);

      if (!normalizedShared.showName) {
        throw new Error('Show name is required.');
      }

      if (!normalizedShared.date) {
        throw new Error('Date is required.');
      }

      const normalizedRows = normalizeConcertArtistRows(artists).map((row) =>
        withArtistGenreDefault(row, getArtistGenreDefault)
      );

      if (normalizedRows.length === 0) {
        throw new Error('Add at least one artist.');
      }

      const uniqueRows = uniqueByKey(normalizedRows, (row) =>
        buildPerformanceKey({
          artist: row.artist,
          billing: row.billing,
          tags: row.tags,
          genre: row.genre,
          subGenre: row.subGenre,
        })
      );

      const existingRowsForConcert = performances.filter(
        (performance) =>
          performance.showName.trim().toLowerCase() ===
            normalizedShared.showName.toLowerCase() &&
          performance.date.trim() === normalizedShared.date
      );

      const existingKeys = new Set(
        existingRowsForConcert.map((performance) =>
          buildPerformanceKey({
            artist: performance.artist,
            billing: performance.billing,
            tags: performance.tags,
            genre: performance.genre,
            subGenre: performance.subGenre,
          })
        )
      );

      const rowsToInsert = uniqueRows.filter(
        (row) =>
          !existingKeys.has(
            buildPerformanceKey({
              artist: row.artist,
              billing: row.billing,
              tags: row.tags,
              genre: row.genre,
              subGenre: row.subGenre,
            })
          )
      );

      if (rowsToInsert.length === 0) {
        throw new Error('These artists are already saved for this concert.');
      }

      const showId = buildShowId(
        normalizedShared.showName,
        normalizedShared.date
      );

      const performanceRows = rowsToInsert.map((row) => ({
        artist: row.artist,
        venue: normalizedShared.venue,
        city: normalizedShared.city,
        date: normalizedShared.date,
        billing: row.billing,
        tags: row.tags,
        genre: row.genre,
        subGenre: row.subGenre,
        showName: normalizedShared.showName,
        showId,
      }));

      isSavingConcertRef.current = true;

      try {
        const createdPerformances = await createPerformancesBatchFromApi(performanceRows);
        addPerformancesToState(createdPerformances);

        const catalog = await syncCatalogOptionsService(
          user.uid,
          performanceRows.map((row) => ({
            venue: row.venue,
            city: row.city,
            genre: row.genre,
            subGenre: row.subGenre,
            billing: row.billing,
            tags: row.tags,
          }))
        );
        setCatalogState(catalog);
      } finally {
        isSavingConcertRef.current = false;
      }
    },
    [performances, getArtistGenreDefault, user]
  );

  const updateConcertPerformances = useCallback(
    async (showId: string, { shared, artists }: ConcertPayload) => {
      if (!user) {
        throw new Error('You must be logged in to edit a concert.');
      }

      if (isSavingConcertRef.current) {
        throw new Error('A concert save is already in progress.');
      }

      const normalizedShared = normalizeConcertSharedPayload(shared);

      if (!normalizedShared.showName) {
        throw new Error('Show name is required.');
      }

      if (!normalizedShared.date) {
        throw new Error('Date is required.');
      }

      const existingConcertRows = performances.filter(
        (performance) => performance.showId === showId
      );

      if (existingConcertRows.length === 0) {
        throw new Error('Concert not found.');
      }

      const normalizedRows = normalizeConcertArtistRows(artists).map((row) =>
        withArtistGenreDefault(row, getArtistGenreDefault)
      );

      if (normalizedRows.length === 0) {
        throw new Error('Add at least one artist.');
      }

      const nextShowId = buildShowId(
        normalizedShared.showName,
        normalizedShared.date
      );

      const existingIds = new Set(existingConcertRows.map((row) => row.id));

      const incomingIds = new Set(
        normalizedRows
          .map((row) => row.performanceId)
          .filter((id): id is string => Boolean(id))
      );

      const rowsToDelete = existingConcertRows.filter(
        (row) => !incomingIds.has(row.id)
      );

      const rowsToUpdate = normalizedRows.filter(
        (row): row is typeof row & { performanceId: string } =>
          Boolean(row.performanceId) &&
          existingIds.has(row.performanceId as string)
      );

      const rowsToInsert = normalizedRows.filter((row) => !row.performanceId);

      const updatePayloads = rowsToUpdate.map((row) => ({
        id: row.performanceId,
        performance: {
          artist: row.artist,
          venue: normalizedShared.venue,
          city: normalizedShared.city,
          date: normalizedShared.date,
          billing: row.billing,
          tags: row.tags,
          genre: row.genre,
          subGenre: row.subGenre,
          showName: normalizedShared.showName,
          showId: nextShowId,
        },
      }));

      const insertPayloads = rowsToInsert.map((row) => ({
        artist: row.artist,
        venue: normalizedShared.venue,
        city: normalizedShared.city,
        date: normalizedShared.date,
        billing: row.billing,
        tags: row.tags,
        genre: row.genre,
        subGenre: row.subGenre,
        showName: normalizedShared.showName,
        showId: nextShowId,
      }));

      isSavingConcertRef.current = true;

      try {
        const idsToDelete = rowsToDelete.map((row) => row.id);
        const [updatedPerformances, createdPerformances] = await Promise.all([
          updatePerformancesBatchFromApi(updatePayloads),
          createPerformancesBatchFromApi(insertPayloads),
        ]);

        if (idsToDelete.length > 0) {
          await deletePerformancesBatchFromApi(idsToDelete);
        }

        deletePerformancesFromState(idsToDelete);
        updatePerformancesInState(updatedPerformances);
        addPerformancesToState(createdPerformances);

        const catalog = await syncCatalogOptionsService(user.uid, [
          ...updatePayloads.map((item) => ({
            venue: item.performance.venue,
            city: item.performance.city,
            genre: item.performance.genre,
            subGenre: item.performance.subGenre,
            billing: item.performance.billing,
            tags: item.performance.tags,
          })),
          ...insertPayloads.map((row) => ({
            venue: row.venue,
            city: row.city,
            genre: row.genre,
            subGenre: row.subGenre,
            billing: row.billing,
            tags: row.tags,
          })),
        ]);
        setCatalogState(catalog);
      } finally {
        isSavingConcertRef.current = false;
      }
    },
    [performances, getArtistGenreDefault, user, addPerformancesToState]
  );

  const addArtistPerformances = useCallback(
    async ({ shared, performances: rows }: ArtistPayload) => {
      if (!user) {
        throw new Error('You must be logged in to add an artist.');
      }

      if (isSavingArtistRef.current) {
        throw new Error('An artist save is already in progress.');
      }

      const artist = shared.artist.trim();

      if (!artist) {
        throw new Error('Artist is required.');
      }

      const validRows = normalizeArtistPerformanceRows(rows);

      if (validRows.length === 0) {
        throw new Error('Add at least one performance.');
      }

      const uniqueRows = uniqueByKey(validRows, (row) =>
        buildPerformanceKey({
          showName: row.showName,
          venue: row.venue,
          city: row.city,
          date: row.date,
          billing: row.billing,
          tags: row.tags,
          genre: row.genre,
          subGenre: row.subGenre,
        })
      );

      const performanceRows = uniqueRows.map((row) => ({
        artist,
        showName: row.showName,
        venue: row.venue,
        city: row.city,
        date: row.date,
        billing: row.billing,
        tags: row.tags,
        genre: row.genre,
        subGenre: row.subGenre,
        showId: buildShowId(row.showName, row.date),
      }));

      isSavingArtistRef.current = true;

      try {
        const createdPerformances = await createPerformancesBatchFromApi(performanceRows);
        addPerformancesToState(createdPerformances);

        const catalog = await syncCatalogOptionsService(
          user.uid,
          performanceRows.map((row) => ({
            venue: row.venue,
            city: row.city,
            genre: row.genre,
            subGenre: row.subGenre,
            billing: row.billing,
            tags: row.tags,
          }))
        );
        setCatalogState(catalog);
      } finally {
        isSavingArtistRef.current = false;
      }
    },
    [user, addPerformancesToState]
  );

  const updateArtistPerformances = useCallback(
    async (artistName: string, { shared, performances: rows }: ArtistPayload) => {
      if (!user) {
        throw new Error('You must be logged in to edit an artist.');
      }

      if (isSavingArtistRef.current) {
        throw new Error('An artist save is already in progress.');
      }

      const nextArtistName = shared.artist.trim();

      if (!nextArtistName) {
        throw new Error('Artist is required.');
      }

      const existingArtistRows = performances.filter(
        (performance) =>
          performance.artist.trim().toLowerCase() ===
          artistName.trim().toLowerCase()
      );

      if (existingArtistRows.length === 0) {
        throw new Error('Artist not found.');
      }

      const validRows = normalizeArtistPerformanceRows(rows);

      if (validRows.length === 0) {
        throw new Error('Add at least one performance.');
      }

      const existingIds = new Set(existingArtistRows.map((row) => row.id));

      const incomingIds = new Set(
        validRows
          .map((row) => row.performanceId)
          .filter((id): id is string => Boolean(id))
      );

      const rowsToDelete = existingArtistRows.filter(
        (row) => !incomingIds.has(row.id)
      );

      const rowsToUpdate = validRows.filter(
        (row): row is typeof row & { performanceId: string } =>
          Boolean(row.performanceId) &&
          existingIds.has(row.performanceId as string)
      );

      const rowsToInsert = validRows.filter((row) => !row.performanceId);

      const updatePayloads = rowsToUpdate.map((row) => ({
        id: row.performanceId,
        performance: {
          artist: nextArtistName,
          showName: row.showName,
          venue: row.venue,
          city: row.city,
          date: row.date,
          billing: row.billing,
          tags: row.tags,
          genre: row.genre,
          subGenre: row.subGenre,
          showId: buildShowId(row.showName, row.date),
        },
      }));

      const insertPayloads = rowsToInsert.map((row) => ({
        artist: nextArtistName,
        showName: row.showName,
        venue: row.venue,
        city: row.city,
        date: row.date,
        billing: row.billing,
        tags: row.tags,
        genre: row.genre,
        subGenre: row.subGenre,
        showId: buildShowId(row.showName, row.date),
      }));

      isSavingArtistRef.current = true;

      try {
        const idsToDelete = rowsToDelete.map((row) => row.id);
        const [updatedPerformances, createdPerformances] = await Promise.all([
          updatePerformancesBatchFromApi(updatePayloads),
          createPerformancesBatchFromApi(insertPayloads),
        ]);

        if (idsToDelete.length > 0) {
          await deletePerformancesBatchFromApi(idsToDelete);
        }

        deletePerformancesFromState(idsToDelete);
        updatePerformancesInState(updatedPerformances);
        addPerformancesToState(createdPerformances);

        const catalog = await syncCatalogOptionsService(user.uid, [
          ...updatePayloads.map((item) => ({
            venue: item.performance.venue,
            city: item.performance.city,
            genre: item.performance.genre,
            subGenre: item.performance.subGenre,
            billing: item.performance.billing,
            tags: item.performance.tags,
          })),
          ...insertPayloads.map((row) => ({
            venue: row.venue,
            city: row.city,
            genre: row.genre,
            subGenre: row.subGenre,
            billing: row.billing,
            tags: row.tags,
          })),
        ]);
        setCatalogState(catalog);
      } finally {
        isSavingArtistRef.current = false;
      }
    },
    [performances, user]
  );

  return {
    addPerformance,
    updatePerformance,
    deletePerformance,

    deleteConcertPerformances,
    deleteArtistPerformances,
    getPerformanceById,

    addConcertPerformances,
    updateConcertPerformances,
    getPerformancesByShowId,

    addArtistPerformances,
    updateArtistPerformances,
    getPerformancesByArtistName,
  };
}