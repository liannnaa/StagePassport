import { buildTagKey } from '../../features/tags/utils/tagKeys';

describe('tagKeys', () => {
  it('trims and lowercases tag text', () => {
    expect(buildTagKey('  Headliner  ')).toBe('headliner');
  });

  it('collapses repeated whitespace', () => {
    expect(buildTagKey('Very   Special   Guest')).toBe('very special guest');
  });

  it('returns empty string for blank input', () => {
    expect(buildTagKey('   ')).toBe('');
  });
});