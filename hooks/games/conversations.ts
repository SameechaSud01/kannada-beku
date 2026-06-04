import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchConversationScenariosByLessonNo,
  recordConversationAttempt,
  type ConversationScenario,
} from '../../services/api/games/conversations';

/**
 * Fetch a lesson's conversation scenarios (with grouped turns).
 * Stale time 1h — dialogue content is near-static.
 */
export function useConversationScenarios(lessonNo: number | null | undefined) {
  return useQuery<ConversationScenario[]>({
    queryKey: ['conversation-scenarios', lessonNo ?? 0],
    queryFn: () => fetchConversationScenariosByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Record one per-turn attempt via the record_conversation_attempt RPC.
 * Conversations is excluded from the locked user_overall_progress formula,
 * so this intentionally does NOT invalidate ['overall-progress', userId].
 */
export function useRecordConversationAttempt() {
  return useMutation({
    mutationKey: ['recordConversationAttempt'],
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordConversationAttempt(itemId, isCorrect),
  });
}
