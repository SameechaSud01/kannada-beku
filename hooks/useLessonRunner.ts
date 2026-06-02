import { useState, useCallback } from 'react';
import type { Lesson, LessonPhase } from '../constants/lessons/types';

export type PracticeStep = 'listen' | 'say';

export interface LessonRunnerState {
  phase: LessonPhase;
  wordIndex: number;
  practiceWordIndex: number;
  practiceWordStep: PracticeStep;
  phraseIndex: number;
  practicePhrasesIndex: number;
  practicePhrasesStep: PracticeStep;
}

export interface LessonRunner extends LessonRunnerState {
  advance: () => void;
  goPrevious: () => void;
  /** False on the first phase and on `done` — used to hide the back control. */
  canGoPrevious: boolean;
  reset: () => void;
}

const initialState = (hasLesson: boolean): LessonRunnerState => ({
  phase: hasLesson ? 'situation' : 'idle',
  wordIndex: 0,
  practiceWordIndex: 0,
  practiceWordStep: 'listen',
  phraseIndex: 0,
  practicePhrasesIndex: 0,
  practicePhrasesStep: 'listen',
});

export function useLessonRunner(lesson: Lesson | null): LessonRunner {
  const [state, setState] = useState<LessonRunnerState>(() => initialState(!!lesson));

  const advance = useCallback(() => {
    setState((s) => {
      if (!lesson) return s;
      const wordsLen = lesson.words.length;
      const phrasesLen = lesson.phrases.length;

      switch (s.phase) {
        case 'idle':
          return { ...s, phase: 'situation' };

        case 'situation':
          return { ...s, phase: 'teach_words', wordIndex: 0 };

        case 'teach_words':
          if (s.wordIndex < wordsLen - 1) {
            return { ...s, wordIndex: s.wordIndex + 1 };
          }
          return {
            ...s,
            phase: 'practice_words',
            practiceWordIndex: 0,
            practiceWordStep: 'listen',
          };

        case 'practice_words':
          if (s.practiceWordStep === 'listen') {
            return { ...s, practiceWordStep: 'say' };
          }
          // 'say' step → next word or move to teach_phrases
          if (s.practiceWordIndex < wordsLen - 1) {
            return {
              ...s,
              practiceWordIndex: s.practiceWordIndex + 1,
              practiceWordStep: 'listen',
            };
          }
          return { ...s, phase: 'teach_phrases', phraseIndex: 0 };

        case 'teach_phrases':
          if (s.phraseIndex < phrasesLen - 1) {
            return { ...s, phraseIndex: s.phraseIndex + 1 };
          }
          return {
            ...s,
            phase: 'practice_phrases',
            practicePhrasesIndex: 0,
            practicePhrasesStep: 'listen',
          };

        case 'practice_phrases':
          if (s.practicePhrasesStep === 'listen') {
            return { ...s, practicePhrasesStep: 'say' };
          }
          if (s.practicePhrasesIndex < phrasesLen - 1) {
            return {
              ...s,
              practicePhrasesIndex: s.practicePhrasesIndex + 1,
              practicePhrasesStep: 'listen',
            };
          }
          return { ...s, phase: 'summary' };

        case 'summary':
          return { ...s, phase: 'real_world' };

        case 'real_world':
          return { ...s, phase: 'done' };

        case 'done':
          return s;
      }
    });
  }, [lesson]);

  const goPrevious = useCallback(() => {
    setState((s) => {
      if (!lesson) return s;
      const wordsLen = lesson.words.length;
      const phrasesLen = lesson.phrases.length;

      switch (s.phase) {
        case 'idle':
        case 'situation':
          // First phase — nothing to step back to.
          return s;

        case 'teach_words':
          if (s.wordIndex > 0) {
            return { ...s, wordIndex: s.wordIndex - 1 };
          }
          return { ...s, phase: 'situation' };

        case 'practice_words':
          if (s.practiceWordStep === 'say') {
            return { ...s, practiceWordStep: 'listen' };
          }
          // 'listen' step → previous word's 'say', or back to teach_words
          if (s.practiceWordIndex > 0) {
            return {
              ...s,
              practiceWordIndex: s.practiceWordIndex - 1,
              practiceWordStep: 'say',
            };
          }
          return { ...s, phase: 'teach_words', wordIndex: Math.max(0, wordsLen - 1) };

        case 'teach_phrases':
          if (s.phraseIndex > 0) {
            return { ...s, phraseIndex: s.phraseIndex - 1 };
          }
          return {
            ...s,
            phase: 'practice_words',
            practiceWordIndex: Math.max(0, wordsLen - 1),
            practiceWordStep: 'say',
          };

        case 'practice_phrases':
          if (s.practicePhrasesStep === 'say') {
            return { ...s, practicePhrasesStep: 'listen' };
          }
          if (s.practicePhrasesIndex > 0) {
            return {
              ...s,
              practicePhrasesIndex: s.practicePhrasesIndex - 1,
              practicePhrasesStep: 'say',
            };
          }
          return {
            ...s,
            phase: 'teach_phrases',
            phraseIndex: Math.max(0, phrasesLen - 1),
          };

        case 'summary':
          return {
            ...s,
            phase: 'practice_phrases',
            practicePhrasesIndex: Math.max(0, phrasesLen - 1),
            practicePhrasesStep: 'say',
          };

        case 'real_world':
          return { ...s, phase: 'summary' };

        case 'done':
          // `done` has its own close; no backward step.
          return s;
      }
    });
  }, [lesson]);

  const reset = useCallback(() => {
    setState(initialState(!!lesson));
  }, [lesson]);

  const canGoPrevious =
    state.phase !== 'idle' && state.phase !== 'situation' && state.phase !== 'done';

  return {
    ...state,
    advance,
    goPrevious,
    canGoPrevious,
    reset,
  };
}
