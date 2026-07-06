import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache, withCache } from '../../utils/cache.util';

describe('withCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('given a fresh key, when requested twice within TTL, then the producer runs once', async () => {
    const producer = vi.fn().mockResolvedValue(42);

    const first = await withCache('key', 1000, producer);
    const second = await withCache('key', 1000, producer);

    expect(first).toBe(42);
    expect(second).toBe(42);
    expect(producer).toHaveBeenCalledTimes(1);
  });

  it('given an expired entry, when requested again, then the producer runs again', async () => {
    const producer = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    const first = await withCache('key', 1000, producer);
    vi.advanceTimersByTime(1001);
    const second = await withCache('key', 1000, producer);

    expect(first).toBe(1);
    expect(second).toBe(2);
    expect(producer).toHaveBeenCalledTimes(2);
  });

  it('given different keys, when requested, then each runs its own producer', async () => {
    const producer = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b');

    const a = await withCache('a', 1000, producer);
    const b = await withCache('b', 1000, producer);

    expect(a).toBe('a');
    expect(b).toBe('b');
    expect(producer).toHaveBeenCalledTimes(2);
  });
});
