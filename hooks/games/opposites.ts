import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchOppositesItemsByLessonNo,
  type OppositesItem,
} from '../../services/api/games/opposites';
import { recordGameAttemptResilient } from '../../services/progress/syncQueue';
import { markMasteryDirty } from '../../services/progress/masteryRefresh';

/**
 * Fetch all opposites_items for one lesson, ordered by sort_order.
 * Stale time 1h — lesson content is near-static.
 */
export function useOppositesItems(lessonNo: number | null | undefined) {
  return useQuery<OppositesItem[]>({
    queryKey: ['opposites-items', lessonNo ?? 0],
    queryFn: () => fetchOppositesItemsByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Record one per-item attempt via the record_opposites_attempt RPC.
 * Personal-best on the server side; marks the content-derived overall %
 * dirty — it refetches once at game end (see masteryRefresh). Retries
 * transient failures (audit H4).
 */
export function useRecordOppositesAttempt() {
  return useMutation({
    mutationKey: ['recordOppositesAttempt'],
    retry: 2,
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordGameAttemptResilient('opposites', itemId, isCorrect),
    onSuccess: () => {
      markMasteryDirty();
    },
  });
}
