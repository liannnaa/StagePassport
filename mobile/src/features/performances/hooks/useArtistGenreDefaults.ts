import { useCallback } from 'react';

import { Performance } from '../types/performance';
import { getArtistGenreDefaultFromPerformances } from '../services/artistGenreDefaultService';

export function useArtistGenreDefaults(performances: Performance[]) {
  const getArtistGenreDefault = useCallback(
    (artistName: string) => {
      return getArtistGenreDefaultFromPerformances(performances, artistName);
    },
    [performances]
  );

  return {
    getArtistGenreDefault,
  };
}