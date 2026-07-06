import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGeneration } from '../../services/carbonIntensity.service';
import {
  getDailyEnergyMix,
  getOptimalChargingWindow,
} from '../../services/energy.service';
import type { GenerationPeriod } from '../../types/carbonIntensity.types';

vi.mock('../../services/carbonIntensity.service', () => ({
  fetchGeneration: vi.fn(),
}));

const fetchGenerationMock = vi.mocked(fetchGeneration);

function period(from: string, to: string, cleanPct: number): GenerationPeriod {
  return {
    from,
    to,
    generationmix: [
      { fuel: 'wind', perc: cleanPct },
      { fuel: 'gas', perc: 100 - cleanPct },
    ],
  };
}

beforeEach(() => {
  fetchGenerationMock.mockReset();
});

describe('getDailyEnergyMix', () => {
  it('given periods across three London days, when aggregated, then returns one averaged entry per day', async () => {
    const now = new Date('2026-07-06T12:00:00Z');
    fetchGenerationMock.mockResolvedValue([
      period('2026-07-06T10:00:00Z', '2026-07-06T10:30:00Z', 60),
      period('2026-07-06T10:30:00Z', '2026-07-06T11:00:00Z', 80),
      period('2026-07-07T10:00:00Z', '2026-07-07T10:30:00Z', 50),
    ]);

    const result = await getDailyEnergyMix(now);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      date: '2026-07-06',
      intervals: 2,
      cleanEnergyPercent: 70,
    });
    expect(result[1]).toMatchObject({
      date: '2026-07-07',
      intervals: 1,
      cleanEnergyPercent: 50,
    });
  });

  it('given a day with no data, when aggregated, then that day reports zero intervals', async () => {
    const now = new Date('2026-07-06T12:00:00Z');
    fetchGenerationMock.mockResolvedValue([
      period('2026-07-06T10:00:00Z', '2026-07-06T10:30:00Z', 60),
    ]);

    const result = await getDailyEnergyMix(now);

    expect(result[2]).toMatchObject({
      date: '2026-07-08',
      intervals: 0,
      cleanEnergyPercent: 0,
    });
  });
});

describe('getOptimalChargingWindow', () => {
  it('given a forecast series, when searching, then returns the window with the highest average clean energy', async () => {
    fetchGenerationMock.mockResolvedValue([
      period('2026-07-06T00:00:00Z', '2026-07-06T00:30:00Z', 30),
      period('2026-07-06T00:30:00Z', '2026-07-06T01:00:00Z', 40),
      period('2026-07-06T01:00:00Z', '2026-07-06T01:30:00Z', 90),
      period('2026-07-06T01:30:00Z', '2026-07-06T02:00:00Z', 95),
      period('2026-07-06T02:00:00Z', '2026-07-06T02:30:00Z', 20),
    ]);

    const result = await getOptimalChargingWindow(1);

    expect(result.start).toBe('2026-07-06T01:00:00Z');
    expect(result.end).toBe('2026-07-06T02:00:00Z');
    expect(result.averageCleanEnergyPercent).toBe(92.5);
    expect(result.windowHours).toBe(1);
    expect(result.series).toHaveLength(5);
    expect(result.series[0]).toEqual({
      time: '2026-07-06T00:00:00Z',
      cleanPercent: 30,
    });
  });

  it('given fewer intervals than the window needs, when searching, then throws', async () => {
    fetchGenerationMock.mockResolvedValue([
      period('2026-07-06T00:00:00Z', '2026-07-06T00:30:00Z', 50),
    ]);

    await expect(getOptimalChargingWindow(1)).rejects.toThrow(
      /Not enough forecast data/,
    );
  });
});
