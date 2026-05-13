import { useState, useCallback } from 'react';
import type { Lesson, LessonId } from '../constants/lessons/types';
import { LESSONS } from '../constants/lessons';

export type LessonPhase = 'idle' | 'scenario' | 'intake' | 'drill' | 'output' | 'done';

export type DrillAttempt = {
  itemIndex: number;
  phraseId: string;
  correct: boolean;
};

export type LessonRunnerState = {
  phase: LessonPhase;
  lesson: Lesson | null;
  intakeIndex: number;
  drillIndex: number;
  drillAttempts: DrillAttempt[];
};

export type LessonRunner = {
  state: LessonRunnerState;
  advance: () => void;
  goBack: () => void;
  reset: () => void;
  recordDrillAttempts: (attempts: DrillAttempt[]) => void;
};

export function useLessonRunner(lessonId: LessonId): LessonRunner {
  const lesson = LESSONS[lessonId] ?? null;
  const [state, setState] = useState<LessonRunnerState>({
    phase: lesson ? 'scenario' : 'idle',
    lesson,
    intakeIndex: 0,
    drillIndex: 0,
    drillAttempts: [],
  });

  const advance = useCallback(() => {
    setState((s) => {
      if (!s.lesson) return s;
      switch (s.phase) {
        case 'idle':
          return { ...s, phase: 'scenario' };
        case 'scenario':
          return { ...s, phase: 'intake' };
        case 'intake':
          if (s.intakeIndex < s.lesson.intake.length - 1) {
            return { ...s, intakeIndex: s.intakeIndex + 1 };
          }
          return { ...s, phase: 'drill' };
        case 'drill':
          return { ...s, phase: 'output' };
        case 'output':
          return { ...s, phase: 'done' };
        case 'done':
          return s;
      }
    });
  }, []);

  const goBack = useCallback(() => {
    setState((s) => {
      if (s.phase === 'intake' && s.intakeIndex > 0) {
        return { ...s, intakeIndex: s.intakeIndex - 1 };
      }
      return s;
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      phase: lesson ? 'scenario' : 'idle',
      lesson,
      intakeIndex: 0,
      drillIndex: 0,
      drillAttempts: [],
    });
  }, [lesson]);

  const recordDrillAttempts = useCallback((attempts: DrillAttempt[]) => {
    setState((s) => ({ ...s, drillAttempts: attempts }));
  }, []);

  return { state, advance, goBack, reset, recordDrillAttempts };
}
