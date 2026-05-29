import {
  buildCatalogUsageCounts,
  getCatalogUsage,
} from '../../features/performances/services/catalogUsageService';
import { buildVenueKey } from '../../features/venues/utils/venueMatching';

const performances = [
  {
    id: '1',
    artist: 'Faye Webster',
    showName: 'Atlanta Show',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '2026-05-01',
    billing: 'Headliner',
    tags: ['Favorite', 'Outdoor'],
    genre: 'Indie Pop',
    subGenre: 'Singer-songwriter',
    showId: 'atlanta-show-05-01-26',
  },
  {
    id: '2',
    artist: 'Lomelda',
    showName: 'Atlanta Show',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '2026-05-01',
    billing: 'Support',
    tags: ['favorite'],
    genre: 'Indie Pop',
    subGenre: 'Dream Pop',
    showId: 'atlanta-show-05-01-26',
  },
  {
    id: '3',
    artist: 'Unknown',
    showName: 'No Venue',
    venue: '',
    city: '',
    date: '2026-05-02',
    billing: '',
    tags: [''],
    genre: '',
    subGenre: '',
    showId: 'no-venue-05-02-26',
  },
];

const billingOptions = [
  { id: 'headliner', name: 'Headliner', normalizedName: 'headliner' },
  { id: 'support', name: 'Support', normalizedName: 'support' },
];

const tagOptions = [
  { id: 'favorite', name: 'Favorite', normalizedName: 'favorite' },
  { id: 'outdoor', name: 'Outdoor', normalizedName: 'outdoor' },
];

const venueOptions = [
  {
    id: 'fox-theatre-atlanta',
    venueName: 'Fox Theatre',
    city: 'Atlanta',
    normalizedKey: 'fox-theatre-atlanta',
  },
];

const genreOptions = [
  { id: 'indie-pop', name: 'Indie Pop', normalizedName: 'indie pop' },
];

const subGenreOptions = [
  {
    id: 'singer-songwriter',
    genreId: 'indie-pop',
    name: 'Singer-songwriter',
    normalizedKey: 'indie pop::singer-songwriter',
  },
  {
    id: 'dream-pop',
    genreId: 'indie-pop',
    name: 'Dream Pop',
    normalizedKey: 'indie pop::dream pop',
  },
];

describe('catalogUsageService', () => {
  it('builds usage counts for all catalog types', () => {
    const counts = buildCatalogUsageCounts(performances);

    expect(counts.billingCounts.get('headliner')).toBe(1);
    expect(counts.billingCounts.get('support')).toBe(1);
    expect(counts.tagCounts.get('favorite')).toBe(2);
    expect(counts.tagCounts.get('outdoor')).toBe(1);
    expect(counts.venueCounts.get(buildVenueKey('Fox Theatre', 'Atlanta'))).toBe(2);
    expect(counts.genreCounts.get('indie pop')).toBe(2);
    expect(counts.subGenreCounts.get('indie pop::singer-songwriter')).toBe(1);
    expect(counts.subGenreCounts.get('indie pop::dream pop')).toBe(1);
  });

  it('gets billing usage', () => {
    const result = getCatalogUsage({
      type: 'billing',
      id: 'headliner',
      performances,
      billingOptions,
      tagOptions,
      venueOptions,
      genreOptions,
      subGenreOptions,
    });

    expect(result.map((item) => item.id)).toEqual(['1']);
  });

  it('gets tag usage', () => {
    const result = getCatalogUsage({
      type: 'tag',
      id: 'favorite',
      performances,
      billingOptions,
      tagOptions,
      venueOptions,
      genreOptions,
      subGenreOptions,
    });

    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('gets venue usage', () => {
    const result = getCatalogUsage({
      type: 'venue',
      id: 'fox-theatre-atlanta',
      performances,
      billingOptions,
      tagOptions,
      venueOptions,
      genreOptions,
      subGenreOptions,
    });

    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('gets genre usage', () => {
    const result = getCatalogUsage({
      type: 'genre',
      id: 'indie-pop',
      performances,
      billingOptions,
      tagOptions,
      venueOptions,
      genreOptions,
      subGenreOptions,
    });

    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('gets sub-genre usage scoped by parent genre', () => {
    const result = getCatalogUsage({
      type: 'subGenre',
      id: 'singer-songwriter',
      performances,
      billingOptions,
      tagOptions,
      venueOptions,
      genreOptions,
      subGenreOptions,
    });

    expect(result.map((item) => item.id)).toEqual(['1']);
  });

  it('returns empty array for missing option ids', () => {
    expect(
      getCatalogUsage({
        type: 'billing',
        id: 'missing',
        performances,
        billingOptions,
        tagOptions,
        venueOptions,
        genreOptions,
        subGenreOptions,
      })
    ).toEqual([]);
  });
});