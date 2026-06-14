import { useStreak } from './progress';
import { useModal } from '../components/modals/ModalHost';
import { Celebration } from '../components/ui/Celebration';
import { isStreakMilestone } from '../components/modals/instances/StreakMilestoneTakeover';
import { StreakDetailSheet } from '../components/modals/instances/StreakDetailSheet';

/**
 * Shared streak-pill behaviour for the tab top bars. The flame wiggle lives in
 * `StreakPill`; on a real milestone day this replays the streak Celebration
 * (locked milestone copy — no fake milestones), and on any other day it opens
 * the StreakDetailSheet (week dots + next-badge nudge). Returns the current
 * streak plus the press handler to hand to `TopBar`.
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
    } else {
      modal.show({ kind: 'sheet', component: StreakDetailSheet });
    }
  };

  return { streak, onStreakPress };
}
