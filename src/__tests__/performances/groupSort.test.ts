import {
  sortArtistGroups,
  sortConcertGroups,
} from '../../features/performances/utils/groupSort';
import {
  ArtistGroup,
  ConcertGroup,
} from '../../features/performances/types/performance';

const artistGroups: ArtistGroup[] = [
  {
    artistName: 'Mitski',
    performances: [],
    performanceCount: 1,
    latestDate: '04-20-26',
    genre: 'Alternative',
    subGenre: 'Indie Rock',
  },
  {
    artistName: 'Faye Webster',
    performances: [],
    performanceCount: 3,
    latestDate: '04-21-26',
    genre: 'Indie',
    subGenre: 'Indie Pop',
  },
];

const concertGroups: ConcertGroup[] = [
  {
    showId: 'b-show',
    showName: 'B Show',
    date: '04-20-26',
    venue: '',
    city: '',
    performances: [],
    artistCount: 1,
  },
  {
    showId: 'a-show',
    showName: 'A Show',
    date: '04-21-26',
    venue: '',
    city: '',
    performances: [],
    artistCount: 1,
  },
];

describe('groupSort', () => {
  describe('sortArtistGroups', () => {
    it('sorts artist groups alphabetically', () => {
      const result = sortArtistGroups(artistGroups, 'artist');
      expect(result.map((item) => item.artistName)).toEqual([
        'Faye Webster',
        'Mitski',
      ]);
    });

    it('sorts artist groups by most performances', () => {
      const result = sortArtistGroups(artistGroups, 'mostPerformances');
      expect(result.map((item) => item.artistName)).toEqual([
        'Faye Webster',
        'Mitski',
      ]);
    });

    it('sorts artist groups by latest date', () => {
      const result = sortArtistGroups(artistGroups, 'latest');
      expect(result.map((item) => item.artistName)).toEqual([
        'Faye Webster',
        'Mitski',
      ]);
    });
  });

  describe('sortConcertGroups', () => {
    it('sorts concert groups by newest', () => {
      const result = sortConcertGroups(concertGroups, 'newest');
      expect(result.map((item) => item.showName)).toEqual(['A Show', 'B Show']);
    });

    it('sorts concert groups by oldest', () => {
      const result = sortConcertGroups(concertGroups, 'oldest');
      expect(result.map((item) => item.showName)).toEqual(['B Show', 'A Show']);
    });

    it('sorts concert groups alphabetically by show name', () => {
      const result = sortConcertGroups(concertGroups, 'showName');
      expect(result.map((item) => item.showName)).toEqual(['A Show', 'B Show']);
    });
  });
});