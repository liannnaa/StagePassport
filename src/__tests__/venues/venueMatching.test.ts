import {
  buildVenueKey,
  findMatchingPerformanceByShowId,
} from '../../features/venues/utils/venueMatching';
import { Performance } from '../../features/performances/types/performance';

const performances: Performance[] = [
  {
    id: '1',
    artist: 'Faye Webster',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '04-21-26',
    billing: '',
    tags: [],
    genre: '',
    subGenre: '',
    showId: 'atlanta-show-04-21-26',
    showName: 'Atlanta Show',
  },
  {
    id: '2',
    artist: 'Mitski',
    venue: 'The Eastern',
    city: 'Atlanta',
    date: '04-20-26',
    billing: '',
    tags: [],
    genre: '',
    subGenre: '',
    showId: 'mitski-live-04-20-26',
    showName: 'Mitski Live',
  },
];

describe('venueMatching', () => {
  describe('buildVenueKey', () => {
    it('builds a normalized venue key', () => {
      expect(buildVenueKey('  Fox Theatre  ', '  Atlanta  ')).toBe(
        'fox theatre|atlanta'
      );
    });

    it('collapses repeated whitespace', () => {
      expect(buildVenueKey('Fox   Theatre', 'New   York')).toBe(
        'fox theatre|new york'
      );
    });
  });

  describe('findMatchingPerformanceByShowId', () => {
    it('returns a matching performance by show id', () => {
      const result = findMatchingPerformanceByShowId(
        performances,
        undefined,
        'atlanta-show-04-21-26'
      );

      expect(result?.id).toBe('1');
    });

    it('returns undefined when there is no match', () => {
      const result = findMatchingPerformanceByShowId(
        performances,
        undefined,
        'missing-show'
      );

      expect(result).toBeUndefined();
    });

    it('ignores the currently edited performance id', () => {
      const result = findMatchingPerformanceByShowId(
        performances,
        '1',
        'atlanta-show-04-21-26'
      );

      expect(result).toBeUndefined();
    });
  });
});