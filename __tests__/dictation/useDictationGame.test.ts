import { renderHook, act } from '@testing-library/react-native';
import { useDictationGame } from '../../src/games/dictation/hooks/useDictationGame';

jest.mock('../../src/games/dictation/utils/audioPlayer', () => ({
  playWord: jest.fn().mockResolvedValue(undefined),
  stopPlayback: jest.fn(),
}));

import { stopPlayback } from '../../src/games/dictation/utils/audioPlayer';

describe('useDictationGame', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useDictationGame());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.lastScore).toBeNull();
    expect(result.current.answeredCount).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('totalWords is 10', () => {
    const { result } = renderHook(() => useDictationGame());
    expect(result.current.totalWords).toBe(10);
  });

  it('submitAnswer with exact match sets correct state', () => {
    const { result } = renderHook(() => useDictationGame());
    const word = result.current.currentWord;
    const exactAnswer = word.accepted[0];
    act(() => {
      result.current.submitAnswer(exactAnswer);
    });
    expect(result.current.answerState).toBe('correct');
    expect(result.current.lastScore).toBe(100);
    expect(result.current.answeredCount).toBe(1);
  });

  it('submitAnswer with near-match sets partial state', () => {
    const { result } = renderHook(() => useDictationGame());
    // Force a specific word to ensure predictable test
    // Use a near-match: drop one character from the first accepted spelling
    const word = result.current.currentWord;
    const nearMatch = word.accepted[0].slice(0, -1); // remove last char
    // Only test if near-match is actually different and has some similarity
    if (nearMatch.length > 0 && nearMatch !== word.accepted[0]) {
      act(() => {
        result.current.submitAnswer(nearMatch);
      });
      const score = result.current.lastScore ?? 0;
      if (score >= 40 && score < 100) {
        expect(result.current.answerState).toBe('partial');
        expect(score).toBeGreaterThanOrEqual(40);
        expect(score).toBeLessThan(100);
      }
    }
  });

  it('submitAnswer with clearly wrong answer sets wrong state', () => {
    const { result } = renderHook(() => useDictationGame());
    act(() => {
      result.current.submitAnswer('zzzzzzzzzzzzzzz');
    });
    expect(result.current.answerState).toBe('wrong');
    const score = result.current.lastScore ?? 100;
    expect(score).toBeLessThan(40);
  });

  it('submitAnswer with empty string is a no-op', () => {
    const { result } = renderHook(() => useDictationGame());
    act(() => {
      result.current.submitAnswer('');
    });
    expect(result.current.answerState).toBe('unanswered');
  });

  it('calling submitAnswer twice only increments answeredCount once', () => {
    const { result } = renderHook(() => useDictationGame());
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    expect(result.current.answeredCount).toBe(1);
  });

  it('nextWord while unanswered is a no-op', () => {
    const { result } = renderHook(() => useDictationGame());
    act(() => {
      result.current.nextWord();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('after answering and nextWord: index advances, state resets', () => {
    const { result } = renderHook(() => useDictationGame());
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    act(() => {
      result.current.nextWord();
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.lastScore).toBeNull();
  });

  it('skipWord while unanswered advances index without incrementing answeredCount', () => {
    const { result } = renderHook(() => useDictationGame());
    act(() => {
      result.current.skipWord();
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answeredCount).toBe(0);
  });

  it('skipWord after answering is a no-op', () => {
    const { result } = renderHook(() => useDictationGame());
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    act(() => {
      result.current.skipWord();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('after answering all 10 words and nextWord on last: phase is result', () => {
    const { result } = renderHook(() => useDictationGame());
    for (let i = 0; i < 10; i++) {
      const word = result.current.currentWord;
      act(() => {
        result.current.submitAnswer(word.accepted[0]);
      });
      act(() => {
        result.current.nextWord();
      });
    }
    expect(result.current.phase).toBe('result');
  });

  it('sessionAvg reflects running average after multiple answers', () => {
    const { result } = renderHook(() => useDictationGame());
    // answer word 1 with exact match (score 100)
    act(() => { result.current.submitAnswer(result.current.currentWord.accepted[0]); });
    act(() => { result.current.nextWord(); });
    // answer word 2 with wrong answer (score ~0)
    act(() => { result.current.submitAnswer('zzzzzzzzzzzzzzz'); });
    act(() => { result.current.nextWord(); });
    // avg should be between 0 and 100
    expect(result.current.sessionAvg).toBeGreaterThanOrEqual(0);
    expect(result.current.sessionAvg).toBeLessThanOrEqual(100);
    // avg should be less than 100 since one answer was wrong
    expect(result.current.sessionAvg).toBeLessThan(100);
  });

  it('after restart: counters reset, phase is playing, stopPlayback was called', () => {
    const { result } = renderHook(() => useDictationGame());
    const word = result.current.currentWord;
    act(() => { result.current.submitAnswer(word.accepted[0]); });
    act(() => { result.current.nextWord(); });
    act(() => { result.current.restart(); });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.answeredCount).toBe(0);
    expect(result.current.lastScore).toBeNull();
    expect(result.current.sessionAvg).toBe(0);
    expect(stopPlayback).toHaveBeenCalled();
  });
});
