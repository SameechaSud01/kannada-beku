import { useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { updateTtsRate } from '../services/api/users';
import { Toasts } from '../components/modals/instances/toastCatalog';
import { RATE_OPTIONS } from '../constants/audio';

/**
 * Shared TTS-rate preference controller. Optimistically updates the persisted
 * `ttsRate` (AsyncStorage + Supabase), rolling back with a toast on server
 * failure. Used by both Settings → Audio and the in-lesson speed control so the
 * two never drift (spec_lesson_runner_ux §2.4).
 */
export function useTtsRate() {
  const userId = useAuthStore((s) => s.user?.id);
  const ttsRate = useUserStore((s) => s.ttsRate);
  const setTtsRate = useUserStore((s) => s.setTtsRate);

  const changeRate = useCallback(
    async (next: number) => {
      const previous = useUserStore.getState().ttsRate;
      if (!userId || next === previous) return;
      setTtsRate(next);
      try {
        await updateTtsRate(userId, next);
      } catch (err) {
        console.warn('[audio] updateTtsRate failed', err);
        setTtsRate(previous);
        Toasts.preferenceSaveFailed();
      }
    },
    [userId, setTtsRate],
  );

  /** Advance to the next rate in `RATE_OPTIONS`, wrapping around. */
  const cycleRate = useCallback(() => {
    const current = useUserStore.getState().ttsRate;
    const idx = RATE_OPTIONS.findIndex((o) => o.value === current);
    const next = RATE_OPTIONS[(idx + 1) % RATE_OPTIONS.length].value;
    void changeRate(next);
  }, [changeRate]);

  return { ttsRate, changeRate, cycleRate };
}
