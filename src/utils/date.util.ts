export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function toApiDateTime(date: Date): string {
  return `${date.toISOString().slice(0, 16)}Z`;
}

export function toDateKey(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10);
}
