import { useUserStore } from '../stores/useUserStore';

export type FluencyMode = 'spoken' | 'fluency';

/**
 * Collapses the 3-typed store value (`'spoken' | 'written' | 'both'`) down to
 * the 2 UI options surfaced on the profile screen. `'written'` is a legacy
 * value retained in the schema; it folds into 'fluency' alongside 'both'.
 * Returns null when no learning mode is set (pre-onboarding).
 *
 * See STATE.md §useUserStore and spec_profile_settings_wiring.md §1.
 */
export function fluencyFromStore(
  mode: 'spoken' | 'written' | 'both' | null,
): FluencyMode | null {
  if (mode === null) return null;
  if (mode === 'spoken') return 'spoken';
  return 'fluency';
}

export function fluencyToStore(goal: FluencyMode): 'spoken' | 'both' {
  return goal === 'spoken' ? 'spoken' : 'both';
}

export function useFluencyMode(): FluencyMode | null {
  const learningMode = useUserStore((s) => s.learningMode);
  return fluencyFromStore(learningMode);
}
