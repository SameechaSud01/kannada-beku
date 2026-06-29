import * as Sentry from '@sentry/react-native';
import * as Network from 'expo-network';
import { useSyncQueueStore, type GameKey, type SyncItem } from '../../stores/syncQueueStore';
import { fetchLessonIdBySlug } from '../api/lessons';
import { recordLessonCompletion } from '../api/progress';
import { recordOppositesAttempt } from '../api/games/opposites';
import { recordDictationAttempt } from '../api/games/dictation';
import { recordQuickQuizAttempt } from '../api/games/quickQuiz';
import { recordConversationAttempt } from '../api/games/conversations';

/** Drop an item after this many failed *online* flushes (poison-pill guard). */
const MAX_TRIES = 5;

const GAME_RECORDERS: Record<GameKey, (itemId: string, isCorrect: boolean) => Promise<void>> = {
  opposites: recordOppositesAttempt,
  dictation: recordDictationAttempt,
  quick_quiz: recordQuickQuizAttempt,
  conversation: recordConversationAttempt,
};

/**
 * Best-effort offline check. `expo-network` is the same source `useIsOffline`
 * uses; an unknown/error state reads as online so we don't wrongly queue writes
 * that should surface as real errors.
 */
export async function isCurrentlyOffline(): Promise<boolean> {
  try {
    const s = await Network.getNetworkStateAsync();
    return s.isConnected === false || s.isInternetReachable === false;
  } catch {
    return false;
  }
}

/** Push a single queued write to its RPC. Throws on failure (caller decides). */
async function pushItem(item: SyncItem): Promise<void> {
  if (item.kind === 'lesson') {
    const lessonId = await fetchLessonIdBySlug(item.slug);
    if (!lessonId) throw new Error(`No lesson registered for slug "${item.slug}"`);
    await recordLessonCompletion(lessonId, item.score);
  } else {
    await GAME_RECORDERS[item.game](item.itemId, item.isCorrect);
  }
}

let isFlushing = false;

/**
 * Drain the offline outbox to the server (TODO T019). Safe to call repeatedly —
 * a module-level guard prevents overlapping runs, and every RPC is an idempotent
 * personal-best UPSERT so replaying a write can never lower a score.
 *
 * On a per-item failure: if we're offline we stop (the reconnect listener / next
 * launch resumes); if we're online it's a real error — count it, report to
 * Sentry, and drop the item once it exceeds MAX_TRIES so a poison write can't
 * loop forever.
 */
export async function flushSyncQueue(): Promise<void> {
  if (isFlushing) return;
  const store = useSyncQueueStore.getState();
  if (!store.isHydrated) return;

  const items = Object.values(store.items);
  if (items.length === 0) return;

  isFlushing = true;
  Sentry.addBreadcrumb({ category: 'sync', message: `flush start (${items.length} queued)` });
  try {
    for (const item of items) {
      try {
        await pushItem(item);
        useSyncQueueStore.getState().remove(item.key);
      } catch (err) {
        if (await isCurrentlyOffline()) break; // resume on reconnect / next launch
        useSyncQueueStore.getState().markTried(item.key);
        Sentry.captureException(err, { tags: { feature: 'sync-queue', kind: item.kind } });
        const tries = useSyncQueueStore.getState().items[item.key]?.tries ?? 0;
        if (tries >= MAX_TRIES) {
          useSyncQueueStore.getState().remove(item.key);
          Sentry.addBreadcrumb({
            category: 'sync',
            level: 'warning',
            message: `dropped poison item ${item.key} after ${tries} tries`,
          });
        }
      }
    }
  } finally {
    isFlushing = false;
  }
}

/**
 * Record a game attempt, falling back to the offline outbox. On a network
 * failure the attempt is queued and the promise still resolves (the game UI
 * doesn't depend on the server write). Any non-offline error rethrows so the
 * caller's mutation surfaces it as today.
 */
export async function recordGameAttemptResilient(
  game: GameKey,
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  try {
    await GAME_RECORDERS[game](itemId, isCorrect);
  } catch (err) {
    if (await isCurrentlyOffline()) {
      useSyncQueueStore.getState().enqueue({ kind: 'game', game, itemId, isCorrect });
      Sentry.addBreadcrumb({ category: 'sync', message: `queued game attempt (${game}) offline` });
      return;
    }
    throw err;
  }
}

/** Queue a lesson completion for later push. */
export function enqueueLessonCompletion(slug: string, score: number): void {
  useSyncQueueStore.getState().enqueue({ kind: 'lesson', slug, score });
  Sentry.addBreadcrumb({ category: 'sync', message: `queued lesson completion (${slug}) offline` });
}
