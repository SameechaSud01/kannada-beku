import { useMemo } from 'react';
import { useProgressStore } from '../stores/progressStore';
import type { Lesson } from '../constants/lessons/types';
import { computePartStates, type PartState } from '../constants/lessons/parts';

export type { PartState };

/** Reactive sub-part states for a lesson, driven off the progress store. */
export function useLessonParts(lesson: Lesson): PartState[] {
  const completedParts = useProgressStore((s) => s.completedParts);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const lessonComplete = completedLessons.includes(lesson.slug);
  return useMemo(
    () => computePartStates(lesson, new Set(completedParts), lessonComplete),
    [lesson, completedParts, lessonComplete],
  );
}
