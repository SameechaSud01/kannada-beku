import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lesson, LessonPhase, LessonSection } from '../constants/lessons/types';

export type PracticeStep = 'listen' | 'say';

export interface LessonRunnerState {
  phase: LessonPhase;
  /** Index into `lesson.sections` for the current section phase (0 otherwise). */
  sectionIndex: number;
  wordIndex: number;
  practiceWordIndex: number;
  practiceWordStep: PracticeStep;
  phraseIndex: number;
  practicePhrasesIndex: number;
  practicePhrasesStep: PracticeStep;
}

export interface LessonRunner extends LessonRunnerState {
  /** Current sub-part, or null on non-section phases / when there is no lesson. */
  section: LessonSection | null;
  /** Current sub-part's label (empty string off-section). */
  sectionLabel: string;
  advance: () => void;
  goPrevious: () => void;
  /** False on the first phase and on `done` — used to hide the back control. */
  canGoPrevious: boolean;
  reset: () => void;
}

const BASE_STATE: LessonRunnerState = {
  phase: 'idle',
  sectionIndex: 0,
  wordIndex: 0,
  practiceWordIndex: 0,
  practiceWordStep: 'listen',
  phraseIndex: 0,
  practicePhrasesIndex: 0,
  practicePhrasesStep: 'listen',
};

const SECTION_PHASES = new Set<LessonPhase>([
  'teach_words',
  'practice_words',
  'teach_phrases',
  'practice_phrases',
]);

export interface LessonRunnerOptions {
  /** Include the lesson-level `situation` intro screen (default true). */
  intro?: boolean;
  /** Include the lesson-level `real_world` outro screen (default true). */
  outro?: boolean;
}

/**
 * Flatten a lesson into the linear sequence of screens the learner walks:
 *
 *   situation → for each section [ teach its words, practice its words,
 *   teach its phrases, practice its phrases ] → summary → real_world → done
 *
 * A section contributes no word screens when it has no words (and likewise for
 * phrases), so a words-only or phrases-only sub-part — and a single-section,
 * un-split lesson — all fall out of the same construction. Walking is then just
 * an index into this list, which makes `goPrevious` an exact inverse of
 * `advance` for free (spec_lesson_runner_ux §2.2).
 *
 * `intro`/`outro` drop the lesson-level situation/real-world screens — a single
 * sub-part run shows them via the chooser and the final done card instead, so
 * they aren't repeated once per part.
 */
function buildSteps(lesson: Lesson, intro: boolean, outro: boolean): LessonRunnerState[] {
  const steps: LessonRunnerState[] = [];
  if (intro) steps.push({ ...BASE_STATE, phase: 'situation' });

  lesson.sections.forEach((section, sectionIndex) => {
    section.words.forEach((_, wordIndex) =>
      steps.push({ ...BASE_STATE, phase: 'teach_words', sectionIndex, wordIndex }),
    );
    section.words.forEach((_, practiceWordIndex) => {
      steps.push({ ...BASE_STATE, phase: 'practice_words', sectionIndex, practiceWordIndex, practiceWordStep: 'listen' });
      steps.push({ ...BASE_STATE, phase: 'practice_words', sectionIndex, practiceWordIndex, practiceWordStep: 'say' });
    });
    section.phrases.forEach((_, phraseIndex) =>
      steps.push({ ...BASE_STATE, phase: 'teach_phrases', sectionIndex, phraseIndex }),
    );
    section.phrases.forEach((_, practicePhrasesIndex) => {
      steps.push({ ...BASE_STATE, phase: 'practice_phrases', sectionIndex, practicePhrasesIndex, practicePhrasesStep: 'listen' });
      steps.push({ ...BASE_STATE, phase: 'practice_phrases', sectionIndex, practicePhrasesIndex, practicePhrasesStep: 'say' });
    });
  });

  steps.push({ ...BASE_STATE, phase: 'summary' });
  if (outro) steps.push({ ...BASE_STATE, phase: 'real_world' });
  steps.push({ ...BASE_STATE, phase: 'done' });
  return steps;
}

export function useLessonRunner(
  lesson: Lesson | null,
  options: LessonRunnerOptions = {},
): LessonRunner {
  const { intro = true, outro = true } = options;
  const steps = useMemo(
    () => (lesson ? buildSteps(lesson, intro, outro) : []),
    [lesson, intro, outro],
  );
  const [index, setIndex] = useState(0);

  // A new lesson restarts the walk at the first screen.
  useEffect(() => {
    setIndex(0);
  }, [lesson]);

  const lastIndex = Math.max(0, steps.length - 1);
  const advance = useCallback(
    () => setIndex((i) => Math.min(i + 1, lastIndex)),
    [lastIndex],
  );
  const goPrevious = useCallback(
    // `done` is terminal — it owns its own close, so there is no step back.
    () => setIndex((i) => (steps[i]?.phase === 'done' ? i : Math.max(i - 1, 0))),
    [steps],
  );
  const reset = useCallback(() => setIndex(0), []);

  const clampedIndex = Math.min(index, lastIndex);
  const state = steps[clampedIndex] ?? BASE_STATE;

  const section =
    lesson && SECTION_PHASES.has(state.phase)
      ? lesson.sections[state.sectionIndex] ?? null
      : null;

  const canGoPrevious = clampedIndex > 0 && state.phase !== 'done';

  return {
    ...state,
    section,
    sectionLabel: section?.label ?? '',
    advance,
    goPrevious,
    canGoPrevious,
    reset,
  };
}
