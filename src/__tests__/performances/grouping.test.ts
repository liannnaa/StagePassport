import {
  groupPerformancesByArtist,
  groupPerformancesByShowId,
} from '../../features/performances/utils/grouping';
import { Performance } from '../../features/performances/types/performance';

const performances: Performance[] = [
  {
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
  },
  {
    id: '2',
    artist: 'Faye Webster',
    venue: 'Fox Theatre',
    city: 'Atlanta',
    date: '04-21-26',
    tag: 'Festival',
    genre: 'Indie',
    subGenre: 'Indie Pop',
    showId: 'atlanta-show-04-21-26',
    showName: 'Atlanta Show',
  },
  {
    id: '3',
    artist: 'Mitski',
    venue: 'The Eastern',
    city: 'Atlanta',
    date: '04-20-26',
    tag: 'Headliner',
    genre: 'Alternative',
    subGenre: 'Indie Rock',
    showId: 'mitski-live-04-20-26',
    showName: 'Mitski Live',
  },
];

describe('groupPerformancesByShowId', () => {
  it('groups performances by show id', () => {
    const result = groupPerformancesByShowId(performances);

    expect(result).toHaveLength(2);
    expect(result[0].showId).toBe('atlanta-show-04-21-26');
    expect(result[0].performances).toHaveLength(2);
  });

  it('counts unique artists within a concert group', () => {
    const result = groupPerformancesByShowId(performances);

    expect(result[0].artistCount).toBe(1);
  });

  it('sorts groups by newest date first', () => {
    const result = groupPerformancesByShowId(performances);

    expect(result[0].date).toBe('04-21-26');
    expect(result[1].date).toBe('04-20-26');
  });
});

describe('groupPerformancesByArtist', () => {
  it('groups performances by artist name', () => {
    const result = groupPerformancesByArtist(performances);

    expect(result).toHaveLength(2);

    const fayeGroup = result.find((item) => item.artistName === 'Faye Webster');
    expect(fayeGroup).toBeTruthy();
    expect(fayeGroup?.performances).toHaveLength(2);
  });

  it('calculates performance count for an artist group', () => {
    const result = groupPerformancesByArtist(performances);
    const fayeGroup = result.find((item) => item.artistName === 'Faye Webster');

    expect(fayeGroup?.performanceCount).toBe(2);
  });

  it('uses the latest performance date for latestDate', () => {
    const result = groupPerformancesByArtist(performances);
    const fayeGroup = result.find((item) => item.artistName === 'Faye Webster');

    expect(fayeGroup?.latestDate).toBe('04-21-26');
  });

  it('surfaces genre and subGenre from the grouped performances', () => {
    const result = groupPerformancesByArtist(performances);
    const fayeGroup = result.find((item) => item.artistName === 'Faye Webster');

    expect(fayeGroup?.genre).toBe('Indie');
    expect(fayeGroup?.subGenre).toBe('Indie Pop');
  });
});