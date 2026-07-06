import { describe, expect, it } from 'vitest';
import {
  addDays,
  startOfUtcDay,
  toApiDateTime,
  toDateKey,
} from '../../utils/date.util';

describe('startOfUtcDay', () => {
  it('given a timestamp with time-of-day, when normalised, then returns midnight UTC of the same date', () => {
    const input = new Date('2026-07-06T14:23:45.123Z');

    const result = startOfUtcDay(input);

    expect(result.toISOString()).toBe('2026-07-06T00:00:00.000Z');
  });

  it('given a date, when normalised, then the original is not mutated', () => {
    const input = new Date('2026-07-06T14:00:00.000Z');

    startOfUtcDay(input);

    expect(input.toISOString()).toBe('2026-07-06T14:00:00.000Z');
  });
});

describe('addDays', () => {
  it('given a date, when adding two days, then advances by 48h', () => {
    const input = new Date('2026-07-06T12:00:00.000Z');

    const result = addDays(input, 2);

    expect(result.toISOString()).toBe('2026-07-08T12:00:00.000Z');
  });

  it('given a date, when adding a negative offset, then goes back in time', () => {
    const input = new Date('2026-07-06T12:00:00.000Z');

    const result = addDays(input, -1);

    expect(result.toISOString()).toBe('2026-07-05T12:00:00.000Z');
  });

  it('given a date, when adding days, then the original is not mutated', () => {
    const input = new Date('2026-07-06T12:00:00.000Z');

    addDays(input, 5);

    expect(input.toISOString()).toBe('2026-07-06T12:00:00.000Z');
  });
});

describe('toApiDateTime', () => {
  it('given a date, when formatted, then returns YYYY-MM-DDTHH:mmZ (minute precision)', () => {
    const input = new Date('2026-07-06T14:23:45.123Z');

    const result = toApiDateTime(input);

    expect(result).toBe('2026-07-06T14:23Z');
  });
});

describe('toDateKey', () => {
  it('given a midday UTC timestamp, when keyed by London date, then returns that calendar date', () => {
    const result = toDateKey('2026-07-06T12:00:00Z');

    expect(result).toBe('2026-07-06');
  });

  it('given a late-evening UTC timestamp during BST, when keyed by London date, then rolls over to the next day', () => {
    // 23:30 UTC in July is 00:30 BST the following day.
    const result = toDateKey('2026-07-05T23:30:00Z');

    expect(result).toBe('2026-07-06');
  });

  it('given a late-evening UTC timestamp during GMT (winter), when keyed by London date, then stays on the same day', () => {
    const result = toDateKey('2026-01-15T23:30:00Z');

    expect(result).toBe('2026-01-15');
  });

  it('given an explicit UTC time zone, when keyed, then uses UTC boundaries instead of London', () => {
    const result = toDateKey('2026-07-05T23:30:00Z', 'UTC');

    expect(result).toBe('2026-07-05');
  });
});
