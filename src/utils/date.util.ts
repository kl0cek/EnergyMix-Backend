export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function toApiDateTime(date: Date): string {
  return `${date.toISOString().slice(0, 16)}Z`;
}

export function floorToHalfHour(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCMinutes(copy.getUTCMinutes() < 30 ? 0 : 30, 0, 0);
  return copy;
}

export const LONDON_TIME_ZONE = 'Europe/London';

// Calendar date (YYYY-MM-DD) of the timestamp in the given time zone (UK by default)
export function toDateKey(isoTimestamp: string, timeZone: string = LONDON_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoTimestamp));
}
