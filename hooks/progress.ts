import { useProgressStore } from '../stores/progressStore';

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

export function useDailyGoalToday(): DailyGoal {
  const today = new Date().toISOString().split('T')[0];
  const didActivityToday = useProgressStore((s) => Boolean(s.weeklyActivity[today]));
  return didActivityToday ? DONE_GOAL : ZERO_GOAL;
}
