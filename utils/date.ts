/**
 * Local-calendar date helpers for streaks and per-day activity (audit H3).
 *
 * Streaks and daily rings must roll over at the user's local midnight, not
 * UTC midnight. `toISOString()` returns UTC, so for IST (UTC+5:30) — the whole
 * target audience — activity between 00:00 and 05:30 local was being attributed
 * to the previous day, breaking streaks the user believed they kept. Always
 * derive the day from local calendar fields instead.
 */

/** `YYYY-MM-DD` for the given date in the device's local timezone (today by default). */
export function localDateISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Local `YYYY-MM-DD` for the day before `date` (today by default). */
export function localYesterdayISO(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return localDateISO(d);
}
