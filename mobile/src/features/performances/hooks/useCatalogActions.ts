import { useCallback, useMemo } from 'react';

import { Performance } from '../types/performance';
import {
  CatalogReplacement,
  CatalogType,
  CatalogUsageExtra,
} from '../types/performanceContextTypes';

import { performancesRepository } from '../repository/performancesRepository';

import {
  buildCatalogUsageCounts,
  getCatalogUsage as getCatalogUsageFromService,
} from '../services/catalogUsageService';

import { syncCatalogOptions as syncCatalogOptionsService } from '../services/catalogSyncService';

import { VenueOption } from '../../venues/types/venue';
import { buildVenueKey } from '../../venues/utils/venueMatching';

import { GenreOption, SubGenreOption } from '../../genres/types/genre';

import { BillingOption } from '../../billings/types/billing';

import { TagOption } from '../../tags/types/tag';
import { buildTagKey } from '../../tags/utils/tagKeys';

import {
  createBillingFromApi,
  createTagFromApi,
  createVenueFromApi,
  createGenreFromApi,
  createSubGenreFromApi,
  getCatalogFromApi,
  deleteBillingFromApi,
  deleteTagFromApi,
  deleteVenueFromApi,
  deleteGenreFromApi,
  deleteSubGenreFromApi,
  replaceCatalogValueFromApi,
  updatePerformanceFromApi
} from '../../../api/stagePassportApi';

type AuthUser = {
  uid: string;
} | null | undefined;

type UseCatalogActionsParams = {
  user: AuthUser;
  performances: Performance[];
  venueOptions: VenueOption[];
  genreOptions: GenreOption[];
  subGenreOptions: SubGenreOption[];
  billingOptions: BillingOption[];
  tagOptions: TagOption[];
  setCatalogState: (catalog: {
    venues: VenueOption[];
    genres: GenreOption[];
    subGenres: SubGenreOption[];
    billings: BillingOption[];
    tags: TagOption[];
  }) => void;
  updatePerformancesInState: (performances: Performance[]) => void;
  updatePerformanceInState: (
    performanceId: string,
    updatedPerformance: Performance
  ) => void;
};

export function useCatalogActions({
  user,
  performances,
  venueOptions,
  genreOptions,
  subGenreOptions,
  billingOptions,
  tagOptions,
  setCatalogState,
  updatePerformancesInState,
  updatePerformanceInState
}: UseCatalogActionsParams) {
  const catalogUsageCounts = useMemo(
    () => buildCatalogUsageCounts(performances),
    [performances]
  );

  const refreshCatalogState = useCallback(async () => {
    const catalog = await getCatalogFromApi();
    setCatalogState(catalog);
  }, [setCatalogState]);

  const addVenueOption = useCallback(
    async (venueName: string, city: string) => {
      if (!user) throw new Error('You must be logged in to add a venue.');

      const added = await createVenueFromApi(venueName, city);
      await refreshCatalogState();

      return added;
    },
    [user, refreshCatalogState]
  );

  const deleteVenueOption = useCallback(
    async (id: string) => {
      if (!user) throw new Error('You must be logged in to delete a venue.');
      await deleteVenueFromApi(id);
      await refreshCatalogState();
    },
    [user, refreshCatalogState]
  );

  const isVenueOptionInUse = useCallback(
    (id: string) => {
      const option = venueOptions.find((item) => item.id === id);
      if (!option) return false;

      const optionKey = buildVenueKey(option.venueName, option.city);
      return (catalogUsageCounts.venueCounts.get(optionKey) ?? 0) > 0;
    },
    [venueOptions, catalogUsageCounts]
  );

  const addGenreOption = useCallback(
    async (name: string) => {
      if (!user) throw new Error('You must be logged in to add a genre.');

      const added = await createGenreFromApi(name);
      await refreshCatalogState();

      return added;
    },
    [user, refreshCatalogState]
  );

  const deleteGenreOption = useCallback(
    async (id: string) => {
      if (!user) throw new Error('You must be logged in to delete a genre.');
      await deleteGenreFromApi(id);
      await refreshCatalogState();
    },
    [user, refreshCatalogState]
  );

  const isGenreOptionInUse = useCallback(
    (id: string) => {
      const option = genreOptions.find((item) => item.id === id);
      if (!option) return false;

      return (catalogUsageCounts.genreCounts.get(option.normalizedName) ?? 0) > 0;
    },
    [genreOptions, catalogUsageCounts]
  );

  const getSubGenreOptionsByGenreId = useCallback(
    (genreId: string) => subGenreOptions.filter((option) => option.genreId === genreId),
    [subGenreOptions]
  );

  const getAllSubGenreOptions = useCallback(() => subGenreOptions, [subGenreOptions]);


  const addSubGenreOption = useCallback(
    async (genreId: string, genreName: string, name: string) => {
      if (!user) throw new Error('You must be logged in to add a sub-genre.');

      const added = await createSubGenreFromApi(genreId, genreName, name);
      await refreshCatalogState();

      return added;
    },
    [user, refreshCatalogState]
  );

  const deleteSubGenreOption = useCallback(
    async (id: string) => {
      if (!user) throw new Error('You must be logged in to delete a sub-genre.');
      await deleteSubGenreFromApi(id);
      await refreshCatalogState();
    },
    [user, refreshCatalogState]
  );

  const isSubGenreOptionInUse = useCallback(
    (id: string) => {
      const subGenre = subGenreOptions.find((item) => item.id === id);
      if (!subGenre) return false;

      const parentGenre = genreOptions.find((genre) => genre.id === subGenre.genreId);
      if (!parentGenre) return false;

      const key = `${parentGenre.normalizedName}::${subGenre.name
        .trim()
        .toLowerCase()}`;

      return (catalogUsageCounts.subGenreCounts.get(key) ?? 0) > 0;
    },
    [subGenreOptions, genreOptions, catalogUsageCounts]
  );

  const getGenreById = useCallback(
    (genreId: string) => genreOptions.find((genre) => genre.id === genreId),
    [genreOptions]
  );

  const addBillingOption = useCallback(
    async (name: string) => {
      if (!user) throw new Error('You must be logged in to add a billing.');

      const added = await createBillingFromApi(name);
      await refreshCatalogState();

      return added;
    },
    [user, refreshCatalogState]
  );

  const deleteBillingOption = useCallback(
    async (id: string) => {
      if (!user) throw new Error('You must be logged in to delete a billing.');

      await deleteBillingFromApi(id);
      await refreshCatalogState();
    },
    [user, refreshCatalogState]
  );

  const isBillingOptionInUse = useCallback(
    (id: string) => {
      const option = billingOptions.find((item) => item.id === id);
      if (!option) return false;

      return (catalogUsageCounts.billingCounts.get(option.normalizedName) ?? 0) > 0;
    },
    [billingOptions, catalogUsageCounts]
  );

  const addTagOption = useCallback(
    async (name: string) => {
      if (!user) throw new Error('You must be logged in to add a tag.');

      const added = await createTagFromApi(name);
      await refreshCatalogState();

      return added;
    },
    [user, refreshCatalogState]
  );

  const deleteTagOption = useCallback(
    async (id: string) => {
      if (!user) throw new Error('You must be logged in to delete a tag.');
      await deleteTagFromApi(id);
      await refreshCatalogState();
    },
    [user, refreshCatalogState]
  );

  function normalizeCatalogValue(value: string) {
    return value.trim().toLowerCase();
  }

  const isTagOptionInUse = useCallback(
    (tagId: string) => {
      const tagOption = tagOptions.find(
        (tag) =>
          tag.id === tagId ||
          tag.normalizedName === tagId ||
          normalizeCatalogValue(tag.name) === normalizeCatalogValue(tagId)
      );

      const normalizedTag =
        tagOption?.normalizedName ?? normalizeCatalogValue(tagId);

      return performances.some((performance) =>
        performance.tags.some(
          (tag) => normalizeCatalogValue(tag) === normalizedTag
        )
      );
    },
    [performances, tagOptions]
  );

  const syncGenresForArtist = useCallback(
    async (artistName: string, genre: string, subGenre: string) => {
      if (!user || !artistName.trim()) return;

      await performancesRepository.updateGenresByArtist(
        user.uid,
        artistName.trim(),
        genre.trim(),
        subGenre.trim()
      );

      const catalog = await syncCatalogOptionsService(user.uid, [
        {
          venue: '',
          city: '',
          genre: genre.trim(),
          subGenre: subGenre.trim(),
          billing: '',
          tags: [],
        },
      ]);
      setCatalogState(catalog);
    },
    [user]
  );

  const getCatalogUsage = useCallback(
    (type: CatalogType, id: string, _extra?: CatalogUsageExtra) => {
      return getCatalogUsageFromService({
        type,
        id,
        performances,
        billingOptions,
        tagOptions,
        venueOptions,
        genreOptions,
        subGenreOptions,
      });
    },
    [
      performances,
      billingOptions,
      tagOptions,
      venueOptions,
      genreOptions,
      subGenreOptions,
    ]
  );

  const removeCatalogValueFromPerformance = useCallback(
    async (performanceId: string, type: CatalogType, catalogId?: string) => {
      if (!user) {
        throw new Error('You must be logged in to update a performance.');
      }

      const performance = performances.find((item) => item.id === performanceId);

      if (!performance) {
        throw new Error('Performance not found.');
      }

      const tagToRemove =
        type === 'tag' && catalogId
          ? tagOptions.find((tag) => tag.id === catalogId)
          : undefined;

      const nextPerformance = {
        ...performance,
        billing: type === 'billing' ? '' : performance.billing,

        tags:
          type === 'tag' && tagToRemove
            ? performance.tags.filter(
                (tag) => buildTagKey(tag) !== tagToRemove.normalizedName
              )
            : performance.tags,

        venue: type === 'venue' ? '' : performance.venue,
        city: type === 'venue' ? '' : performance.city,
        genre: type === 'genre' ? '' : performance.genre,
        subGenre:
          type === 'genre' || type === 'subGenre' ? '' : performance.subGenre,
      };

      await updatePerformanceFromApi(performanceId, {
        artist: nextPerformance.artist,
        venue: nextPerformance.venue,
        city: nextPerformance.city,
        date: nextPerformance.date,
        billing: nextPerformance.billing,
        tags: nextPerformance.tags,
        genre: nextPerformance.genre,
        subGenre: nextPerformance.subGenre,
        showName: nextPerformance.showName,
      });

      updatePerformanceInState(performanceId, nextPerformance);
    },
    [performances, tagOptions, user, updatePerformanceInState]
  );

  const replaceCatalogValue = useCallback(
    async (
      type: CatalogType,
      oldId: string,
      replacement: CatalogReplacement
    ) => {
      if (!user) {
        throw new Error('You must be logged in to update catalog usage.');
      }

      const result = await replaceCatalogValueFromApi(type, oldId, replacement);

      updatePerformancesInState(result.performances);
      setCatalogState(result.catalog);
    },
    [user, updatePerformancesInState, setCatalogState]
  );

  return {
    addVenueOption,
    deleteVenueOption,
    isVenueOptionInUse,

    addGenreOption,
    deleteGenreOption,
    isGenreOptionInUse,

    getSubGenreOptionsByGenreId,
    getAllSubGenreOptions,
    addSubGenreOption,
    deleteSubGenreOption,
    isSubGenreOptionInUse,
    getGenreById,

    addBillingOption,
    deleteBillingOption,
    isBillingOptionInUse,

    addTagOption,
    deleteTagOption,
    isTagOptionInUse,

    syncGenresForArtist,

    getCatalogUsage,
    removeCatalogValueFromPerformance,
    replaceCatalogValue,
  };
}