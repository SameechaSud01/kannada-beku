import { pruneWeeklyActivity, WEEKLY_ACTIVITY_KEEP_DAYS } from '../../utils/pruneWeeklyActivity';

const TODAY = '2026-07-08';

describe('pruneWeeklyActivity', () => {
  it('drops entries older than the keep-window', () => {
    const activity = {
      '2025-01-01': true,
      '2026-03-01': true,
      '2026-07-01': true,
      [TODAY]: true,
    };
    const pruned = pruneWeeklyActivity(activity, TODAY);
    expect(pruned).toEqual({ '2026-07-01': true, [TODAY]: true });
  });

  it('keeps an entry exactly on the cutoff day', () => {
    const activity = { '2026-05-09': true, [TODAY]: true }; // 60 days before 2026-07-08
    expect(pruneWeeklyActivity(activity, TODAY)).toEqual(activity);
  });

  it('returns the same reference when nothing is stale (skips the write)', () => {
    const activity = { '2026-07-05': true, [TODAY]: true };
    expect(pruneWeeklyActivity(activity, TODAY)).toBe(activity);
  });

  it('handles an empty map', () => {
    const empty = {};
    expect(pruneWeeklyActivity(empty, TODAY)).toBe(empty);
  });

  it('respects a custom keep-window', () => {
    const activity = { '2026-07-01': true, [TODAY]: true };
    expect(pruneWeeklyActivity(activity, TODAY, 3)).toEqual({ [TODAY]: true });
  });

  it('default window is 60 days', () => {
    expect(WEEKLY_ACTIVITY_KEEP_DAYS).toBe(60);
  });
});
