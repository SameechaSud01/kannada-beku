import { useStreak } from './progress';
import { useModal } from '../components/modals/ModalHost';
import { Celebration } from '../components/ui/Celebration';
import { isStreakMilestone } from '../components/modals/instances/StreakMilestoneTakeover';

/**
 * Shared streak-pill behaviour for the tab top bars. The flame wiggle lives in
 * `StreakPill`; this only replays the streak Celebration on a real milestone day
 * (locked milestone copy — no fake milestones). Returns the current streak plus
 * the press handler to hand to `TopBar`.
 */
export function useStreakCelebration() {
  const streak = useStreak();
  const modal = useModal();

  const onStreakPress = () => {
    if (isStreakMilestone(streak)) {
      modal.show({
        kind: 'takeover',
        component: Celebration,
        props: { kind: 'streak', streak, onClose: () => modal.dismiss() },
      });
    }
  };

  return { streak, onStreakPress };
}
