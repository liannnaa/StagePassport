import { buildBillingKey } from '../../features/billings/utils/billingKeys';

describe('billingKeys', () => {
  it('trims and lowercases billing text', () => {
    expect(buildBillingKey('  Headliner  ')).toBe('headliner');
  });

  it('collapses repeated whitespace', () => {
    expect(buildBillingKey('Very   Special   Guest')).toBe('very special guest');
  });

  it('returns empty string for blank input', () => {
    expect(buildBillingKey('   ')).toBe('');
  });
});