import {
  matchesArtistGroupSearch,
  matchesConcertGroupSearch,
} from '../../features/performances/utils/groupSearch';
import {
  ArtistGroup,
  ConcertGroup,
} from '../../features/performances/types/performance';

const artistGroup: ArtistGroup = {
  artistName: 'Faye Webster',
  performances: [],
  performanceCount: 3,
  latestDate: '04-21-26',
  genre: 'Indie',
  subGenre: 'Indie Pop',
};

const concertGroup: ConcertGroup = {
  showId: 'atlanta-show-04-21-26',
  showName: 'Atlanta Show',
  date: '04-21-26',
  venue: 'Fox Theatre',
  city: 'Atlanta',
  performances: [
    {
      id: '1',
      artist: 'Faye Webster',
      venue: 'Fox Theatre',
      city: 'Atlanta',
      date: '04-21-26',
      billing: '',
      tags: [],
      genre: 'Indie',
      subGenre: 'Indie Pop',
      showId: 'atlanta-show-04-21-26',
      showName: 'Atlanta Show',
    },
  ],
  artistCount: 1,
};

describe('groupSearch', () => {
  describe('matchesArtistGroupSearch', () => {
    it('returns true for empty query', () => {
      expect(matchesArtistGroupSearch(artistGroup, '')).toBe(true);
    });

    it('matches artist name', () => {
      expect(matchesArtistGroupSearch(artistGroup, 'faye')).toBe(true);
    });

    it('matches genre', () => {
      expect(matchesArtistGroupSearch(artistGroup, 'indie')).toBe(true);
    });

    it('matches sub-genre', () => {
      expect(matchesArtistGroupSearch(artistGroup, 'indie pop')).toBe(true);
    });

    it('returns false when nothing matches', () => {
      expect(matchesArtistGroupSearch(artistGroup, 'metal')).toBe(false);
    });
  });

  describe('matchesConcertGroupSearch', () => {
    it('returns true for empty query', () => {
      expect(matchesConcertGroupSearch(concertGroup, '')).toBe(true);
    });

    it('matches show name', () => {
      expect(matchesConcertGroupSearch(concertGroup, 'atlanta show')).toBe(true);
    });

    it('matches venue', () => {
      expect(matchesConcertGroupSearch(concertGroup, 'fox')).toBe(true);
    });

    it('matches city', () => {
      expect(matchesConcertGroupSearch(concertGroup, 'atlanta')).toBe(true);
    });

    it('matches artist name in performances', () => {
      expect(matchesConcertGroupSearch(concertGroup, 'faye')).toBe(true);
    });

    it('returns false when nothing matches', () => {
      expect(matchesConcertGroupSearch(concertGroup, 'metal')).toBe(false);
    });
  });
});