import { renderHook, act } from '@testing-library/react-native';
import { useDictationGame } from '../../src/games/dictation/hooks/useDictationGame';
import type { DictationWord } from '../../src/games/dictation/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../../src/games/dictation/utils/audioPlayer', () => ({
  playWord: jest.fn().mockResolvedValue(undefined),
  stopPlayback: jest.fn(),
}));

import { stopPlayback } from '../../src/games/dictation/utils/audioPlayer';

// Dictation is always answered by typing the English transliteration — the
// Kannada syllable-tile builder was removed, so `tileable` is always false and
// every word is checked against its `accepted` spellings.
const FIXTURE: DictationWord[] = [
  { id: 'd-1', kn: 'ನೀರು', phonetic: 'nee-ru', accepted: ['neeru'] },
  { id: 'd-2', kn: 'ಮನೆ', phonetic: 'ma-ne', accepted: ['mane'] },
  { id: 'd-3', kn: 'ಕಾಡು', phonetic: 'kaa-du', accepted: ['kaadu', 'kadu'] },
  { id: 'd-4', kn: 'ಹಾಲು', phonetic: 'haa-lu', accepted: ['haalu'] },
];

function acceptedFor(result: { current: ReturnType<typeof useDictationGame> }): string {
  return result.current.currentWord.accepted[0];
}

describe('useDictationGame', () => {
  it('has correct initial state and never uses tiles', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.tileable).toBe(false);
  });

  it('totalWords matches the fixture length', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    expect(result.current.totalWords).toBe(FIXTURE.length);
  });

  it('typed correct answer → correct, scores, streak, fires correct attempt', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useDictationGame(FIXTURE, onAttempt));
    const id = result.current.currentWord.id;
    act(() => result.current.submitTyped(acceptedFor(result)));
    expect(result.current.answerState).toBe('correct');
    expect(result.current.score).toBe(1);
    expect(result.current.streak).toBe(1);
    expect(result.current.bestStreak).toBe(1);
    expect(onAttempt).toHaveBeenCalledWith({ itemId: id, isCorrect: true });
  });

  it('typed answer is trimmed and case-insensitive', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.submitTyped(`  ${acceptedFor(result).toUpperCase()}  `));
    expect(result.current.answerState).toBe('correct');
  });

  it('wrong answer → wrong, no score, streak resets, fires wrong attempt', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useDictationGame(FIXTURE, onAttempt));
    const id = result.current.currentWord.id;
    act(() => result.current.submitTyped('definitely-wrong'));
    expect(result.current.answerState).toBe('wrong');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(onAttempt).toHaveBeenCalledWith({ itemId: id, isCorrect: false });
  });

  it('submitting empty text is a no-op', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.submitTyped('   '));
    expect(result.current.answerState).toBe('unanswered');
  });

  it('nextWord while unanswered is a no-op', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.nextWord());
    expect(result.current.currentIndex).toBe(0);
  });

  it('after correct + nextWord: index advances and state resets', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.submitTyped(acceptedFor(result)));
    act(() => result.current.nextWord());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answerState).toBe('unanswered');
  });

  it('skipWord advances without scoring', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.skipWord());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.score).toBe(0);
  });

  it('finishing the last word moves to result', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    for (let i = 0; i < FIXTURE.length; i++) {
      act(() => result.current.submitTyped(acceptedFor(result)));
      act(() => result.current.nextWord());
    }
    expect(result.current.phase).toBe('result');
    expect(result.current.score).toBe(FIXTURE.length);
  });

  it('restart resets state and stops playback', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.submitTyped(acceptedFor(result)));
    act(() => result.current.restart());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(stopPlayback).toHaveBeenCalled();
  });
});
