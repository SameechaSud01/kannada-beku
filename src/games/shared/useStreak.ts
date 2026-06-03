/**
 * Consecutive-correct streak counter + best streak (spec_game_polish §2).
 * Mirrors the streak logic in `opposites/hooks/useGameState.ts`, extracted so
 * Quick Quiz / Conversations / Dictation can reuse it.
 */
import { useCallback, useState } from 'react';

export type StreakApi = {
  streak: number;
  bestStreak: number;
  /** Call once per answered question with whether it was correct. */
  record: (isCorrect: boolean) => void;
  reset: () => void;
};

export function useStreak(): StreakApi {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const record = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => (next > b ? next : b));
        return next;
      });
    } else {
      setStreak(0);
    }
  }, []);

  const reset = useCallback(() => {
    setStreak(0);
    setBestStreak(0);
  }, []);

  return { streak, bestStreak, record, reset };
}
