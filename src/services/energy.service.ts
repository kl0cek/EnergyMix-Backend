import { fetchGeneration } from './carbonIntensity.service';
import { addDays, startOfUtcDay, toDateKey } from '../utils/date.util';
import {
  averageDailyMix,
  cleanEnergyPercent,
  groupByDate,
  round,
  sumRange,
} from '../utils/energy.util';
import type { ChargingWindow, DailyEnergyMix } from '../types/energy.types';

const HALF_HOURS_PER_HOUR = 2;
const MIX_DAYS = 3;
const WINDOW_DAYS = 2;

export async function getDailyEnergyMix(now: Date = new Date()): Promise<DailyEnergyMix[]> {
  // Fetch a day earlier so the first UK hours (which fall on the previous UTC day during BST) are included, then group by London calendar date
  const from = addDays(startOfUtcDay(now), -1);
  const to = addDays(startOfUtcDay(now), MIX_DAYS);

  const periods = await fetchGeneration(from, to);
  const byDate = groupByDate(periods);

  const days: DailyEnergyMix[] = [];
  for (let i = 0; i < MIX_DAYS; i += 1) {
    const dateKey = toDateKey(addDays(now, i).toISOString());
    days.push(averageDailyMix(dateKey, byDate.get(dateKey) ?? []));
  }

  return days;
}

// Looks forward 48h from now (rest of today + next two days of forecast
export async function getOptimalChargingWindow(
  windowHours: number,
  now: Date = new Date()
): Promise<ChargingWindow> {
  const from = now;
  const to = addDays(now, WINDOW_DAYS);

  const periods = await fetchGeneration(from, to);
  const sorted = [...periods].sort((a, b) => a.from.localeCompare(b.from));

  const windowSize = windowHours * HALF_HOURS_PER_HOUR;
  if (sorted.length < windowSize) {
    throw new Error(`Not enough forecast data to evaluate a ${windowHours}h window.`);
  }

  const cleanSeries = sorted.map((period) => cleanEnergyPercent(period.generationmix));

  let bestStart = 0;
  let bestSum = sumRange(cleanSeries, 0, windowSize);
  let runningSum = bestSum;

  for (let start = 1; start + windowSize <= sorted.length; start += 1) {
    runningSum += cleanSeries[start + windowSize - 1] - cleanSeries[start - 1];
    if (runningSum > bestSum) {
      bestSum = runningSum;
      bestStart = start;
    }
  }

  return {
    windowHours,
    start: sorted[bestStart].from,
    end: sorted[bestStart + windowSize - 1].to,
    averageCleanEnergyPercent: round(bestSum / windowSize),
    series: sorted.map((period, i) => ({
      time: period.from,
      cleanPercent: round(cleanSeries[i]),
    })),
  };
}
