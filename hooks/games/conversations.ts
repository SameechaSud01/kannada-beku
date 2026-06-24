import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';
import { formatFirstName } from '../../utils/formatName';
import { personalizeScenarios } from '../../utils/personalize';
import {
  fetchConversationScenariosByLessonNo,
  recordConversationAttempt,
  type ConversationScenario,
} from '../../services/api/games/conversations';

/**
 * Fetch a lesson's conversation scenarios (with grouped turns).
 * Stale time 1h — dialogue content is near-static.
 *
 * Self-introduction replies authored with a `[name]` placeholder (e.g. "I am
 * [name]") are resolved to the learner's onboarding name here, mirroring the
 * lesson runner. Falls back to "Priya" for the rare nameless case.
 */
export function useConversationScenarios(lessonNo: number | null | undefined) {
  const firstName = useUserStore((s) => formatFirstName(s.displayName, 'Priya'));
  return useQuery<ConversationScenario[]>({
    queryKey: ['conversation-scenarios', lessonNo ?? 0],
    queryFn: () => fetchConversationScenariosByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
    select: (data) => personalizeScenarios(data, firstName),
  });
}

/**
 * Record one per-turn attempt via the record_conversation_attempt RPC.
 * Conversations now counts toward the content-derived overall rollup, so this
 * invalidates ['game-mastery', userId] to refresh the headline %. Retries
 * transient failures (audit H4).
 */
export function useRecordConversationAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['recordConversationAttempt'],
    retry: 2,
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordConversationAttempt(itemId, isCorrect),
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['game-mastery', userId] });
      }
    },
  });
}
