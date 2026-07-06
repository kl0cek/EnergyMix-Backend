import { toApiDateTime } from '../utils/date.util';
import { withCache } from '../utils/cache.util';
import type {
  CarbonIntensityGenerationResponse,
  GenerationPeriod,
} from '../types/carbonIntensity.types';

const REQUEST_TIMEOUT_MS = 10000;
// Source data changes every half hour; cache briefly to avoid hammering it.
const CACHE_TTL_MS = 5 * 60 * 1000;

async function requestGeneration(url: string): Promise<GenerationPeriod[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error('Failed to reach the Carbon Intensity API.', {
      cause: err,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Carbon Intensity API responded with status ${response.status}.`);
  }

  const body = (await response.json()) as CarbonIntensityGenerationResponse;

  if (!Array.isArray(body?.data)) {
    throw new Error('Carbon Intensity API returned an unexpected payload.');
  }

  return body.data;
}

export async function fetchGeneration(from: Date, to: Date): Promise<GenerationPeriod[]> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error('API_URL environment variable is not set.');
  }

  const url = `${baseUrl}/generation/${toApiDateTime(from)}/${toApiDateTime(to)}`;

  return withCache(url, CACHE_TTL_MS, () => requestGeneration(url));
}
