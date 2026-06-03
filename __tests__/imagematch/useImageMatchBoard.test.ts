import { renderHook, act } from '@testing-library/react-native';
import { useImageMatchBoard, buildBoardPairs } from '../../src/games/imagematch/hooks/useImageMatchBoard';
import type { VocabItem } from '../../src/games/imagematch/types';

const FIXTURE: VocabItem[] = Array.from({ length: 5 }, (_, i) => ({
  id:    `v-${i + 1}`,
  kn:    `K${i + 1}`,
  ph:    `k${i + 1}`,
  en:    `english ${i + 1}`,
  emoji: '🔤',
}));

describe('buildBoardPairs', () => {
  it('caps the board at 6 pairs', () => {
    const big = Array.from({ length: 12 }, (_, i) => ({ ...FIXTURE[0], id: `b-${i}` }));
    expect(buildBoardPairs(big)).toHaveLength(6);
  });

  it('fills from the distractor bank when the lesson has too few items', () => {
    const target = [FIXTURE[0]];
    const distractors = FIXTURE;
    const pairs = buildBoardPairs(target, distractors);
    expect(pairs.length).toBeGreaterThan(1);
    expect(pairs.some((p) => p.id === 'v-1')).toBe(true);
  });

  it('de-dupes by id across the two banks', () => {
    const pairs = buildBoardPairs(FIXTURE, FIXTURE);
    const ids = new Set(pairs.map((p) => p.id));
    expect(ids.size).toBe(pairs.length);
  });

  it('yields at least 4 pairs when enough unique items exist (min-4 guarantee)', () => {
    // 1 target + distractor union ≥ 4 unique → board must reach the 4-pair floor.
    const pairs = buildBoardPairs([FIXTURE[0]], FIXTURE);
    expect(pairs.length).toBeGreaterThanOrEqual(4);
  });
});

describe('useImageMatchBoard', () => {
  it('initial state: nothing selected or matched, playing', () => {
    const { result } = renderHook(() => useImageMatchBoard(FIXTURE));
    expect(result.current.selectedWordId).toBeNull();
    expect(result.current.matchedCount).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.totalPairs).toBe(5);
  });

  it('tapping a word selects it', () => {
    const { result } = renderHook(() => useImageMatchBoard(FIXTURE));
    act(() => result.current.handleWordTap('v-1'));
    expect(result.current.selectedWordId).toBe('v-1');
  });

  it('image tap before a word is selected is ignored', () => {
    const { result } = renderHook(() => useImageMatchBoard(FIXTURE));
    act(() => result.current.handleImageTap('v-1'));
    expect(result.current.matchedCount).toBe(0);
    expect(result.current.selectedWordId).toBeNull();
  });

  it('correct pair locks, clears selection, scores, and fires a correct attempt', () => {
    const attempts: Array<{ itemId: string; isCorrect: boolean }> = [];
    const { result } = renderHook(() =>
      useImageMatchBoard(FIXTURE, undefined, (a) => attempts.push(a)),
    );
    act(() => result.current.handleWordTap('v-1'));
    act(() => result.current.handleImageTap('v-1'));

    expect(result.current.matchedCount).toBe(1);
    expect(result.current.score).toBe(1);
    expect(result.current.selectedWordId).toBeNull();
    expect(attempts).toEqual([{ itemId: 'v-1', isCorrect: true }]);
    expect(result.current.wordColumn.find((t) => t.item.id === 'v-1')?.state).toBe('matched');
  });

  it('wrong pairing flashes mismatch, fires a wrong attempt, and does not lock', () => {
    jest.useFakeTimers();
    const attempts: Array<{ itemId: string; isCorrect: boolean }> = [];
    const { result } = renderHook(() =>
      useImageMatchBoard(FIXTURE, undefined, (a) => attempts.push(a)),
    );
    act(() => result.current.handleWordTap('v-1'));
    act(() => result.current.handleImageTap('v-2'));

    expect(attempts).toEqual([{ itemId: 'v-1', isCorrect: false }]);
    expect(result.current.matchedCount).toBe(0);
    expect(result.current.wordColumn.find((t) => t.item.id === 'v-1')?.state).toBe('mismatch');

    act(() => jest.advanceTimersByTime(600));
    expect(result.current.selectedWordId).toBeNull();
    expect(result.current.wordColumn.find((t) => t.item.id === 'v-1')?.state).toBe('default');
    jest.useRealTimers();
  });

  it('moves to result when every pair is matched', () => {
    const { result } = renderHook(() => useImageMatchBoard(FIXTURE));
    for (const item of FIXTURE) {
      act(() => result.current.handleWordTap(item.id));
      act(() => result.current.handleImageTap(item.id));
    }
    expect(result.current.matchedCount).toBe(5);
    expect(result.current.phase).toBe('result');
  });

  it('deselect clears a word selection (drag released over empty space)', () => {
    const { result } = renderHook(() => useImageMatchBoard(FIXTURE));
    act(() => result.current.handleWordTap('v-1'));
    expect(result.current.selectedWordId).toBe('v-1');
    act(() => result.current.deselect());
    expect(result.current.selectedWordId).toBeNull();
  });

  it('deselect is a no-op while a mismatch is showing', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useImageMatchBoard(FIXTURE));
    act(() => result.current.handleWordTap('v-1'));
    act(() => result.current.handleImageTap('v-2'));
    act(() => result.current.deselect());
    // still mismatching — selection not cleared until the timer fires
    expect(result.current.wordColumn.find((t) => t.item.id === 'v-1')?.state).toBe('mismatch');
    act(() => jest.advanceTimersByTime(600));
    jest.useRealTimers();
  });

  it('restart resets state', () => {
    const { result } = renderHook(() => useImageMatchBoard(FIXTURE));
    act(() => result.current.handleWordTap('v-1'));
    act(() => result.current.handleImageTap('v-1'));
    act(() => result.current.restart());
    expect(result.current.matchedCount).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.phase).toBe('playing');
  });
});
