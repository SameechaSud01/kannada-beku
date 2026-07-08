import type { QueryClient } from '@tanstack/react-query';
import { isCurrentlyOffline } from './syncQueue';
import { logger } from '../../lib/logger';

/**
 * End-of-game refresh for the ['game-mastery', userId] query
 * (spec_scalability_offline_fixes Phase 1).
 *
 * Recorded answers mark the mastery rollup dirty; the actual refetch runs once
 * per game session — when the shared ResultScreen mounts (so the data is fresh
 * before the user can reach Profile) and on game-screen unmount (covers
 * mid-game quits). Replaces the per-answer invalidateQueries in the four game
 * hooks, which re-triggered the full mastery fan-out on every later
 * Profile/Home mount.
 */

let masteryDirty = false;

/** Called from each game's record-attempt onSuccess. */
export function markMasteryDirty(): void {
  masteryDirty = true;
}

/** Attempt writes are fire-and-forget; don't refetch while any are in flight. */
async function waitForMutationsToSettle(queryClient: QueryClient, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  while (queryClient.isMutating() > 0 && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

/**
 * Refetch game mastery if any answers were recorded since the last refresh.
 * Offline: keep the dirty flag — queued attempts flush later and the next
 * refresh opportunity (or the login prefetch) picks them up.
 */
export async function refreshGameMasteryIfDirty(
  queryClient: QueryClient,
  userId: string | undefined,
): Promise<void> {
  if (!masteryDirty || !userId) return;
  if (await isCurrentlyOffline()) {
    logger.info('progress', 'mastery refresh skipped: offline (stays dirty)');
    return;
  }
  await waitForMutationsToSettle(queryClient);
  masteryDirty = false;
  const start = Date.now();
  await queryClient.refetchQueries({ queryKey: ['game-mastery', userId] });
  logger.info('progress', 'game-mastery refetched at game end', {
    ms: Math.round(Date.now() - start),
  });
}
