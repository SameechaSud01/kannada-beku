import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  fetchOppositesItemsByLessonNo,
  type OppositesItem,
} from '../../services/api/games/opposites';
import { recordGameAttemptResilient } from '../../services/progress/syncQueue';

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
 * Personal-best on the server side; invalidates ['game-mastery', userId] so the
 * content-derived overall % refreshes on next read. Retries transient
 * failures (audit H4).
 */
export function useRecordOppositesAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['recordOppositesAttempt'],
    retry: 2,
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordGameAttemptResilient('opposites', itemId, isCorrect),
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['game-mastery', userId] });
      }
    },
  });
}
