import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserStore } from '../../stores/useUserStore';
import { formatFirstName } from '../../utils/formatName';
import { personalizeScenarios } from '../../utils/personalize';
import {
  fetchConversationScenariosByLessonNo,
  type ConversationScenario,
} from '../../services/api/games/conversations';
import { recordGameAttemptResilient } from '../../services/progress/syncQueue';
import { markMasteryDirty } from '../../services/progress/masteryRefresh';

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
 * Conversations counts toward the content-derived overall rollup, so this
 * marks it dirty — the headline % refetches once at game end (masteryRefresh).
 * Retries transient failures (audit H4).
 */
export function useRecordConversationAttempt() {
  return useMutation({
    mutationKey: ['recordConversationAttempt'],
    retry: 2,
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordGameAttemptResilient('conversation', itemId, isCorrect),
    onSuccess: () => {
      markMasteryDirty();
    },
  });
}
