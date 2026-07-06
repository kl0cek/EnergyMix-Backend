import { describe, expect, it } from 'vitest';
import {
  averageDailyMix,
  cleanEnergyPercent,
  emptyMix,
  round,
  sumRange,
} from '../../utils/energy.util';
import type {
  GenerationMixEntry,
  GenerationPeriod,
} from '../../types/carbonIntensity.types';

function period(from: string, cleanPct: number): GenerationPeriod {
  const mix: GenerationMixEntry[] = [
    { fuel: 'wind', perc: cleanPct },
    { fuel: 'gas', perc: 100 - cleanPct },
  ];
  return { from, to: from, generationmix: mix };
}

describe('cleanEnergyPercent', () => {
  it('given a mix of clean and fossil fuels, when summed, then only clean sources count', () => {
    const mix: GenerationMixEntry[] = [
      { fuel: 'wind', perc: 20 },
      { fuel: 'nuclear', perc: 15 },
      { fuel: 'solar', perc: 5 },
      { fuel: 'gas', perc: 55 },
      { fuel: 'coal', perc: 5 },
    ];

    const result = cleanEnergyPercent(mix);

    expect(result).toBe(40);
  });

  it('given an empty mix, when summed, then returns 0', () => {
    expect(cleanEnergyPercent([])).toBe(0);
  });
});

describe('emptyMix', () => {
  it('given no input, when created, then every fuel type is zero-initialised', () => {
    const result = emptyMix();

    expect(result).toEqual({
      biomass: 0,
      coal: 0,
      imports: 0,
      gas: 0,
      nuclear: 0,
      other: 0,
      hydro: 0,
      solar: 0,
      wind: 0,
    });
  });
});

describe('round', () => {
  it('given a long decimal, when rounded, then keeps two places by default', () => {
    expect(round(1.23456)).toBe(1.23);
  });

  it('given a repeating decimal, when rounded, then rounds half up', () => {
    expect(round(70 / 3)).toBe(23.33);
  });

  it('given a decimals argument of 0, when rounded, then returns an integer', () => {
    expect(round(23.7, 0)).toBe(24);
  });
});

describe('sumRange', () => {
  it('given an array, a start and a size, when summed, then adds only that slice', () => {
    const values = [10, 20, 30, 40, 50];

    const result = sumRange(values, 1, 3);

    expect(result).toBe(90);
  });
});

describe('averageDailyMix', () => {
  it('given periods with known mixes, when averaged, then returns per-fuel averages and clean percent', () => {
    const periods = [
      period('2026-07-06T10:00:00Z', 60),
      period('2026-07-06T10:30:00Z', 80),
    ];

    const result = averageDailyMix('2026-07-06', periods);

    expect(result.date).toBe('2026-07-06');
    expect(result.intervals).toBe(2);
    expect(result.cleanEnergyPercent).toBe(70);
    expect(result.generationMix.wind).toBe(70);
    expect(result.generationMix.gas).toBe(30);
  });

  it('given no periods, when averaged, then reports zeros', () => {
    const result = averageDailyMix('2026-07-08', []);

    expect(result.intervals).toBe(0);
    expect(result.cleanEnergyPercent).toBe(0);
    expect(result.generationMix.wind).toBe(0);
  });
});
