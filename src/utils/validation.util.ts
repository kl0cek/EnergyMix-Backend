export const MIN_WINDOW_HOURS = 1;
export const MAX_WINDOW_HOURS = 6;

export type WindowHoursResult =
  | { ok: true; value: number }
  | { ok: false; message: string };

export function parseWindowHours(raw: unknown): WindowHoursResult {
  if (raw === undefined || raw === null || raw === '') {
    return { ok: false, message: 'Query parameter "hours" is required.' };
  }

  const value = Number(raw);

  if (!Number.isInteger(value)) {
    return { ok: false, message: 'Query parameter "hours" must be an integer.' };
  }

  if (value < MIN_WINDOW_HOURS || value > MAX_WINDOW_HOURS) {
    return {
      ok: false,
      message: `Query parameter "hours" must be between ${MIN_WINDOW_HOURS} and ${MAX_WINDOW_HOURS}.`,
    };
  }

  return { ok: true, value };
}
