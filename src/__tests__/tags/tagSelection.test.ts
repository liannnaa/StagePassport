import {
  addUniqueTag,
  hasTag,
  removeTag,
} from '../../features/tags/utils/tagSelection';

describe('tagSelection', () => {
  describe('hasTag', () => {
    it('returns true for an exact tag match', () => {
      expect(hasTag(['favorite', 'outdoor'], 'favorite')).toBe(true);
    });

    it('returns true for case-insensitive matches', () => {
      expect(hasTag(['Favorite'], 'favorite')).toBe(true);
    });

    it('returns true when tags have extra whitespace', () => {
      expect(hasTag(['  Favorite  '], ' favorite ')).toBe(true);
    });

    it('returns false when the tag is not present', () => {
      expect(hasTag(['favorite'], 'outdoor')).toBe(false);
    });

    it('returns false for an empty tag list', () => {
      expect(hasTag([], 'favorite')).toBe(false);
    });
  });

  describe('addUniqueTag', () => {
    it('adds a new tag when it does not already exist', () => {
      expect(addUniqueTag(['favorite'], 'outdoor')).toEqual([
        'favorite',
        'outdoor',
      ]);
    });

    it('does not add a duplicate tag with the same casing', () => {
      const tags = ['favorite'];

      expect(addUniqueTag(tags, 'favorite')).toBe(tags);
      expect(addUniqueTag(tags, 'favorite')).toEqual(['favorite']);
    });

    it('does not add a duplicate tag with different casing or whitespace', () => {
      const tags = [' Favorite '];

      expect(addUniqueTag(tags, 'favorite')).toBe(tags);
      expect(addUniqueTag(tags, 'favorite')).toEqual([' Favorite ']);
    });
  });

  describe('removeTag', () => {
    it('removes a matching tag', () => {
      expect(removeTag(['favorite', 'outdoor'], 'favorite')).toEqual([
        'outdoor',
      ]);
    });

    it('removes matching tags case-insensitively', () => {
      expect(removeTag(['Favorite', 'outdoor'], 'favorite')).toEqual([
        'outdoor',
      ]);
    });

    it('removes matching tags even with extra whitespace', () => {
      expect(removeTag(['  Favorite  ', 'outdoor'], ' favorite ')).toEqual([
        'outdoor',
      ]);
    });

    it('keeps tags that do not match', () => {
      expect(removeTag(['favorite', 'outdoor'], 'indoor')).toEqual([
        'favorite',
        'outdoor',
      ]);
    });

    it('removes all matching duplicate tags', () => {
      expect(removeTag(['Favorite', 'favorite', 'outdoor'], 'favorite')).toEqual([
        'outdoor',
      ]);
    });
  });
});