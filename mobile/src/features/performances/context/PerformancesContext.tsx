import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';

import { PerformancesContextValue } from '../types/performanceContextTypes';

import { useAuth } from '../../auth/context/AuthContext';

import { usePerformancesData } from '../hooks/usePerformancesData';
import { usePerformanceFilters } from '../hooks/usePerformanceFilters';
import { useCatalogActions } from '../hooks/useCatalogActions';
import { usePerformanceActions } from '../hooks/usePerformanceActions';
import { useArtistGenreDefaults } from '../hooks/useArtistGenreDefaults';

const PerformancesContext = createContext<PerformancesContextValue | undefined>(
  undefined
);

export function PerformancesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const {
    performances,
    venueOptions,
    genreOptions,
    subGenreOptions,
    billingOptions,
    tagOptions,
    isLoading,
    refresh,
  } = usePerformancesData(user);

  const {
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
  } = usePerformanceFilters(performances);

  const { getArtistGenreDefault } = useArtistGenreDefaults(performances);

  const {
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
  } = useCatalogActions({
    user,
    performances,
    venueOptions,
    genreOptions,
    subGenreOptions,
    billingOptions,
    tagOptions,
  });

  const {
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
  } = usePerformanceActions({
    user,
    performances,
    getArtistGenreDefault,
  });

  const value = useMemo<PerformancesContextValue>(
    () => ({
      performances,
      filteredPerformances,

      concertGroups,
      filteredConcertGroups,

      artistGroups,
      filteredArtistGroups,

      venueOptions,
      genreOptions,
      subGenreOptions,
      billingOptions,
      tagOptions,

      isLoading,

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

      refresh,

      getArtistGenreDefault,

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

      getCatalogUsage,
      removeCatalogValueFromPerformance,
      replaceCatalogValue,

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
    }),
    [
      performances,
      filteredPerformances,
      concertGroups,
      filteredConcertGroups,
      artistGroups,
      filteredArtistGroups,
      venueOptions,
      genreOptions,
      subGenreOptions,
      billingOptions,
      tagOptions,
      isLoading,
      searchQuery,
      sortMode,
      concertSearchQuery,
      concertSortMode,
      artistSearchQuery,
      artistSortMode,
      refresh,
      getArtistGenreDefault,
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
      getCatalogUsage,
      removeCatalogValueFromPerformance,
      replaceCatalogValue,
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
    ]
  );

  return (
    <PerformancesContext.Provider value={value}>
      {children}
    </PerformancesContext.Provider>
  );
}

export function usePerformances() {
  const context = useContext(PerformancesContext);

  if (!context) {
    throw new Error(
      'usePerformances must be used within a PerformancesProvider'
    );
  }

  return context;
}