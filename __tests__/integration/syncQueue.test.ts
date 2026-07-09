/**
 * Integration: the offline outbox (stores/syncQueueStore + services/progress/syncQueue).
 *
 * Exercises the real store + flush logic together, mocking only the seams —
 * the record-* RPC wrappers and expo-network. Encodes the Suite-M guarantees
 * from the manual test plan: queued work survives failures, flushes once on
 * reconnect, never duplicates, and a poison item can't wedge the queue.
 */
import { flushSyncQueue, recordGameAttemptResilient } from '../../services/progress/syncQueue';
import { useSyncQueueStore } from '../../stores/syncQueueStore';
import * as Network from 'expo-network';
import { fetchLessonIdBySlug } from '../../services/api/lessons';
import { recordLessonCompletion } from '../../services/api/progress';
import { recordOppositesAttempt } from '../../services/api/games/opposites';
import { recordDictationAttempt } from '../../services/api/games/dictation';

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
}));
jest.mock('../../services/api/lessons', () => ({ fetchLessonIdBySlug: jest.fn() }));
jest.mock('../../services/api/progress', () => ({ recordLessonCompletion: jest.fn() }));
jest.mock('../../services/api/games/opposites', () => ({ recordOppositesAttempt: jest.fn() }));
jest.mock('../../services/api/games/dictation', () => ({ recordDictationAttempt: jest.fn() }));
jest.mock('../../services/api/games/quickQuiz', () => ({ recordQuickQuizAttempt: jest.fn() }));
jest.mock('../../services/api/games/conversations', () => ({
  recordConversationAttempt: jest.fn(),
}));

const mockNetwork = Network.getNetworkStateAsync as jest.Mock;
const goOnline = () =>
  mockNetwork.mockResolvedValue({ isConnected: true, isInternetReachable: true });
const goOffline = () =>
  mockNetwork.mockResolvedValue({ isConnected: false, isInternetReachable: false });

const queueItems = () => useSyncQueueStore.getState().items;

beforeEach(() => {
  jest.clearAllMocks();
  useSyncQueueStore.setState({ items: {}, isHydrated: true });
  goOnline();
});

describe('enqueue merge semantics', () => {
  it('re-queuing the same lesson keeps the higher score', () => {
    const { enqueue } = useSyncQueueStore.getState();
    enqueue({ kind: 'lesson', slug: 'greetings', score: 60 });
    enqueue({ kind: 'lesson', slug: 'greetings', score: 90 });
    enqueue({ kind: 'lesson', slug: 'greetings', score: 70 });

    const items = Object.values(queueItems());
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'lesson', slug: 'greetings', score: 90 });
  });

  it('re-queuing the same game item OR-merges isCorrect (a correct answer is never lost)', () => {
    const { enqueue } = useSyncQueueStore.getState();
    enqueue({ kind: 'game', game: 'opposites', itemId: 'item-1', isCorrect: true });
    enqueue({ kind: 'game', game: 'opposites', itemId: 'item-1', isCorrect: false });

    const items = Object.values(queueItems());
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'game', itemId: 'item-1', isCorrect: true });
  });

  it('distinct lessons and game items queue side by side', () => {
    const { enqueue } = useSyncQueueStore.getState();
    enqueue({ kind: 'lesson', slug: 'greetings', score: 80 });
    enqueue({ kind: 'lesson', slug: 'names', score: 80 });
    enqueue({ kind: 'game', game: 'dictation', itemId: 'item-9', isCorrect: true });
    expect(Object.keys(queueItems())).toHaveLength(3);
  });
});

describe('recordGameAttemptResilient', () => {
  it('records straight to the server when the RPC succeeds', async () => {
    (recordOppositesAttempt as jest.Mock).mockResolvedValue(undefined);
    await recordGameAttemptResilient('opposites', 'item-1', true);

    expect(recordOppositesAttempt).toHaveBeenCalledWith('item-1', true);
    expect(queueItems()).toEqual({});
  });

  it('queues the attempt and resolves when the RPC fails while offline', async () => {
    (recordDictationAttempt as jest.Mock).mockRejectedValue(new Error('network request failed'));
    goOffline();

    await expect(recordGameAttemptResilient('dictation', 'item-2', true)).resolves.toBeUndefined();
    expect(Object.values(queueItems())[0]).toMatchObject({
      kind: 'game',
      game: 'dictation',
      itemId: 'item-2',
      isCorrect: true,
    });
  });

  it('rethrows a failure while online (a real error must surface, not queue)', async () => {
    (recordOppositesAttempt as jest.Mock).mockRejectedValue(new Error('500'));
    goOnline();

    await expect(recordGameAttemptResilient('opposites', 'item-3', false)).rejects.toThrow('500');
    expect(queueItems()).toEqual({});
  });
});

describe('flushSyncQueue', () => {
  it('drains queued game and lesson writes and empties the queue', async () => {
    (recordOppositesAttempt as jest.Mock).mockResolvedValue(undefined);
    (fetchLessonIdBySlug as jest.Mock).mockResolvedValue('lesson-uuid-1');
    (recordLessonCompletion as jest.Mock).mockResolvedValue(undefined);

    const { enqueue } = useSyncQueueStore.getState();
    enqueue({ kind: 'game', game: 'opposites', itemId: 'item-1', isCorrect: true });
    enqueue({ kind: 'lesson', slug: 'greetings', score: 85 });

    await flushSyncQueue();

    expect(recordOppositesAttempt).toHaveBeenCalledWith('item-1', true);
    expect(recordLessonCompletion).toHaveBeenCalledWith('lesson-uuid-1', 85);
    expect(queueItems()).toEqual({});
  });

  it('does nothing before the store has rehydrated (launch race guard)', async () => {
    useSyncQueueStore.setState({ isHydrated: false });
    useSyncQueueStore.getState().enqueue({ kind: 'lesson', slug: 'greetings', score: 85 });

    await flushSyncQueue();
    expect(fetchLessonIdBySlug).not.toHaveBeenCalled();
    expect(Object.keys(queueItems())).toHaveLength(1);
  });

  it('stops on a failure while offline and keeps the item without counting a try', async () => {
    (recordOppositesAttempt as jest.Mock).mockRejectedValue(new Error('network request failed'));
    useSyncQueueStore
      .getState()
      .enqueue({ kind: 'game', game: 'opposites', itemId: 'item-1', isCorrect: true });
    goOffline();

    await flushSyncQueue();

    const item = Object.values(queueItems())[0];
    expect(item).toMatchObject({ itemId: 'item-1', tries: 0 });
  });

  it('counts online failures and drops a poison item after 5 tries', async () => {
    (recordOppositesAttempt as jest.Mock).mockRejectedValue(new Error('constraint violation'));
    useSyncQueueStore
      .getState()
      .enqueue({ kind: 'game', game: 'opposites', itemId: 'poison', isCorrect: true });
    goOnline();

    for (let i = 1; i <= 4; i++) {
      await flushSyncQueue();
      expect(Object.values(queueItems())[0]).toMatchObject({ tries: i });
    }
    await flushSyncQueue(); // 5th failed online try → dropped
    expect(queueItems()).toEqual({});
  });

  it('a failing item does not block later items while online', async () => {
    (recordOppositesAttempt as jest.Mock).mockRejectedValue(new Error('500'));
    (recordDictationAttempt as jest.Mock).mockResolvedValue(undefined);
    const { enqueue } = useSyncQueueStore.getState();
    enqueue({ kind: 'game', game: 'opposites', itemId: 'bad', isCorrect: true });
    enqueue({ kind: 'game', game: 'dictation', itemId: 'good', isCorrect: true });

    await flushSyncQueue();

    expect(recordDictationAttempt).toHaveBeenCalledWith('good', true);
    const remaining = Object.values(queueItems());
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toMatchObject({ itemId: 'bad', tries: 1 });
  });

  it('drops a lesson whose slug no longer resolves, after the poison limit', async () => {
    (fetchLessonIdBySlug as jest.Mock).mockResolvedValue(null);
    useSyncQueueStore.getState().enqueue({ kind: 'lesson', slug: 'retired-lesson', score: 50 });
    goOnline();

    for (let i = 0; i < 5; i++) await flushSyncQueue();

    expect(recordLessonCompletion).not.toHaveBeenCalled();
    expect(queueItems()).toEqual({});
  });
});
