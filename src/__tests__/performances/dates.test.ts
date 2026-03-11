import {
  parseStoredDate,
  formatStoredDate,
  compareStoredDatesAsc,
  compareStoredDatesDesc,
} from '../../features/performances/utils/dates';

describe('dates utils', () => {
  it('parses a stored date into a Date object', () => {
    const result = parseStoredDate('04-21-26');

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(21);
  });

  it('formats a Date into stored format', () => {
    expect(formatStoredDate(new Date(2026, 3, 21))).toBe('04-21-26');
  });

  it('sorts descending by stored date', () => {
    expect(compareStoredDatesDesc('04-20-26', '04-21-26')).toBeGreaterThan(0);
    expect(compareStoredDatesDesc('04-21-26', '04-20-26')).toBeLessThan(0);
  });

  it('sorts ascending by stored date', () => {
    expect(compareStoredDatesAsc('04-20-26', '04-21-26')).toBeLessThan(0);
    expect(compareStoredDatesAsc('04-21-26', '04-20-26')).toBeGreaterThan(0);
  });

  it('handles 1900s year parsing correctly for values >= 70', () => {
    const result = parseStoredDate('04-21-70');
    expect(result.getFullYear()).toBe(1970);
  });
});