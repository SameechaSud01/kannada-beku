import { computePartStates } from '../../constants/lessons/parts';
import type { Lesson, LessonSection } from '../../constants/lessons/types';

const section = (key: string): LessonSection => ({
  key,
  label: key,
  words: [{ transliteration: key, english: key, kannada: key }],
  phrases: [],
});

const LESSON: Lesson = {
  id: 'l',
  lessonNo: 1,
  title: 'T',
  slug: 'greetings',
  situation: 's',
  realWorldPrompt: 'r',
  sections: [section('1a'), section('1b'), section('1c')],
  words: [],
  phrases: [],
};

describe('computePartStates — sequential unlock', () => {
  it('unlocks only the first part when nothing is done', () => {
    const parts = computePartStates(LESSON, new Set(), false);
    expect(parts.map((p) => p.unlocked)).toEqual([true, false, false]);
    expect(parts.map((p) => p.done)).toEqual([false, false, false]);
    expect(parts.map((p) => p.active)).toEqual([true, false, false]);
    expect(parts.map((p) => p.isLast)).toEqual([false, false, true]);
  });

  it('unlocks the next part once the previous is done', () => {
    const parts = computePartStates(LESSON, new Set(['greetings:1a']), false);
    expect(parts.map((p) => p.unlocked)).toEqual([true, true, false]);
    expect(parts.map((p) => p.done)).toEqual([true, false, false]);
    // Active is the first unlocked-and-not-done part.
    expect(parts.map((p) => p.active)).toEqual([false, true, false]);
  });

  it('treats every part as done when the lesson is server-complete', () => {
    const parts = computePartStates(LESSON, new Set(), true);
    expect(parts.every((p) => p.done)).toBe(true);
    expect(parts.every((p) => p.unlocked)).toBe(true);
    expect(parts.some((p) => p.active)).toBe(false);
  });

  it('part keys are namespaced by slug (no cross-lesson bleed)', () => {
    // A completed part from a different lesson must not unlock anything here.
    const parts = computePartStates(LESSON, new Set(['names:1a']), false);
    expect(parts.map((p) => p.unlocked)).toEqual([true, false, false]);
  });
});
