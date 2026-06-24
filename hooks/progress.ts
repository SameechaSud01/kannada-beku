import { useMemo } from 'react';
import { useProgressStore } from '../stores/progressStore';
import {
  DAILY_LISTEN_TARGET,
  DAILY_SPEAK_TARGET,
  DAILY_PRACTICE_TARGET,
} from '../constants/goals';
import { localDateISO } from '../utils/date';

type DailyGoal = Readonly<{ completed: number; target: number }>;

const ZERO_GOAL: DailyGoal = Object.freeze({ completed: 0, target: 1 });
const DONE_GOAL: DailyGoal = Object.freeze({ completed: 1, target: 1 });

export function useStreak(): number {
  return useProgressStore((s) => s.streak);
}

export function useWordsLearned(): number {
  return useProgressStore((s) => s.totalPhrasesLearned);
}

export function useCompletedLessons(): string[] {
  return useProgressStore((s) => s.completedLessons);
}

export function useXp(): number {
  return useProgressStore((s) => s.xp);
}

export function useMinutesPracticed(): number {
  return useProgressStore((s) => s.totalMinutesPracticed);
}

export function useDailyGoalToday(): DailyGoal {
  const today = localDateISO();
  const didActivityToday = useProgressStore((s) => Boolean(s.weeklyActivity[today]));
  return didActivityToday ? DONE_GOAL : ZERO_GOAL;
}

/** One Listen/Speak/Practice ring: today's count, its target, and the clamped fraction. */
export type DailyDimension = Readonly<{ value: number; target: number; frac: number }>;

export type DailyGoalProgress = Readonly<{
  listen: DailyDimension;
  speak: DailyDimension;
  practice: DailyDimension;
  /** True once all three dimensions have met their target. */
  complete: boolean;
}>;

const dimension = (value: number, target: number): DailyDimension => ({
  value,
  target,
  frac: target > 0 ? Math.max(0, Math.min(1, value / target)) : 0,
});

/**
 * Canonical daily-goal source of truth for every daily surface (Home rings,
 * goal-complete celebration, profile summary). Reads the local per-day activity
 * tally; counts from a previous day read as zero until the next activity rolls
 * them over, so the rings empty correctly at midnight.
 */
export function useDailyGoal(): DailyGoalProgress {
  const activity = useProgressStore((s) => s.dailyActivity);
  const today = localDateISO();
  return useMemo(() => {
    const fresh = activity.date === today;
    const listen = dimension(fresh ? activity.listen : 0, DAILY_LISTEN_TARGET);
    const speak = dimension(fresh ? activity.speak : 0, DAILY_SPEAK_TARGET);
    const practice = dimension(fresh ? activity.practice : 0, DAILY_PRACTICE_TARGET);
    return {
      listen,
      speak,
      practice,
      complete: listen.frac >= 1 && speak.frac >= 1 && practice.frac >= 1,
    };
  }, [activity, today]);
}
