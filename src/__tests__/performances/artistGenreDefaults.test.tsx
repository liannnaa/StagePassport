import { getArtistGenreDefaultFromPerformances } from '../../features/performances/services/artistGenreDefaultService';

const performances = [
  {
    id: '1',
    artist: 'Faye Webster',
    showName: 'Atlanta Millionaires Club',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '2026-05-01',
    billing: 'Headliner',
    tags: ['favorite'],
    genre: 'Indie Pop',
    subGenre: 'Singer-songwriter',
    showId: 'atlanta-millionaires-club-05-01-26',
  },
  {
    id: '2',
    artist: 'Faye Webster',
    showName: 'Another Show',
    venue: '',
    city: '',
    date: '2026-05-02',
    billing: '',
    tags: [],
    genre: '',
    subGenre: '',
    showId: 'another-show-05-02-26',
  },
];

describe('getArtistGenreDefaultFromPerformances', () => {
  it('returns the first matching genre default for an artist', () => {
    expect(
      getArtistGenreDefaultFromPerformances(performances, ' faye webster ')
    ).toEqual({
      genre: 'Indie Pop',
      subGenre: 'Singer-songwriter',
    });
  });

  it('returns undefined when artist name is empty', () => {
    expect(getArtistGenreDefaultFromPerformances(performances, '   ')).toBeUndefined();
  });

  it('returns undefined when no matching artist has a genre', () => {
    expect(getArtistGenreDefaultFromPerformances(performances, 'Unknown Artist')).toBeUndefined();
  });
});