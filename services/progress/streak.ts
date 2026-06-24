import { useAuthStore } from '../../stores/useAuthStore';
import { useProgressStore } from '../../stores/progressStore';
import { updateStreakOnServer } from '../api/users';

/**
 * Record one qualifying "learning day" (audit H2/B4): advance the streak
 * (idempotent — at most once per local day), stamp weekly activity, and mirror
 * the streak to the server so it survives reinstall / a new device.
 *
 * Call on any meaningful learning action: completing a lesson, a lesson
 * sub-part, or a game part — not just whole-lesson completion. The network
 * write is fire-and-forget; the local store stays the live source of truth.
 */
export function recordLearningDay(): void {
  const before = useProgressStore.getState().lastActiveDate;
  useProgressStore.getState().updateStreak();
  useProgressStore.getState().recordActivity();

  const after = useProgressStore.getState();
  // Only hit the network when the streak actually rolled to a new day.
  if (after.lastActiveDate === before) return;

  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;
  updateStreakOnServer(userId, after.streak, after.lastActiveDate).catch((err) =>
    console.warn('[streak] server persist failed', err),
  );
}
