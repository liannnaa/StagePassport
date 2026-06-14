import { useCallback, useEffect, useState } from 'react';

import { Performance } from '../types/performance';

import { VenueOption } from '../../venues/types/venue';

import { GenreOption, SubGenreOption } from '../../genres/types/genre';

import { BillingOption } from '../../billings/types/billing';

import { TagOption } from '../../tags/types/tag';
import { getPerformancesFromApi, getCatalogFromApi } from '../../../api/stagePassportApi';

type AuthUser = {
  uid: string;
} | null | undefined;

export function usePerformancesData(user: AuthUser) {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [venueOptions, setVenueOptions] = useState<VenueOption[]>([]);
  const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);
  const [subGenreOptions, setSubGenreOptions] = useState<SubGenreOption[]>([]);
  const [billingOptions, setBillingOptions] = useState<BillingOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const clearData = useCallback(() => {
    setPerformances([]);
    setVenueOptions([]);
    setGenreOptions([]);
    setSubGenreOptions([]);
    setBillingOptions([]);
    setTagOptions([]);
    setIsLoading(false);
  }, []);

  const addPerformanceToState = useCallback((performance: Performance) => {
    setPerformances((current) => [performance, ...current]);
  }, []);

  const addPerformancesToState = useCallback(
    (newPerformances: Performance[]) => {
      setPerformances((current) => [...newPerformances, ...current]);
    },
    []
  );

  const updatePerformanceInState = useCallback(
    (performanceId: string, updatedPerformance: Performance) => {
      setPerformances((current) =>
        current.map((item) =>
          item.id === performanceId ? updatedPerformance : item
        )
      );
    },
    []
  );

  const deletePerformanceFromState = useCallback((performanceId: string) => {
    setPerformances((current) =>
      current.filter((item) => item.id !== performanceId)
    );
  }, []);

  const updatePerformancesInState = useCallback(
    (updatedPerformances: Performance[]) => {
      const updatedById = new Map(
        updatedPerformances.map((item) => [item.id, item])
      );

      setPerformances((current) =>
        current.map((item) => updatedById.get(item.id) ?? item)
      );
    },
    []
  );

  const deletePerformancesFromState = useCallback(
    (performanceIds: string[]) => {
      const idsToDelete = new Set(performanceIds);

      setPerformances((current) =>
        current.filter((item) => !idsToDelete.has(item.id))
      );
    },
    []
  );

  const updateArtistGenreInState = useCallback(
    (artistName: string, genre: string, subGenre: string) => {
      const normalizedArtistName = artistName.trim().toLowerCase();

      setPerformances((current) =>
        current.map((performance) =>
          performance.artist.trim().toLowerCase() === normalizedArtistName
            ? {
                ...performance,
                genre,
                subGenre,
              }
            : performance
        )
      );
    },
    []
  );

  const refreshCatalog = useCallback(async () => {
    if (!user) {
      setVenueOptions([]);
      setGenreOptions([]);
      setSubGenreOptions([]);
      setBillingOptions([]);
      setTagOptions([]);
      return;
    }

    const catalog = await getCatalogFromApi();

    setVenueOptions(catalog.venues);
    setGenreOptions(catalog.genres);
    setSubGenreOptions(catalog.subGenres);
    setBillingOptions(catalog.billings);
    setTagOptions(catalog.tags);
  }, [user]);

  const setCatalogState = useCallback(
    (catalog: {
      venues: VenueOption[];
      genres: GenreOption[];
      subGenres: SubGenreOption[];
      billings: BillingOption[];
      tags: TagOption[];
    }) => {
      setVenueOptions(catalog.venues);
      setGenreOptions(catalog.genres);
      setSubGenreOptions(catalog.subGenres);
      setBillingOptions(catalog.billings);
      setTagOptions(catalog.tags);
    },
    []
  );

  const refreshPerformances = useCallback(async () => {
    if (!user) {
      setPerformances([]);
      return;
    }

    const items = await getPerformancesFromApi();
    setPerformances(items);
  }, [user]);

  const refresh = useCallback(async () => {
    await Promise.all([
      refreshPerformances(),
      refreshCatalog(),
    ]);
  }, [refreshPerformances, refreshCatalog]);

  useEffect(() => {
    if (!user) {
      clearData();
      return;
    }

    setIsLoading(true);

    refreshPerformances()
      .catch((error) => {
        console.error('Failed to load performances from backend:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    refreshCatalog().catch((error) => {
      console.error('Failed to load catalog from backend:', error);
    });
  }, [user, clearData, refreshPerformances, refreshCatalog]);

  return {
    performances,
    venueOptions,
    genreOptions,
    subGenreOptions,
    billingOptions,
    tagOptions,
    isLoading,
    refresh,
    addPerformanceToState,
    addPerformancesToState,
    updatePerformanceInState,
    deletePerformanceFromState,
    updatePerformancesInState,
    deletePerformancesFromState,
    updateArtistGenreInState,
    setCatalogState,
  };
}