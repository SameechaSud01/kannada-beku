/**
 * Integration: end-of-game mastery refresh (services/progress/masteryRefresh,
 * spec_scalability_offline_fixes Phase 1). The dirty flag is module state, so
 * each test re-imports the module in isolation.
 */
import type { QueryClient } from '@tanstack/react-query';

// Mock the direct seam: masteryRefresh only uses syncQueue for the offline
// check, and importing the real module would drag in the Supabase client.
jest.mock('../../services/progress/syncQueue', () => ({ isCurrentlyOffline: jest.fn() }));

// Silence the logger here: this suite deliberately drives the online/offline
// paths that log [progress] lines, and that console noise isn't under test.
jest.mock('../../lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { isCurrentlyOffline } = require('../../services/progress/syncQueue');
const mockOffline = isCurrentlyOffline as jest.Mock;

const goOnline = () => mockOffline.mockResolvedValue(false);
const goOffline = () => mockOffline.mockResolvedValue(true);

function fakeQueryClient(mutating = 0) {
  return {
    isMutating: jest.fn(() => mutating),
    refetchQueries: jest.fn(async () => undefined),
  } as unknown as QueryClient & { refetchQueries: jest.Mock };
}

/** Fresh module instance so the module-level dirty flag starts clean. */
function loadModule() {
  let mod: typeof import('../../services/progress/masteryRefresh');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('../../services/progress/masteryRefresh');
  });
  return mod!;
}

beforeEach(() => {
  jest.clearAllMocks();
  goOnline();
});

describe('refreshGameMasteryIfDirty', () => {
  it('does nothing when no answers were recorded', async () => {
    const { refreshGameMasteryIfDirty } = loadModule();
    const qc = fakeQueryClient();
    await refreshGameMasteryIfDirty(qc, 'user-1');
    expect(qc.refetchQueries).not.toHaveBeenCalled();
  });

  it('refetches the user-scoped mastery query once dirty, then clears the flag', async () => {
    const { markMasteryDirty, refreshGameMasteryIfDirty } = loadModule();
    const qc = fakeQueryClient();

    markMasteryDirty();
    await refreshGameMasteryIfDirty(qc, 'user-1');
    expect(qc.refetchQueries).toHaveBeenCalledWith({ queryKey: ['game-mastery', 'user-1'] });

    await refreshGameMasteryIfDirty(qc, 'user-1');
    expect(qc.refetchQueries).toHaveBeenCalledTimes(1);
  });

  it('skips while offline but stays dirty so the next opportunity refetches', async () => {
    const { markMasteryDirty, refreshGameMasteryIfDirty } = loadModule();
    const qc = fakeQueryClient();

    markMasteryDirty();
    goOffline();
    await refreshGameMasteryIfDirty(qc, 'user-1');
    expect(qc.refetchQueries).not.toHaveBeenCalled();

    goOnline();
    await refreshGameMasteryIfDirty(qc, 'user-1');
    expect(qc.refetchQueries).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a signed-in user', async () => {
    const { markMasteryDirty, refreshGameMasteryIfDirty } = loadModule();
    const qc = fakeQueryClient();

    markMasteryDirty();
    await refreshGameMasteryIfDirty(qc, undefined);
    expect(qc.refetchQueries).not.toHaveBeenCalled();
  });
});
