import {
  normalizeGenreText,
  buildGenreKey,
  buildSubGenreKey,
} from '../../features/genres/utils/genreKeys';

describe('genreKeys', () => {
  describe('normalizeGenreText', () => {
    it('trims and lowercases text', () => {
      expect(normalizeGenreText('  Indie Pop  ')).toBe('indie pop');
    });

    it('collapses repeated whitespace', () => {
      expect(normalizeGenreText('Indie    Pop')).toBe('indie pop');
    });

    it('returns empty string for empty input', () => {
      expect(normalizeGenreText('   ')).toBe('');
    });
  });

  describe('buildGenreKey', () => {
    it('builds a normalized key for a genre', () => {
      expect(buildGenreKey('  Indie Pop  ')).toBe('indie pop');
    });
  });

  describe('buildSubGenreKey', () => {
    it('builds a combined normalized key from genre and sub-genre', () => {
      expect(buildSubGenreKey('Indie', 'Indie Pop')).toBe('indie|indie pop');
    });

    it('normalizes both genre and sub-genre', () => {
      expect(buildSubGenreKey('  Indie  ', '  Dream   Pop  ')).toBe(
        'indie|dream pop'
      );
    });
  });
});