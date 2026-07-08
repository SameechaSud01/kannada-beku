/**
 * Bound the persisted `weeklyActivity` map (spec_scalability_offline_fixes
 * Phase 4). It gains one ISO-date key per active day and was never pruned;
 * only the trailing week is ever read (useWeekActivity), so anything older
 * than the keep-window is dead weight in AsyncStorage.
 */

export const WEEKLY_ACTIVITY_KEEP_DAYS = 60;

/**
 * Drop entries older than `keepDays` before `todayISO` (keys are YYYY-MM-DD,
 * so lexicographic compare is date order). Returns the input object unchanged
 * (same reference) when nothing needs pruning, so callers can skip a write.
 */
export function pruneWeeklyActivity(
  activity: Record<string, boolean>,
  todayISO: string,
  keepDays: number = WEEKLY_ACTIVITY_KEEP_DAYS,
): Record<string, boolean> {
  const cutoff = new Date(`${todayISO}T00:00:00`);
  cutoff.setDate(cutoff.getDate() - keepDays);
  const cutoffISO = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;

  const stale = Object.keys(activity).some((k) => k < cutoffISO);
  if (!stale) return activity;

  const pruned: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(activity)) {
    if (k >= cutoffISO) pruned[k] = v;
  }
  return pruned;
}
