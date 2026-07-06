import type {
  FuelType,
  GenerationMixEntry,
  GenerationPeriod,
} from '../types/carbonIntensity.types';
import { FUEL_TYPES } from '../types/carbonIntensity.types';
import type { DailyEnergyMix, GenerationMix } from '../types/energy.types';
import { toDateKey } from './date.util';

export const CLEAN_FUELS: readonly FuelType[] = ['biomass', 'nuclear', 'hydro', 'wind', 'solar'];

export function cleanEnergyPercent(mix: GenerationMixEntry[]): number {
  return mix
    .filter((entry) => CLEAN_FUELS.includes(entry.fuel))
    .reduce((sum, entry) => sum + entry.perc, 0);
}

export function emptyMix(): GenerationMix {
  return FUEL_TYPES.reduce((acc, fuel) => {
    acc[fuel] = 0;
    return acc;
  }, {} as GenerationMix);
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function sumRange(values: number[], start: number, size: number): number {
  let sum = 0;
  for (let i = start; i < start + size; i += 1) sum += values[i];
  return sum;
}

export function groupByDate(periods: GenerationPeriod[]): Map<string, GenerationPeriod[]> {
  const map = new Map<string, GenerationPeriod[]>();
  for (const period of periods) {
    const key = toDateKey(period.from);
    const bucket = map.get(key);
    if (bucket) bucket.push(period);
    else map.set(key, [period]);
  }
  return map;
}

export function averageDailyMix(date: string, periods: GenerationPeriod[]): DailyEnergyMix {
  const totals = emptyMix();
  let cleanTotal = 0;

  for (const period of periods) {
    for (const entry of period.generationmix) {
      totals[entry.fuel] += entry.perc;
    }
    cleanTotal += cleanEnergyPercent(period.generationmix);
  }

  const count = periods.length;
  const generationMix = emptyMix();
  if (count > 0) {
    for (const fuel of Object.keys(totals) as (keyof typeof totals)[]) {
      generationMix[fuel] = round(totals[fuel] / count);
    }
  }

  return {
    date,
    intervals: count,
    generationMix,
    cleanEnergyPercent: count > 0 ? round(cleanTotal / count) : 0,
  };
}
