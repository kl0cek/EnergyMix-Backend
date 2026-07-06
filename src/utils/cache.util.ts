interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function withCache<T>(
  key: string,
  ttlMs: number,
  produce: () => Promise<T>
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }

  const value = await produce();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function clearCache(): void {
  store.clear();
}
