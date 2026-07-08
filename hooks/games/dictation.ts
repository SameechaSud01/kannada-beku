import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchDictationItemsByLessonNo,
  type DictationItem,
} from '../../services/api/games/dictation';
import { recordGameAttemptResilient } from '../../services/progress/syncQueue';
import { markMasteryDirty } from '../../services/progress/masteryRefresh';

export function useDictationItems(lessonNo: number | null | undefined) {
  return useQuery<DictationItem[]>({
    queryKey: ['dictation-items', lessonNo ?? 0],
    queryFn: () => fetchDictationItemsByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRecordDictationAttempt() {
  return useMutation({
    mutationKey: ['recordDictationAttempt'],
    retry: 2,
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordGameAttemptResilient('dictation', itemId, isCorrect),
    onSuccess: () => {
      // Content-derived overall % refetches once at game end (masteryRefresh).
      markMasteryDirty();
    },
  });
}
