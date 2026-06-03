import { renderHook, act } from '@testing-library/react-native';
import { buildQuiz } from '../../src/games/quickquiz/utils/roundBuilder';
import { useQuickQuiz, PER_QUESTION_SECONDS } from '../../src/games/quickquiz/hooks/useQuickQuiz';
import type { QuizVocab } from '../../src/games/quickquiz/types';

const BANK: QuizVocab[] = Array.from({ length: 8 }, (_, i) => ({
  id: `q-${i + 1}`,
  kannada: `ಕ${i + 1}`,
  transliteration: `ka${i + 1}`,
  meaning: `meaning ${i + 1}`,
}));

describe('buildQuiz', () => {
  it('alternates direction kn→en / en→kn', () => {
    const qs = buildQuiz(BANK);
    expect(qs[0].direction).toBe('kn-to-en');
    expect(qs[1].direction).toBe('en-to-kn');
  });

  it('caps the round at 10 and includes the answer among options', () => {
    const big = Array.from({ length: 20 }, (_, i) => ({ ...BANK[0], id: `b-${i}` }));
    const qs = buildQuiz(big);
    expect(qs.length).toBeLessThanOrEqual(10);
    for (const q of qs) {
      expect(q.options.some((o) => o.id === q.answerId)).toBe(true);
    }
  });

  it('kn→en options render English meaning; en→kn render transliteration + script', () => {
    const qs = buildQuiz(BANK);
    const kn = qs.find((q) => q.direction === 'kn-to-en')!;
    const en = qs.find((q) => q.direction === 'en-to-kn')!;
    expect(kn.options.every((o) => o.secondary === '')).toBe(true);
    expect(en.options.every((o) => o.secondary.length > 0)).toBe(true);
  });
});

describe('useQuickQuiz', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('initial state: unanswered, full timer', () => {
    const { result } = renderHook(() => useQuickQuiz(BANK));
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.secondsLeft).toBe(PER_QUESTION_SECONDS);
    expect(result.current.phase).toBe('playing');
  });

  it('correct tap scores and reveals; records a correct attempt', () => {
    const attempts: Array<{ itemId: string; isCorrect: boolean }> = [];
    const { result } = renderHook(() => useQuickQuiz(BANK, undefined, (a) => attempts.push(a)));
    const answerId = result.current.currentQuestion.answerId;
    act(() => result.current.handleOptionTap(answerId));
    expect(result.current.answerState).toBe('correct');
    expect(result.current.score).toBe(1);
    expect(attempts).toEqual([{ itemId: answerId, isCorrect: true }]);
    expect(result.current.optionState(answerId)).toBe('correct');
  });

  it('a timeout auto-reveals as wrong and records a wrong attempt', () => {
    const attempts: Array<{ itemId: string; isCorrect: boolean }> = [];
    const { result } = renderHook(() => useQuickQuiz(BANK, undefined, (a) => attempts.push(a)));
    const itemId = result.current.currentQuestion.itemId;
    act(() => jest.advanceTimersByTime(PER_QUESTION_SECONDS * 1000));
    expect(result.current.answerState).toBe('wrong');
    expect(result.current.secondsLeft).toBe(0);
    expect(attempts).toEqual([{ itemId, isCorrect: false }]);
  });

  it('advances to the next question, resetting the timer', () => {
    const { result } = renderHook(() => useQuickQuiz(BANK));
    act(() => result.current.handleOptionTap(result.current.currentQuestion.answerId));
    act(() => result.current.handleNext());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.secondsLeft).toBe(PER_QUESTION_SECONDS);
  });

  it('reaches result after the last question', () => {
    const { result } = renderHook(() => useQuickQuiz(BANK));
    const total = result.current.totalQuestions;
    for (let i = 0; i < total; i++) {
      act(() => result.current.handleOptionTap(result.current.currentQuestion.answerId));
      act(() => result.current.handleNext());
    }
    expect(result.current.phase).toBe('result');
  });
});
