import { sortPerformances } from '../../features/performances/utils/performanceSort';
import { Performance } from '../../features/performances/types/performance';

const performances: Performance[] = [
  {
    id: '1',
    artist: 'B Artist',
    venue: '',
    city: '',
    date: '04-20-26',
    tag: '',
    genre: '',
    subGenre: '',
    showId: 'show-1',
    showName: 'Show 1',
  },
  {
    id: '2',
    artist: 'A Artist',
    venue: '',
    city: '',
    date: '04-21-26',
    tag: '',
    genre: '',
    subGenre: '',
    showId: 'show-2',
    showName: 'Show 2',
  },
  {
    id: '3',
    artist: 'C Artist',
    venue: '',
    city: '',
    date: '04-19-26',
    tag: '',
    genre: '',
    subGenre: '',
    showId: 'show-3',
    showName: 'Show 3',
  },
];

describe('sortPerformances', () => {
  it('sorts by newest first', () => {
    const result = sortPerformances(performances, 'newest');

    expect(result.map((item) => item.id)).toEqual(['2', '1', '3']);
  });

  it('sorts by oldest first', () => {
    const result = sortPerformances(performances, 'oldest');

    expect(result.map((item) => item.id)).toEqual(['3', '1', '2']);
  });

  it('sorts alphabetically by artist', () => {
    const result = sortPerformances(performances, 'artist');

    expect(result.map((item) => item.artist)).toEqual([
      'A Artist',
      'B Artist',
      'C Artist',
    ]);
  });

  it('does not mutate the original array', () => {
    const original = [...performances];

    sortPerformances(performances, 'newest');

    expect(performances).toEqual(original);
  });
});