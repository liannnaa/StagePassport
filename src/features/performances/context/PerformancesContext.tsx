import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Performance,
  ArtistGroup,
  ConcertGroup,
} from '../types/performance';
import { performancesRepository } from '../repository/performancesRepository';
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
import { buildShowId } from '../utils/showId';

import { venueOptionsRepository } from '../../venues/repository/venueOptionsRepository';
import { VenueOption } from '../../venues/types/venue';
import { buildVenueKey } from '../../venues/utils/venueMatching';

import { genresRepository } from '../../genres/repository/genresRepository';
import { GenreOption, SubGenreOption } from '../../genres/types/genre';
import { normalizeGenreText } from '../../genres/utils/genreKeys';

import { tagsRepository } from '../../tags/repository/tagsRepository';
import { TagOption } from '../../tags/types/tag';
import { buildTagKey } from '../../tags/utils/tagKeys';

import { useAuth } from '../../auth/context/AuthContext';

type PerformancePayload = Omit<Performance, 'id' | 'showId'>;

type PerformancesContextValue = {
  performances: Performance[];
  filteredPerformances: Performance[];

  concertGroups: ConcertGroup[];
  filteredConcertGroups: ConcertGroup[];

  artistGroups: ArtistGroup[];
  filteredArtistGroups: ArtistGroup[];

  venueOptions: VenueOption[];
  genreOptions: GenreOption[];
  subGenreOptions: SubGenreOption[];
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
  updatePerformance: (performanceId: string, payload: PerformancePayload) => Promise<void>;
  deletePerformance: (performanceId: string) => Promise<void>;
  getPerformanceById: (performanceId: string) => Performance | undefined;

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

  addTagOption: (name: string) => Promise<TagOption>;
  deleteTagOption: (id: string) => Promise<void>;
  isTagOptionInUse: (id: string) => boolean;

  syncGenresForArtist: (
    artistName: string,
    genre: string,
    subGenre: string
  ) => Promise<void>;
};

const PerformancesContext = createContext<PerformancesContextValue | undefined>(
  undefined
);

export function PerformancesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [performances, setPerformances] = useState<Performance[]>([]);
  const [venueOptions, setVenueOptions] = useState<VenueOption[]>([]);
  const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);
  const [subGenreOptions, setSubGenreOptions] = useState<SubGenreOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const [concertSearchQuery, setConcertSearchQuery] = useState('');
  const [concertSortMode, setConcertSortMode] =
    useState<ConcertGroupSortMode>('newest');

  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [artistSortMode, setArtistSortMode] =
    useState<ArtistGroupSortMode>('artist');

  const refreshPerformances = useCallback(async () => {
    if (!user) {
      setPerformances([]);
      return;
    }

    const items = await performancesRepository.getAll(user.uid);
    setPerformances(items);
  }, [user]);

  const refreshVenueOptions = useCallback(async () => {
    if (!user) {
      setVenueOptions([]);
      return;
    }

    const items = await venueOptionsRepository.getAll(user.uid);
    setVenueOptions(items);
  }, [user]);

  const refreshGenres = useCallback(async () => {
    if (!user) {
      setGenreOptions([]);
      return;
    }

    const items = await genresRepository.getAllGenres(user.uid);
    setGenreOptions(items);
  }, [user]);

  const refreshSubGenres = useCallback(async () => {
    if (!user) {
      setSubGenreOptions([]);
      return;
    }

    const items = await genresRepository.getAllSubGenres(user.uid);
    setSubGenreOptions(items);
  }, [user]);

  const refreshTags = useCallback(async () => {
    if (!user) {
      setTagOptions([]);
      return;
    }

    const items = await tagsRepository.getAll(user.uid);
    setTagOptions(items);
  }, [user]);

  const refresh = useCallback(async () => {
    await Promise.all([
      refreshPerformances(),
      refreshVenueOptions(),
      refreshGenres(),
      refreshSubGenres(),
      refreshTags(),
    ]);
  }, [
    refreshPerformances,
    refreshVenueOptions,
    refreshGenres,
    refreshSubGenres,
    refreshTags,
  ]);

  useEffect(() => {
    if (!user) {
      setPerformances([]);
      setVenueOptions([]);
      setGenreOptions([]);
      setSubGenreOptions([]);
      setTagOptions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribePerformances = performancesRepository.subscribe(
      user.uid,
      (items) => {
        setPerformances(items);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    const unsubscribeVenues = venueOptionsRepository.subscribe(
      user.uid,
      setVenueOptions
    );

    const unsubscribeGenres = genresRepository.subscribeGenres(
      user.uid,
      setGenreOptions
    );

    const unsubscribeSubGenres = genresRepository.subscribeSubGenres(
      user.uid,
      setSubGenreOptions
    );

    const unsubscribeTags = tagsRepository.subscribe(
      user.uid,
      setTagOptions
    );

    return () => {
      unsubscribePerformances();
      unsubscribeVenues();
      unsubscribeGenres();
      unsubscribeSubGenres();
      unsubscribeTags();
    };
  }, [user]);

  const addPerformance = useCallback(
    async (payload: PerformancePayload) => {
      if (!user) {
        throw new Error('You must be logged in to add a performance.');
      }

      const performance = {
        ...payload,
        showId: buildShowId(payload.showName, payload.date),
      };

      const id = await performancesRepository.insert(user.uid, performance);

      if (performance.venue.trim() && performance.city.trim()) {
        await venueOptionsRepository.insert(
          user.uid,
          performance.venue,
          performance.city
        );
      }

      if (performance.genre.trim()) {
        const genre = await genresRepository.insertGenre(user.uid, performance.genre);

        if (performance.subGenre.trim()) {
          await genresRepository.insertSubGenre(
            user.uid,
            genre.id,
            genre.name,
            performance.subGenre
          );
        }
      }

      if (performance.tag.trim()) {
        await tagsRepository.insert(user.uid, performance.tag);
      }

      return id;
    },
    [user]
  );

  const updatePerformance = useCallback(
    async (performanceId: string, payload: PerformancePayload) => {
      if (!user) {
        throw new Error('You must be logged in to update a performance.');
      }

      const updatedPerformance = {
        ...payload,
        showId: buildShowId(payload.showName, payload.date),
      };

      await performancesRepository.update(user.uid, performanceId, updatedPerformance);

      if (updatedPerformance.venue.trim() && updatedPerformance.city.trim()) {
        await venueOptionsRepository.insert(
          user.uid,
          updatedPerformance.venue,
          updatedPerformance.city
        );
      }

      if (updatedPerformance.genre.trim()) {
        const genre = await genresRepository.insertGenre(
          user.uid,
          updatedPerformance.genre
        );

        if (updatedPerformance.subGenre.trim()) {
          await genresRepository.insertSubGenre(
            user.uid,
            genre.id,
            genre.name,
            updatedPerformance.subGenre
          );
        }
      }

      if (updatedPerformance.tag.trim()) {
        await tagsRepository.insert(user.uid, updatedPerformance.tag);
      }
    },
    [user]
  );

  const deletePerformance = useCallback(
    async (performanceId: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete a performance.');
      }

      await performancesRepository.delete(user.uid, performanceId);
    },
    [user]
  );

  const getPerformanceById = useCallback(
    (performanceId: string) =>
      performances.find((performance) => performance.id === performanceId),
    [performances]
  );

  const addVenueOption = useCallback(
    async (venueName: string, city: string) => {
      if (!user) {
        throw new Error('You must be logged in to add a venue.');
      }

      return venueOptionsRepository.insert(user.uid, venueName, city);
    },
    [user]
  );

  const deleteVenueOption = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete a venue.');
      }

      await venueOptionsRepository.deleteVenueOption(user.uid, id);
    },
    [user]
  );

  const isVenueOptionInUse = useCallback(
    (id: string) => {
      const option = venueOptions.find((item) => item.id === id);
      if (!option) return false;

      const optionKey = buildVenueKey(option.venueName, option.city);

      return performances.some((performance) => {
        if (!performance.venue.trim() || !performance.city.trim()) return false;
        return buildVenueKey(performance.venue, performance.city) === optionKey;
      });
    },
    [venueOptions, performances]
  );

  const addGenreOption = useCallback(
    async (name: string) => {
      if (!user) {
        throw new Error('You must be logged in to add a genre.');
      }

      return genresRepository.insertGenre(user.uid, name);
    },
    [user]
  );

  const deleteGenreOption = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete a genre.');
      }

      await genresRepository.deleteGenre(user.uid, id);
    },
    [user]
  );

  const isGenreOptionInUse = useCallback(
    (id: string) => {
      const option = genreOptions.find((item) => item.id === id);
      if (!option) return false;

      return performances.some(
        (performance) =>
          normalizeGenreText(performance.genre) === option.normalizedName
      );
    },
    [genreOptions, performances]
  );

  const getSubGenreOptionsByGenreId = useCallback(
    (genreId: string) => {
      return subGenreOptions.filter((option) => option.genreId === genreId);
    },
    [subGenreOptions]
  );

  const getAllSubGenreOptions = useCallback(() => {
    return subGenreOptions;
  }, [subGenreOptions]);

  const addSubGenreOption = useCallback(
    async (genreId: string, genreName: string, name: string) => {
      if (!user) {
        throw new Error('You must be logged in to add a sub-genre.');
      }

      return genresRepository.insertSubGenre(
        user.uid,
        genreId,
        genreName,
        name
      );
    },
    [user]
  );

  const deleteSubGenreOption = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete a sub-genre.');
      }

      await genresRepository.deleteSubGenre(user.uid, id);
    },
    [user]
  );

  const isSubGenreOptionInUse = useCallback(
    (id: string) => {
      const subGenre = subGenreOptions.find((item) => item.id === id);
      if (!subGenre) return false;

      return performances.some(
        (performance) =>
          performance.subGenre.trim().toLowerCase() ===
          subGenre.name.trim().toLowerCase()
      );
    },
    [subGenreOptions, performances]
  );

  const getGenreById = useCallback(
    (genreId: string) => {
      return genreOptions.find((genre) => genre.id === genreId);
    },
    [genreOptions]
  );

  const addTagOption = useCallback(
    async (name: string) => {
      if (!user) {
        throw new Error('You must be logged in to add a tag.');
      }

      return tagsRepository.insert(user.uid, name);
    },
    [user]
  );

  const deleteTagOption = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete a tag.');
      }

      await tagsRepository.delete(user.uid, id);
    },
    [user]
  );

  const isTagOptionInUse = useCallback(
    (id: string) => {
      const option = tagOptions.find((item) => item.id === id);
      if (!option) return false;

      return performances.some(
        (performance) => buildTagKey(performance.tag) === option.normalizedName
      );
    },
    [tagOptions, performances]
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

      if (genre.trim()) {
        const genreOption = await genresRepository.insertGenre(user.uid, genre.trim());

        if (subGenre.trim()) {
          await genresRepository.insertSubGenre(
            user.uid,
            genreOption.id,
            genreOption.name,
            subGenre.trim()
          );
        }
      }
    },
    [user]
  );

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

      addPerformance,
      updatePerformance,
      deletePerformance,
      getPerformanceById,

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
      tagOptions,
      isLoading,
      searchQuery,
      sortMode,
      concertSearchQuery,
      concertSortMode,
      artistSearchQuery,
      artistSortMode,
      refresh,
      addPerformance,
      updatePerformance,
      deletePerformance,
      getPerformanceById,
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