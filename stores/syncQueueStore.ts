import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Games whose per-item attempts are recorded through a `record_*_attempt` RPC. */
export type GameKey = 'opposites' | 'dictation' | 'quick_quiz' | 'conversation';

/**
 * One pending server write held locally until it can be pushed (TODO T019).
 * `key` is the dedup id so re-queuing the same lesson/item merges instead of
 * piling up; `tries` counts failed *online* flush attempts so a permanently
 * failing ("poison") item is eventually dropped instead of looping forever.
 */
export type SyncItem =
  | { kind: 'lesson'; key: string; slug: string; score: number; queuedAt: string; tries: number }
  | {
      kind: 'game';
      key: string;
      game: GameKey;
      itemId: string;
      isCorrect: boolean;
      queuedAt: string;
      tries: number;
    };

/** What callers pass to `enqueue` — `key`/`queuedAt`/`tries` are filled in here. */
export type SyncDraft =
  | { kind: 'lesson'; slug: string; score: number }
  | { kind: 'game'; game: GameKey; itemId: string; isCorrect: boolean };

const draftKey = (d: SyncDraft): string =>
  d.kind === 'lesson' ? `lesson:${d.slug}` : `game:${d.game}:${d.itemId}`;

interface SyncQueueState {
  /** Pending writes keyed by `key` for O(1) dedup/merge. */
  items: Record<string, SyncItem>;
  isHydrated: boolean;

  /** Add or merge a pending write. Lessons keep the higher score; game attempts
   *  OR-merge `isCorrect` — both match the server's personal-best UPSERT. */
  enqueue: (draft: SyncDraft) => void;
  remove: (key: string) => void;
  markTried: (key: string) => void;
  setHydrated: (hydrated: boolean) => void;
  clear: () => void;
}

export const useSyncQueueStore = create<SyncQueueState>()(
  persist(
    (set) => ({
      items: {},
      isHydrated: false,

      enqueue: (draft) =>
        set((s) => {
          const key = draftKey(draft);
          const existing = s.items[key];
          const queuedAt = new Date().toISOString();
          let next: SyncItem;
          if (draft.kind === 'lesson') {
            const prevScore =
              existing && existing.kind === 'lesson' ? existing.score : Number.NEGATIVE_INFINITY;
            next = {
              kind: 'lesson',
              key,
              slug: draft.slug,
              score: Math.max(prevScore, draft.score),
              queuedAt,
              tries: 0,
            };
          } else {
            const prevCorrect =
              existing && existing.kind === 'game' ? existing.isCorrect : false;
            next = {
              kind: 'game',
              key,
              game: draft.game,
              itemId: draft.itemId,
              isCorrect: prevCorrect || draft.isCorrect,
              queuedAt,
              tries: 0,
            };
          }
          return { items: { ...s.items, [key]: next } };
        }),

      remove: (key) =>
        set((s) => {
          if (!s.items[key]) return s;
          const next = { ...s.items };
          delete next[key];
          return { items: next };
        }),

      markTried: (key) =>
        set((s) => {
          const existing = s.items[key];
          if (!existing) return s;
          return { items: { ...s.items, [key]: { ...existing, tries: existing.tries + 1 } } };
        }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      clear: () => set({ items: {} }),
    }),
    {
      name: 'sync_queue',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }),
      // Release the hydration gate even if rehydration fails, mirroring
      // useUserStore — a corrupt queue must not wedge the launch flush.
      onRehydrateStorage: () => (state, error) => {
        (state ?? useSyncQueueStore.getState()).setHydrated(true);
        if (error) console.warn('[sync] queue rehydrate failed', error);
      },
    },
  ),
);
