import { describe, expect, it } from 'vitest';
import { parseWindowHours } from '../../utils/validation.util';

describe('parseWindowHours', () => {
  it('given a valid numeric string, when parsed, then succeeds with the number', () => {
    const result = parseWindowHours('3');

    expect(result).toEqual({ ok: true, value: 3 });
  });

  it('given the boundary values 1 and 6, when parsed, then both succeed', () => {
    expect(parseWindowHours('1')).toEqual({ ok: true, value: 1 });
    expect(parseWindowHours('6')).toEqual({ ok: true, value: 6 });
  });

  it('given a value below the range, when parsed, then fails', () => {
    const result = parseWindowHours('0');

    expect(result.ok).toBe(false);
  });

  it('given a value above the range, when parsed, then fails', () => {
    const result = parseWindowHours('7');

    expect(result.ok).toBe(false);
  });

  it('given a non-integer string, when parsed, then fails', () => {
    expect(parseWindowHours('abc').ok).toBe(false);
    expect(parseWindowHours('2.5').ok).toBe(false);
  });

  it('given a missing value, when parsed, then reports it is required', () => {
    const result = parseWindowHours(undefined);

    expect(result).toEqual({
      ok: false,
      message: 'Query parameter "hours" is required.',
    });
  });
});
