import { useStreak } from './progress';
import { useModal } from '../components/modals/ModalHost';
import { StreakDetailSheet } from '../components/modals/instances/StreakDetailSheet';

/**
 * Shared streak-pill behaviour for the tab top bars. The flame wiggle lives in
 * `StreakPill`; tapping it opens the StreakDetailSheet (week dots + next-badge
 * nudge). Returns the current streak plus the press handler to hand to `TopBar`.
 */
export function useStreakCelebration() {
  const streak = useStreak();
  const modal = useModal();

  const onStreakPress = () => {
    modal.show({ kind: 'sheet', component: StreakDetailSheet });
  };

  return { streak, onStreakPress };
}
