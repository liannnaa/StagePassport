import { buildShowId, slugify } from '../../features/performances/utils/showId';

describe('showId utils', () => {
  it('slugifies text', () => {
    expect(slugify('Faye Webster Live')).toBe('faye-webster-live');
  });

  it('removes punctuation while slugifying', () => {
    expect(slugify('Hello, Atlanta!')).toBe('hello-atlanta');
  });

  it('builds a normalized show id from name and date', () => {
    expect(buildShowId('Faye Webster Live', '04-21-26')).toBe(
      'faye-webster-live-04-21-26'
    );
  });
});