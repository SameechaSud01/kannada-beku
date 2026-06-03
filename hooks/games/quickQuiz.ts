import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchQuickQuizItemsByLessonNo,
  recordQuickQuizAttempt,
  type QuickQuizItem,
} from '../../services/api/games/quickQuiz';

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
 * Personal-best on the server side. Quick Quiz is excluded from the locked
 * user_overall_progress formula, so this intentionally does NOT invalidate
 * the ['overall-progress', userId] query.
 */
export function useRecordQuickQuizAttempt() {
  return useMutation({
    mutationKey: ['recordQuickQuizAttempt'],
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordQuickQuizAttempt(itemId, isCorrect),
  });
}
