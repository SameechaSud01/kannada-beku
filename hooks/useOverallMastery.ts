import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { useProgressStore } from '../stores/progressStore';
import { fetchGameMasteryByLesson, type GameMasteryByLesson } from '../services/api/gameMastery';
import { computeOverallMastery, type OverallMastery } from '../services/progress/overallMastery';

/**
 * Client-side overall progress (per-lesson mastery rollup). Replaces
 * useOverallProgress, which read the server-trigger `user_overall_progress`
 * row. The "learn" half comes from the local progress store (lesson + part
 * completion); the "doing" half is fetched once per minute from the games'
 * `*_progress` tables (read-only) and combined by computeOverallMastery.
 */
export function useOverallMastery(): OverallMastery & { isLoading: boolean } {
  const userId = useAuthStore((s) => s.user?.id);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedParts = useProgressStore((s) => s.completedParts);

  const { data, isLoading } = useQuery<GameMasteryByLesson>({
    queryKey: ['game-mastery', userId ?? ''],
    queryFn: () => fetchGameMasteryByLesson(userId as string),
    enabled: !!userId,
    staleTime: Infinity,
  });

  const result = useMemo(
    () => computeOverallMastery(completedLessons, completedParts, data ?? {}),
    [completedLessons, completedParts, data],
  );

  return { ...result, isLoading };
}
