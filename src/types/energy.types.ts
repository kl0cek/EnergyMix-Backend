import type { FuelType } from './carbonIntensity.types';

export type GenerationMix = Record<FuelType, number>;

export interface DailyEnergyMix {
  date: string;
  intervals: number;
  generationMix: GenerationMix;
  cleanEnergyPercent: number;
}

export interface ForecastPoint {
  time: string;
  cleanPercent: number;
}

export interface ChargingWindow {
  windowHours: number;
  start: string;
  end: string;
  averageCleanEnergyPercent: number;
  series: ForecastPoint[];
}
