import { matchesPerformanceSearch } from '../../features/performances/utils/performanceSearch';
import { Performance } from '../../features/performances/types/performance';

const performance: Performance = {
  id: '1',
  artist: 'Faye Webster',
  venue: 'Fox Theatre',
  city: 'Atlanta',
  date: '04-21-26',
  tag: 'Headliner',
  genre: 'Indie',
  subGenre: 'Indie Pop',
  showId: 'atlanta-show-04-21-26',
  showName: 'Atlanta Show',
};

describe('matchesPerformanceSearch', () => {
  it('returns true for an empty query', () => {
    expect(matchesPerformanceSearch(performance, '')).toBe(true);
  });

  it('matches artist name', () => {
    expect(matchesPerformanceSearch(performance, 'faye')).toBe(true);
  });

  it('matches venue name', () => {
    expect(matchesPerformanceSearch(performance, 'fox')).toBe(true);
  });

  it('matches city', () => {
    expect(matchesPerformanceSearch(performance, 'atlanta')).toBe(true);
  });

  it('matches genre', () => {
    expect(matchesPerformanceSearch(performance, 'indie')).toBe(true);
  });

  it('matches sub-genre', () => {
    expect(matchesPerformanceSearch(performance, 'indie pop')).toBe(true);
  });

  it('matches show id', () => {
    expect(matchesPerformanceSearch(performance, 'atlanta-show')).toBe(true);
  });

  it('matches show name', () => {
    expect(matchesPerformanceSearch(performance, 'atlanta show')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(matchesPerformanceSearch(performance, 'FAYE')).toBe(true);
  });

  it('returns false when nothing matches', () => {
    expect(matchesPerformanceSearch(performance, 'metal')).toBe(false);
  });
});