export const FUEL_TYPES = [
  'biomass',
  'coal',
  'imports',
  'gas',
  'nuclear',
  'other',
  'hydro',
  'solar',
  'wind',
] as const;

export type FuelType = (typeof FUEL_TYPES)[number];

export interface GenerationMixEntry {
  fuel: FuelType;
  perc: number;
}

export interface GenerationPeriod {
  from: string;
  to: string;
  generationmix: GenerationMixEntry[];
}

export interface CarbonIntensityGenerationResponse {
  data: GenerationPeriod[];
}
