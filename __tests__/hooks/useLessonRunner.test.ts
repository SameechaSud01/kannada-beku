import { renderHook, act } from '@testing-library/react-native';
import { useLessonRunner } from '../../hooks/useLessonRunner';
import type { LessonRunnerState } from '../../hooks/useLessonRunner';
import type { Lesson, LessonSection, Phrase, Word } from '../../constants/lessons/types';

const W = (t: string): Word => ({ transliteration: t, english: t, kannada: t });
const P = (t: string): Phrase => ({ transliteration: t, english: t, kannada: t });

function lessonOf(sections: LessonSection[]): Lesson {
  return {
    id: 'l1',
    lessonNo: 1,
    title: 'Test',
    slug: 'test',
    situation: 'sit',
    realWorldPrompt: 'rwp',
    sections,
    words: sections.flatMap((s) => s.words),
    phrases: sections.flatMap((s) => s.phrases),
  };
}

// Single-section lesson: 2 words, 2 phrases — exercises every phase/step
// boundary the runner walks (spec_lesson_runner_ux §2.2).
const LESSON = lessonOf([
  { key: 'a', label: 'Only part', words: [W('w1'), W('w2')], phrases: [P('p1'), P('p2')] },
]);

// Split lesson with a words-only sub-part (1a), a mixed sub-part (1b), and a
// phrases-only sub-part (1c) — covers empty word/phrase sets per section.
const SPLIT = lessonOf([
  { key: '1a', label: 'Saying hello', words: [W('a1'), W('a2')], phrases: [] },
  { key: '1b', label: 'How are you', words: [W('b1')], phrases: [P('bp1'), P('bp2')] },
  { key: '1c', label: 'Full greeting', words: [], phrases: [P('c1')] },
]);

const SECTION_PHASES = ['teach_words', 'practice_words', 'teach_phrases', 'practice_phrases'];

type Snapshot = Pick<
  LessonRunnerState,
  | 'phase'
  | 'sectionIndex'
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
    sectionIndex: c.sectionIndex,
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

    const history: Snapshot[] = [];
    for (let i = 0; i < 50 && result.current.phase !== 'real_world'; i++) {
      history.push(snapshot(result.current));
      act(() => result.current.advance());
    }
    expect(result.current.phase).toBe('real_world');

    for (let i = history.length - 1; i >= 0; i--) {
      act(() => result.current.goPrevious());
      expect(snapshot(result.current)).toEqual(history[i]);
    }

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

describe('useLessonRunner — sub-sections', () => {
  // Walk the whole lesson, recording one entry per screen.
  function walk(lesson: Lesson) {
    const { result } = renderHook(() => useLessonRunner(lesson));
    const steps: Array<{ phase: string; sectionIndex: number; sectionLabel: string }> = [];
    for (let i = 0; i < 200; i++) {
      steps.push({
        phase: result.current.phase,
        sectionIndex: result.current.sectionIndex,
        sectionLabel: result.current.sectionLabel,
      });
      if (result.current.phase === 'done') break;
      act(() => result.current.advance());
    }
    return steps;
  }

  it('walks sections in order and skips empty word/phrase sets', () => {
    const steps = walk(SPLIT);
    const sectionSteps = steps.filter((s) => SECTION_PHASES.includes(s.phase));

    // 1c (index 2) has no words — never a word screen there.
    expect(
      sectionSteps.some(
        (s) => s.sectionIndex === 2 && s.phase.endsWith('_words'),
      ),
    ).toBe(false);
    // 1a (index 0) has no phrases — never a phrase screen there.
    expect(
      sectionSteps.some(
        (s) => s.sectionIndex === 0 && s.phase.endsWith('_phrases'),
      ),
    ).toBe(false);

    // Sections are visited in non-decreasing order, 0 → 2.
    const indices = sectionSteps.map((s) => s.sectionIndex);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
    expect(indices[0]).toBe(0);
    expect(indices[indices.length - 1]).toBe(2);
  });

  it('exposes the current sub-part and null off-section', () => {
    const { result } = renderHook(() => useLessonRunner(SPLIT));
    expect(result.current.section).toBeNull(); // situation

    act(() => result.current.advance()); // → teach_words, section 1a
    expect(result.current.phase).toBe('teach_words');
    expect(result.current.section?.key).toBe('1a');
    expect(result.current.sectionLabel).toBe('Saying hello');

    // Advance to the end; summary/real_world/done are off-section.
    for (let i = 0; i < 200 && result.current.phase !== 'summary'; i++) {
      act(() => result.current.advance());
    }
    expect(result.current.phase).toBe('summary');
    expect(result.current.section).toBeNull();
    expect(result.current.sectionLabel).toBe('');
  });

  it('goPrevious is an exact inverse across a split lesson', () => {
    const { result } = renderHook(() => useLessonRunner(SPLIT));
    const history: Snapshot[] = [];
    for (let i = 0; i < 200 && result.current.phase !== 'real_world'; i++) {
      history.push(snapshot(result.current));
      act(() => result.current.advance());
    }
    expect(result.current.phase).toBe('real_world');
    for (let i = history.length - 1; i >= 0; i--) {
      act(() => result.current.goPrevious());
      expect(snapshot(result.current)).toEqual(history[i]);
    }
    expect(result.current.phase).toBe('situation');
  });

  it('single-section lesson stays on section 0 throughout', () => {
    const steps = walk(LESSON);
    const sectionSteps = steps.filter((s) => SECTION_PHASES.includes(s.phase));
    expect(sectionSteps.every((s) => s.sectionIndex === 0)).toBe(true);
    expect(sectionSteps.every((s) => s.sectionLabel === 'Only part')).toBe(true);
    expect(steps[steps.length - 1].phase).toBe('done');
  });

  it('intro/outro:false drops the situation and real_world screens (part run)', () => {
    const { result } = renderHook(() =>
      useLessonRunner(LESSON, { intro: false, outro: false }),
    );
    const phases: string[] = [];
    for (let i = 0; i < 50; i++) {
      phases.push(result.current.phase);
      if (result.current.phase === 'done') break;
      act(() => result.current.advance());
    }
    expect(phases).not.toContain('situation');
    expect(phases).not.toContain('real_world');
    expect(phases[0]).toBe('teach_words'); // first screen is content, not intro
    expect(phases).toContain('summary');
    expect(phases[phases.length - 1]).toBe('done');
    // First screen has no backward step.
    expect(result.current.phase).toBe('done');
  });
});
