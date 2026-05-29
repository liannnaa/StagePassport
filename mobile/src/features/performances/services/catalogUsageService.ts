import { Performance } from '../types/performance';
import { CatalogType } from '../types/performanceContextTypes';

import { VenueOption } from '../../venues/types/venue';
import { buildVenueKey } from '../../venues/utils/venueMatching';

import { GenreOption, SubGenreOption } from '../../genres/types/genre';
import { normalizeGenreText } from '../../genres/utils/genreKeys';

import { BillingOption } from '../../billings/types/billing';
import { buildBillingKey } from '../../billings/utils/billingKeys';

import { TagOption } from '../../tags/types/tag';
import { buildTagKey } from '../../tags/utils/tagKeys';

export type CatalogUsageCounts = {
  billingCounts: Map<string, number>;
  tagCounts: Map<string, number>;
  venueCounts: Map<string, number>;
  genreCounts: Map<string, number>;
  subGenreCounts: Map<string, number>;
};

export type CatalogUsageInput = {
  type: CatalogType;
  id: string;
  performances: Performance[];
  billingOptions: BillingOption[];
  tagOptions: TagOption[];
  venueOptions: VenueOption[];
  genreOptions: GenreOption[];
  subGenreOptions: SubGenreOption[];
};

export function buildCatalogUsageCounts(
  performances: Performance[]
): CatalogUsageCounts {
  const billingCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  const venueCounts = new Map<string, number>();
  const genreCounts = new Map<string, number>();
  const subGenreCounts = new Map<string, number>();

  performances.forEach((performance) => {
    const billingKey = buildBillingKey(performance.billing);
    if (billingKey) {
      billingCounts.set(billingKey, (billingCounts.get(billingKey) ?? 0) + 1);
    }

    performance.tags.forEach((tag) => {
      const tagKey = buildTagKey(tag);

      if (tagKey) {
        tagCounts.set(tagKey, (tagCounts.get(tagKey) ?? 0) + 1);
      }
    });

    if (performance.venue.trim() && performance.city.trim()) {
      const venueKey = buildVenueKey(performance.venue, performance.city);
      venueCounts.set(venueKey, (venueCounts.get(venueKey) ?? 0) + 1);
    }

    const genreKey = normalizeGenreText(performance.genre);
    if (genreKey) {
      genreCounts.set(genreKey, (genreCounts.get(genreKey) ?? 0) + 1);
    }

    if (genreKey && performance.subGenre.trim()) {
      const subGenreKey = `${genreKey}::${performance.subGenre
        .trim()
        .toLowerCase()}`;

      subGenreCounts.set(
        subGenreKey,
        (subGenreCounts.get(subGenreKey) ?? 0) + 1
      );
    }
  });

  return {
    billingCounts,
    tagCounts,
    venueCounts,
    genreCounts,
    subGenreCounts,
  };
}

export function getCatalogUsage({
  type,
  id,
  performances,
  billingOptions,
  tagOptions,
  venueOptions,
  genreOptions,
  subGenreOptions,
}: CatalogUsageInput): Performance[] {
  if (type === 'billing') {
    const billing = billingOptions.find((item) => item.id === id);
    if (!billing) return [];

    return performances.filter(
      (performance) => buildBillingKey(performance.billing) === billing.normalizedName
    );
  }

  if (type === 'tag') {
    const tag = tagOptions.find((item) => item.id === id);
    if (!tag) return [];

    return performances.filter((performance) =>
      performance.tags.some(
        (performanceTag) => buildTagKey(performanceTag) === tag.normalizedName
      )
    );
  }

  if (type === 'venue') {
    const venue = venueOptions.find((item) => item.id === id);
    if (!venue) return [];

    const venueKey = buildVenueKey(venue.venueName, venue.city);

    return performances.filter((performance) => {
      if (!performance.venue.trim() || !performance.city.trim()) return false;

      return buildVenueKey(performance.venue, performance.city) === venueKey;
    });
  }

  if (type === 'genre') {
    const genre = genreOptions.find((item) => item.id === id);
    if (!genre) return [];

    return performances.filter(
      (performance) =>
        normalizeGenreText(performance.genre) === genre.normalizedName
    );
  }

  const subGenre = subGenreOptions.find((item) => item.id === id);
  if (!subGenre) return [];

  const genre = genreOptions.find((item) => item.id === subGenre.genreId);

  return performances.filter((performance) => {
    const sameSubGenre =
      performance.subGenre.trim().toLowerCase() ===
      subGenre.name.trim().toLowerCase();

    if (!sameSubGenre) return false;

    if (!genre) return true;

    return normalizeGenreText(performance.genre) === genre.normalizedName;
  });
}