import { renderHook, act } from '@testing-library/react-native';
import { useGameState } from '../../src/games/opposites/hooks/useGameState';

describe('useGameState', () => {
  it('initial state is correct', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.selectedOpt).toBeNull();
  });

  it('totalQuestions is 10', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.totalQuestions).toBe(10);
  });

  it('correct answer sets answerState correct, increments score and streak', () => {
    const { result } = renderHook(() => useGameState());
    const answer = result.current.currentQuestion.answer;

    act(() => {
      result.current.handleOptionTap(answer);
    });

    expect(result.current.answerState).toBe('correct');
    expect(result.current.score).toBe(1);
    expect(result.current.streak).toBe(1);
  });

  it('wrong answer sets answerState wrong, keeps score unchanged, resets streak', () => {
    const { result } = renderHook(() => useGameState());
    const wrongOpt = result.current.currentQuestion.opts.find(
      (o) => o.kn !== result.current.currentQuestion.answer,
    )!;

    act(() => {
      result.current.handleOptionTap(wrongOpt.kn);
    });

    expect(result.current.answerState).toBe('wrong');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
  });

  it('calling handleOptionTap twice is a no-op on second call', () => {
    const { result } = renderHook(() => useGameState());
    const answer = result.current.currentQuestion.answer;

    act(() => {
      result.current.handleOptionTap(answer);
    });
    act(() => {
      result.current.handleOptionTap(answer);
    });

    expect(result.current.score).toBe(1);
  });

  it('handleNext while answerState is unanswered is a no-op', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('after correct tap and handleNext, currentIndex is 1', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('after all 10 questions answered and last handleNext, phase is result', () => {
    const { result } = renderHook(() => useGameState());

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.handleOptionTap(result.current.currentQuestion.answer);
      });
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.phase).toBe('result');
  });

  it('streak resets to 0 on wrong answer even after previous streak > 1', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });

    const wrongOpt = result.current.currentQuestion.opts.find(
      (o) => o.kn !== result.current.currentQuestion.answer,
    )!;
    act(() => {
      result.current.handleOptionTap(wrongOpt.kn);
    });

    expect(result.current.streak).toBe(0);
  });

  it('restart resets to initial state', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.restart();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.phase).toBe('playing');
  });

  it('restart reshuffles question order across sessions', () => {
    const { result } = renderHook(() => useGameState());
    const firstWords: string[] = [result.current.currentQuestion.word];

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.restart();
      });
      firstWords.push(result.current.currentQuestion.word);
    }

    // With 10 items, all 6 values being identical has P < 0.001%
    const unique = new Set(firstWords);
    expect(unique.size).toBeGreaterThan(1);
  });
});
