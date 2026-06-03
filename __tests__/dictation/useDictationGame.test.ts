import { renderHook, act } from '@testing-library/react-native';
import { useDictationGame } from '../../src/games/dictation/hooks/useDictationGame';
import { splitAksharas } from '../../src/games/dictation/utils/kannadaAkshara';
import type { DictationWord } from '../../src/games/dictation/types';

jest.mock('../../src/games/dictation/utils/audioPlayer', () => ({
  playWord: jest.fn().mockResolvedValue(undefined),
  stopPlayback: jest.fn(),
}));

import { stopPlayback } from '../../src/games/dictation/utils/audioPlayer';

// All multi-akshara (tileable) words.
const FIXTURE: DictationWord[] = [
  { id: 'd-1', kn: 'ನೀರು', phonetic: 'nee-ru', accepted: ['neeru'] },
  { id: 'd-2', kn: 'ಮನೆ', phonetic: 'ma-ne', accepted: ['mane'] },
  { id: 'd-3', kn: 'ಕಾಡು', phonetic: 'kaa-du', accepted: ['kaadu'] },
  { id: 'd-4', kn: 'ಹಾಲು', phonetic: 'haa-lu', accepted: ['haalu'] },
];

type Result = { current: ReturnType<typeof useDictationGame> };

function tileFor(result: Result, char: string, used: Set<string>): string {
  const tile = result.current.tray.find((t) => t.char === char && !used.has(t.id));
  if (!tile) throw new Error(`no tray tile for "${char}"`);
  used.add(tile.id);
  return tile.id;
}

function placeCorrect(result: Result): void {
  const aksharas = splitAksharas(result.current.currentWord.kn);
  const used = new Set<string>();
  for (const a of aksharas) {
    const id = tileFor(result, a, used);
    act(() => result.current.tapTile(id));
  }
}

function placeWrong(result: Result): void {
  const aksharas = splitAksharas(result.current.currentWord.kn);
  const targetSet = new Set(aksharas);
  const used = new Set<string>();
  // first n-1 correct …
  for (let i = 0; i < aksharas.length - 1; i++) {
    const id = tileFor(result, aksharas[i], used);
    act(() => result.current.tapTile(id));
  }
  // … then a distractor in the final slot → guaranteed wrong string.
  const distractor = result.current.tray.find((t) => !targetSet.has(t.char) && !used.has(t.id));
  if (!distractor) throw new Error('no distractor tile available');
  act(() => result.current.tapTile(distractor.id));
}

describe('useDictationGame (syllable tiles)', () => {
  it('has correct initial state and a populated tray', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.tileable).toBe(true);
    expect(result.current.tray.length).toBeGreaterThanOrEqual(result.current.aksharaCount);
    expect(result.current.canCheck).toBe(false);
  });

  it('totalWords matches the fixture length', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    expect(result.current.totalWords).toBe(FIXTURE.length);
  });

  it('tapping a tile then again toggles it out of the answer row', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    const id = result.current.tray[0].id;
    act(() => result.current.tapTile(id));
    expect(result.current.placed).toEqual([id]);
    act(() => result.current.tapTile(id));
    expect(result.current.placed).toEqual([]);
  });

  it('correct assembly → correct, scores, streak, fires correct attempt', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useDictationGame(FIXTURE, onAttempt));
    const id = result.current.currentWord.id;
    placeCorrect(result);
    expect(result.current.canCheck).toBe(true);
    act(() => result.current.check());
    expect(result.current.answerState).toBe('correct');
    expect(result.current.score).toBe(1);
    expect(result.current.streak).toBe(1);
    expect(result.current.bestStreak).toBe(1);
    expect(onAttempt).toHaveBeenCalledWith({ itemId: id, isCorrect: true });
  });

  it('wrong assembly → wrong, no score, streak resets, fires wrong attempt', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useDictationGame(FIXTURE, onAttempt));
    const id = result.current.currentWord.id;
    placeWrong(result);
    act(() => result.current.check());
    expect(result.current.answerState).toBe('wrong');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(onAttempt).toHaveBeenCalledWith({ itemId: id, isCorrect: false });
  });

  it('check is a no-op until the row is full', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.tapTile(result.current.tray[0].id));
    act(() => result.current.check());
    expect(result.current.answerState).toBe('unanswered');
  });

  it('nextWord while unanswered is a no-op', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => result.current.nextWord());
    expect(result.current.currentIndex).toBe(0);
  });

  it('after correct + nextWord: index advances and state resets', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    placeCorrect(result);
    act(() => result.current.check());
    act(() => result.current.nextWord());
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.placed).toEqual([]);
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
      placeCorrect(result);
      act(() => result.current.check());
      act(() => result.current.nextWord());
    }
    expect(result.current.phase).toBe('result');
    expect(result.current.score).toBe(FIXTURE.length);
  });

  it('restart resets state and stops playback', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    placeCorrect(result);
    act(() => result.current.check());
    act(() => result.current.restart());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(stopPlayback).toHaveBeenCalled();
  });
});

describe('useDictationGame (typed fallback)', () => {
  const SINGLE: DictationWord[] = [{ id: 's-1', kn: 'ಆ', phonetic: 'aa', accepted: ['aa'] }];

  it('non-tileable word falls back to typed input', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useDictationGame(SINGLE, onAttempt));
    expect(result.current.tileable).toBe(false);
    act(() => result.current.submitTyped('aa'));
    expect(result.current.answerState).toBe('correct');
    expect(onAttempt).toHaveBeenCalledWith({ itemId: 's-1', isCorrect: true });
  });

  it('typed fallback marks a wrong answer', () => {
    const { result } = renderHook(() => useDictationGame(SINGLE));
    act(() => result.current.submitTyped('zz'));
    expect(result.current.answerState).toBe('wrong');
  });
});
