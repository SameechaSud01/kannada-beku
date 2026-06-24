import { useQuery } from '@tanstack/react-query';
import { fetchAllLessons, fetchLessonBySlug } from '../services/api/lessons';
import { PLANNED_LESSON_SLOTS } from '../constants/lessons/plannedLessons';
import { lessonSlugByNo } from '../constants/lessons/lessonContent';
import { useProgressStore } from '../stores/progressStore';
import { useUserStore } from '../stores/useUserStore';
import { formatFirstName } from '../utils/formatName';
import { personalizeLesson } from '../utils/personalize';
import type { Lesson as DbLesson } from '../constants/lessons/types';

/** Lesson-selector view-model (game lesson picker). */
export type LessonSelectorItem = {
  n: number;
  glyph: string;
  theme: string;
  unlocked: boolean;
};

/**
 * Lesson list for game lesson-selector.
 *
 * Unlock rule (spec_fix_games_flow): a lesson is selectable once at least one of
 * its parts is complete (or the whole lesson is). No more "Lesson 1 always
 * unlocked" — its games now require lesson part 1a. Driven off
 * PLANNED_LESSON_SLOTS and the progress store, independent of DB lesson rows.
 */
export function useLessons(): LessonSelectorItem[] {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedParts = useProgressStore((s) => s.completedParts);
  return PLANNED_LESSON_SLOTS.map((slot) => {
    const slug = lessonSlugByNo(slot.slot);
    const unlocked =
      !!slug &&
      (completedLessons.includes(slug) ||
        completedParts.some((k) => k.startsWith(`${slug}:`)));
    return {
      n: slot.slot,
      glyph: slot.charPlaceholder,
      theme: slot.title,
      unlocked,
    };
  });
}

/** Fetch all DB lessons ordered by lesson_no. */
export function useDbLessons() {
  return useQuery<DbLesson[]>({
    queryKey: ['lessons'],
    queryFn: fetchAllLessons,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single DB lesson by slug.
 *
 * Self-introduction phrases authored with a `[name]` placeholder (e.g. "I am
 * [name]") are resolved to the learner's onboarding name here, so every lesson
 * phase downstream renders the personalized text. Falls back to "Priya" for the
 * rare nameless case so the example still reads naturally.
 */
export function useDbLesson(slug: string | undefined) {
  const firstName = useUserStore((s) => formatFirstName(s.displayName, 'Priya'));
  return useQuery<DbLesson | null>({
    queryKey: ['lesson', slug],
    queryFn: () => (slug ? fetchLessonBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    select: (l) => (l ? personalizeLesson(l, firstName) : l),
  });
}
