import { renderHook, act } from '@testing-library/react-native';
import { useLessonRunner } from '../../hooks/useLessonRunner';
import type { LessonRunnerState } from '../../hooks/useLessonRunner';
import type { Lesson } from '../../constants/lessons/types';

// Minimal lesson: 2 words, 2 phrases — enough to exercise every phase/step
// boundary the runner walks (spec_lesson_runner_ux §2.2).
const LESSON: Lesson = {
  id: 'l1',
  lessonNo: 1,
  title: 'Test',
  slug: 'test',
  situation: 'sit',
  realWorldPrompt: 'rwp',
  words: [
    { transliteration: 'w1', english: 'one', kannada: 'ಒ' },
    { transliteration: 'w2', english: 'two', kannada: 'ಎ' },
  ],
  phrases: [
    { transliteration: 'p1', english: 'hi', kannada: 'ಹ' },
    { transliteration: 'p2', english: 'bye', kannada: 'ಬ' },
  ],
};

type Snapshot = Pick<
  LessonRunnerState,
  | 'phase'
  | 'wordIndex'
  | 'practiceWordIndex'
  | 'practiceWordStep'
  | 'phraseIndex'
  | 'practicePhrasesIndex'
  | 'practicePhrasesStep'
>;

function snapshot(c: Snapshot): Snapshot {
  return {
    phase: c.phase,
    wordIndex: c.wordIndex,
    practiceWordIndex: c.practiceWordIndex,
    practiceWordStep: c.practiceWordStep,
    phraseIndex: c.phraseIndex,
    practicePhrasesIndex: c.practicePhrasesIndex,
    practicePhrasesStep: c.practicePhrasesStep,
  };
}

describe('useLessonRunner — goPrevious (D2)', () => {
  it('starts on situation with no backward step available', () => {
    const { result } = renderHook(() => useLessonRunner(LESSON));
    expect(result.current.phase).toBe('situation');
    expect(result.current.canGoPrevious).toBe(false);
  });

  it('goPrevious is a no-op on the first phase', () => {
    const { result } = renderHook(() => useLessonRunner(LESSON));
    act(() => result.current.goPrevious());
    expect(result.current.phase).toBe('situation');
  });

  it('every advance up to real_world is exactly undone by a goPrevious', () => {
    const { result } = renderHook(() => useLessonRunner(LESSON));

    // Walk forward to `real_world` (the last phase with a backward step),
    // snapshotting the state before each advance.
    const history: Snapshot[] = [];
    for (let i = 0; i < 50 && result.current.phase !== 'real_world'; i++) {
      history.push(snapshot(result.current));
      act(() => result.current.advance());
    }
    expect(result.current.phase).toBe('real_world');

    // Walk backward; each goPrevious must restore the pre-advance snapshot.
    for (let i = history.length - 1; i >= 0; i--) {
      act(() => result.current.goPrevious());
      expect(snapshot(result.current)).toEqual(history[i]);
    }

    // Back at the start, no further backward step.
    expect(result.current.phase).toBe('situation');
    expect(result.current.canGoPrevious).toBe(false);
  });

  it('real_world → done is one-way: goPrevious from done is a no-op', () => {
    const { result } = renderHook(() => useLessonRunner(LESSON));
    for (let i = 0; i < 50 && result.current.phase !== 'real_world'; i++) {
      act(() => result.current.advance());
    }
    act(() => result.current.advance()); // real_world → done
    expect(result.current.phase).toBe('done');
    act(() => result.current.goPrevious());
    expect(result.current.phase).toBe('done');
  });

  it('canGoPrevious is false on situation and done, true in between', () => {
    const { result } = renderHook(() => useLessonRunner(LESSON));
    const seen: Record<string, boolean> = {};
    for (let i = 0; i < 50; i++) {
      seen[result.current.phase] = result.current.canGoPrevious;
      if (result.current.phase === 'done') break;
      act(() => result.current.advance());
    }
    expect(seen.situation).toBe(false);
    expect(seen.done).toBe(false);
    expect(seen.teach_words).toBe(true);
    expect(seen.practice_words).toBe(true);
    expect(seen.teach_phrases).toBe(true);
    expect(seen.practice_phrases).toBe(true);
    expect(seen.summary).toBe(true);
    expect(seen.real_world).toBe(true);
  });
});
