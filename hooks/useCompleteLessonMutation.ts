import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { useProgressStore } from '../stores/progressStore';
import { fetchLessonIdBySlug } from '../services/api/lessons';
import { recordLessonCompletion } from '../services/api/progress';
import { recordLearningDay } from '../services/progress/streak';
import { enqueueLessonCompletion, isCurrentlyOffline } from '../services/progress/syncQueue';

export interface CompleteLessonInput {
  slug: string;
  score: number;
  phrasesLearned: number;
  minutesPracticed: number;
}

export interface CompleteLessonResult {
  userId: string;
  slug: string;
  /** True when the server write was deferred to the offline outbox (TODO T019). */
  queuedOffline: boolean;
}

export class LessonNotRegisteredError extends Error {
  constructor(slug: string) {
    super(`Lesson "${slug}" not registered on server.`);
    this.name = 'LessonNotRegisteredError';
  }
}

/**
 * Local-first lesson completion (TODO T019). Progress is written to the Zustand
 * store immediately so it is never lost — including offline — and the server
 * write is attempted right after. If the network is down (or the write fails
 * while offline), the completion is parked in the offline outbox and flushed on
 * reconnect / next launch; the mutation still resolves so the done screen can
 * proceed. A genuine "lesson not registered" (id resolves to null while online)
 * still throws, and the store's own early-return guards keep XP/phrase counts
 * from double-counting on replay.
 *
 * Mutation key: ['completeLesson'].
 * Invalidates:  ['lesson-completions', userId], ['overall-progress', userId].
 */
export function useCompleteLessonMutation() {
  const queryClient = useQueryClient();

  return useMutation<CompleteLessonResult, Error, CompleteLessonInput>({
    mutationKey: ['completeLesson'],
    mutationFn: async ({ slug, score, phrasesLearned, minutesPracticed }) => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('Not signed in.');

      // Local first: record progress + streak so it survives an offline finish.
      const applyLocal = () => {
        useProgressStore.getState().completeLesson(slug, score, phrasesLearned, minutesPracticed);
        // Advance + server-persist the streak (audit H2/B4) so reinstalls keep it.
        recordLearningDay();
      };

      let lessonId: string | null = null;
      try {
        lessonId = await fetchLessonIdBySlug(slug);
      } catch (err) {
        // Couldn't even resolve the id. Offline → save locally + queue by slug
        // (the flush resolves the id later). Online → a real error, rethrow.
        if (await isCurrentlyOffline()) {
          applyLocal();
          enqueueLessonCompletion(slug, score);
          return { userId, slug, queuedOffline: true };
        }
        throw err;
      }

      if (!lessonId) throw new LessonNotRegisteredError(slug);

      applyLocal();

      try {
        await recordLessonCompletion(lessonId, score);
      } catch (err) {
        // Server write failed after a local save. Park it in the outbox so it
        // syncs later rather than blocking the learner or losing the score.
        if (await isCurrentlyOffline()) {
          enqueueLessonCompletion(slug, score);
          return { userId, slug, queuedOffline: true };
        }
        throw err;
      }

      return { userId, slug, queuedOffline: false };
    },
    onSuccess: ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-completions', userId] });
      queryClient.invalidateQueries({ queryKey: ['overall-progress', userId] });
    },
  });
}
