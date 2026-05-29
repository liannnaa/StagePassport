import { useCallback, useEffect, useState } from 'react';

import { Performance } from '../types/performance';
import { performancesRepository } from '../repository/performancesRepository';

import { VenueOption } from '../../venues/types/venue';
import { venueOptionsRepository } from '../../venues/repository/venueOptionsRepository';

import { GenreOption, SubGenreOption } from '../../genres/types/genre';
import { genresRepository } from '../../genres/repository/genresRepository';

import { BillingOption } from '../../billings/types/billing';
import { billingsRepository } from '../../billings/repository/billingsRepository';

import { TagOption } from '../../tags/types/tag';
import { tagsRepository } from '../../tags/repository/tagsRepository';

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

  const refreshBillings = useCallback(async () => {
    if (!user) {
      setBillingOptions([]);
      return;
    }

    const items = await billingsRepository.getAll(user.uid);
    setBillingOptions(items);
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
      refreshBillings(),
      refreshTags(),
    ]);
  }, [
    refreshPerformances,
    refreshVenueOptions,
    refreshGenres,
    refreshSubGenres,
    refreshBillings,
    refreshTags,
  ]);

  useEffect(() => {
    if (!user) {
      clearData();
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

    const unsubscribeBillings = billingsRepository.subscribe(
      user.uid,
      setBillingOptions
    );

    const unsubscribeTags = tagsRepository.subscribe(user.uid, setTagOptions);

    return () => {
      unsubscribePerformances();
      unsubscribeVenues();
      unsubscribeGenres();
      unsubscribeSubGenres();
      unsubscribeBillings();
      unsubscribeTags();
    };
  }, [user, clearData]);

  return {
    performances,
    venueOptions,
    genreOptions,
    subGenreOptions,
    billingOptions,
    tagOptions,
    isLoading,
    refresh,
  };
}