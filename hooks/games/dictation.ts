import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  fetchDictationItemsByLessonNo,
  type DictationItem,
} from '../../services/api/games/dictation';
import { recordGameAttemptResilient } from '../../services/progress/syncQueue';

export function useDictationItems(lessonNo: number | null | undefined) {
  return useQuery<DictationItem[]>({
    queryKey: ['dictation-items', lessonNo ?? 0],
    queryFn: () => fetchDictationItemsByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRecordDictationAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['recordDictationAttempt'],
    retry: 2,
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordGameAttemptResilient('dictation', itemId, isCorrect),
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        // Refresh the content-derived overall % (audit H4 + rollup port).
        queryClient.invalidateQueries({ queryKey: ['game-mastery', userId] });
      }
    },
  });
}
