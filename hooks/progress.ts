import { useMemo } from 'react';
import { useProgressStore } from '../stores/progressStore';
import { DAILY_LISTEN_TARGET, DAILY_SPEAK_TARGET, DAILY_PRACTICE_TARGET } from '../constants/goals';
import { localDateISO } from '../utils/date';
import { PLANNED_LESSON_SLOTS } from '../constants/lessons/plannedLessons';
import { lessonSlugByNo } from '../constants/lessons/lessonContent';

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

export type CurrentLesson = Readonly<{ slot: number; slug: string; title: string }>;

/**
 * The lesson the learner should continue with: the lowest-numbered planned slot
 * that has authored content and isn't completed yet. `null` once every authored
 * lesson is done. Purely client-side off `PLANNED_LESSON_SLOTS` + the completion
 * set (same source as `useLessons()`), so it needs no DB fetch.
 */
export function useCurrentLesson(): CurrentLesson | null {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  return useMemo(() => {
    for (const slot of PLANNED_LESSON_SLOTS) {
      const slug = lessonSlugByNo(slot.slot);
      if (slug && !completedLessons.includes(slug)) {
        return { slot: slot.slot, slug, title: slot.title };
      }
    }
    return null;
  }, [completedLessons]);
}

/** One cell of the Profile week-view. */
export type WeekDay = Readonly<{ iso: string; label: string; active: boolean; isToday: boolean }>;

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/**
 * Last 7 calendar days (oldest → today) with per-day activity flags, for the
 * Profile week-view. Reads `progressStore.weeklyActivity` (ISO-date keyed); days
 * with no recorded activity read as inactive.
 */
export function useWeekActivity(): WeekDay[] {
  const activity = useProgressStore((s) => s.weeklyActivity);
  const todayIso = localDateISO();
  return useMemo(() => {
    const out: WeekDay[] = [];
    const base = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const iso = localDateISO(d);
      out.push({
        iso,
        label: WEEKDAY_INITIALS[d.getDay()],
        active: Boolean(activity[iso]),
        isToday: iso === todayIso,
      });
    }
    return out;
  }, [activity, todayIso]);
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
