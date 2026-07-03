import {
  normalizeArtistPerformanceRows,
  normalizeConcertArtistRows,
  normalizeConcertSharedPayload,
  toCatalogRowsFromConcert,
  toCatalogRowsFromPerformances,
  toPerformanceWithShowId,
} from '../../features/performances/services/performancePayloadService';

describe('performancePayloadService', () => {
  it('adds a showId to a performance payload', () => {
    const result = toPerformanceWithShowId({
      artist: 'Faye Webster',
      showName: 'Atlanta Show',
      venue: 'Fox Theatre',
      city: 'Atlanta',
      date: '2026-05-01',
      billing: 'Headliner',
      tags: ['favorite'],
      genre: 'Indie Pop',
      subGenre: 'Singer-songwriter',
    });

    expect(result).toEqual(
      expect.objectContaining({
        artist: 'Faye Webster',
        showId: 'atlanta-show-2026-05-01',
      })
    );
  });

  it('normalizes shared concert payload', () => {
    expect(
      normalizeConcertSharedPayload({
        showName: '  Atlanta Show  ',
        venue: '  Fox Theatre ',
        city: ' Atlanta ',
        date: ' 2026-05-01 ',
      })
    ).toEqual({
      showName: 'Atlanta Show',
      venue: 'Fox Theatre',
      city: 'Atlanta',
      date: '2026-05-01',
    });
  });

  it('normalizes concert artist rows and removes empty artists', () => {
    const result = normalizeConcertArtistRows([
      {
        performanceId: '1',
        artist: ' Faye Webster ',
        billing: ' Headliner ',
        tags: [' favorite ', '', ' indie '],
        genre: ' Indie Pop ',
        subGenre: ' Singer-songwriter ',
      },
      {
        performanceId: '2',
        artist: '   ',
        billing: 'Support',
        tags: [],
        genre: '',
        subGenre: '',
      },
    ]);

    expect(result).toEqual([
      {
        performanceId: '1',
        artist: 'Faye Webster',
        billing: 'Headliner',
        tags: ['favorite', 'indie'],
        genre: 'Indie Pop',
        subGenre: 'Singer-songwriter',
      },
    ]);
  });

  it('normalizes artist performance rows and removes empty show names', () => {
    const result = normalizeArtistPerformanceRows([
      {
        performanceId: '1',
        showName: ' Atlanta Show ',
        venue: ' Fox Theatre ',
        city: ' Atlanta ',
        date: ' 2026-05-01 ',
        billing: ' Headliner ',
        tags: [' favorite ', ' '],
        genre: ' Indie Pop ',
        subGenre: ' Singer-songwriter ',
      },
      {
        performanceId: '2',
        showName: '   ',
        venue: '',
        city: '',
        date: '',
        billing: '',
        tags: [],
        genre: '',
        subGenre: '',
      },
    ]);

    expect(result).toEqual([
      {
        performanceId: '1',
        showName: 'Atlanta Show',
        venue: 'Fox Theatre',
        city: 'Atlanta',
        date: '2026-05-01',
        billing: 'Headliner',
        tags: ['favorite'],
        genre: 'Indie Pop',
        subGenre: 'Singer-songwriter',
      },
    ]);
  });

  it('maps performances into catalog sync rows', () => {
    expect(
      toCatalogRowsFromPerformances([
        {
          venue: 'Fox Theatre',
          city: 'Atlanta',
          genre: 'Indie Pop',
          subGenre: 'Singer-songwriter',
          billing: 'Headliner',
          tags: ['favorite'],
        },
      ])
    ).toEqual([
      {
        venue: 'Fox Theatre',
        city: 'Atlanta',
        genre: 'Indie Pop',
        subGenre: 'Singer-songwriter',
        billing: 'Headliner',
        tags: ['favorite'],
      },
    ]);
  });

  it('maps concert rows into catalog sync rows with shared venue and city', () => {
    expect(
      toCatalogRowsFromConcert(
        [
          {
            billing: 'Headliner',
            tags: ['favorite'],
            genre: 'Indie Pop',
            subGenre: 'Singer-songwriter',
          },
        ],
        {
          venue: 'Fox Theatre',
          city: 'Atlanta',
        }
      )
    ).toEqual([
      {
        venue: 'Fox Theatre',
        city: 'Atlanta',
        genre: 'Indie Pop',
        subGenre: 'Singer-songwriter',
        billing: 'Headliner',
        tags: ['favorite'],
      },
    ]);
  });
});