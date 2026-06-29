import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  fetchQuickQuizItemsByLessonNo,
  type QuickQuizItem,
} from '../../services/api/games/quickQuiz';
import { recordGameAttemptResilient } from '../../services/progress/syncQueue';

/**
 * Fetch all quick_quiz_items for one lesson, ordered by sort_order.
 * Stale time 1h — lesson content is near-static.
 */
export function useQuickQuizItems(lessonNo: number | null | undefined) {
  return useQuery<QuickQuizItem[]>({
    queryKey: ['quick-quiz-items', lessonNo ?? 0],
    queryFn: () => fetchQuickQuizItemsByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Record one per-item attempt via the record_quick_quiz_attempt RPC.
 * Personal-best on the server side. Quick Quiz now counts toward the
 * content-derived overall rollup, so this invalidates ['game-mastery', userId]
 * to refresh the headline %. Retries transient failures (audit H4).
 */
export function useRecordQuickQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['recordQuickQuizAttempt'],
    retry: 2,
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordGameAttemptResilient('quick_quiz', itemId, isCorrect),
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['game-mastery', userId] });
      }
    },
  });
}
