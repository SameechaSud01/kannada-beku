/**
 * Guarded haptics wrapper (spec_game_polish §3).
 *
 * Single choke point over `expo-haptics`. Every call is fire-and-forget and
 * swallows errors, so call sites stay one line and it's a safe no-op on
 * platforms/simulators without haptics.
 */
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

function safe(fn: () => Promise<unknown>): void {
  try {
    void fn().catch(() => {});
  } catch {
    // no-op — haptics are non-essential feedback
  }
}

export const haptics = {
  /** Correct answer / correct match — light tap. */
  correct(): void {
    safe(() => Haptics.selectionAsync());
  },
  /** Wrong answer / mismatch / timeout — error buzz. */
  wrong(): void {
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  },
  /** Round complete — success. */
  complete(): void {
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },
};

/**
 * Fires the correct/wrong haptic once when an answer state transitions away
 * from 'unanswered'. Decoupled from game hooks so they stay pure/testable.
 */
export function useAnswerHaptics(state: 'unanswered' | 'correct' | 'wrong'): void {
  const prev = useRef(state);
  useEffect(() => {
    if (prev.current === state) return;
    prev.current = state;
    if (state === 'correct') haptics.correct();
    else if (state === 'wrong') haptics.wrong();
  }, [state]);
}
