import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const LEGACY_STORAGE_KEY = 'kannada-baa-progress';
const STORAGE_KEY = 'kannada-beku-progress';

/**
 * AsyncStorage adapter that performs a one-time migration from the pre-rename
 * key (`kannada-baa-progress`) to the current key. On first read with no value
 * under the new key, it copies any legacy value over and removes the old key so
 * existing installs keep their streak/XP/completed lessons after the rebrand.
 */
const migratingStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const current = await AsyncStorage.getItem(name);
    if (current != null) return current;
    const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy != null) {
      await AsyncStorage.setItem(name, legacy);
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
    return null;
  },
  setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
  removeItem: (name: string) => AsyncStorage.removeItem(name),
};

interface ProgressState {
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  /**
   * Completed lesson sub-parts, as `"<slug>:<partKey>"` (e.g. "greetings:1a").
   * Drives the sequential sub-part chooser. Client-only by design — a fully
   * completed lesson backfills all its parts from `completedLessons`, so this
   * only needs to remember *partial* progress between sessions.
   */
  completedParts: string[];
  lessonProgress: Record<string, number>;
  xp: number;
  totalPhrasesLearned: number;
  // TODO: tracked via completeLesson but not yet surfaced in UI.
  totalMinutesPracticed: number;
  // TODO: tracked via recordActivity but not yet surfaced in UI.
  weeklyActivity: Record<string, boolean>;
  /** Minutes practiced today — keyed by ISO date so it resets at midnight (MODALS §6.7). */
  todayMinutes: number;
  todayMinutesDate: string;
  /** Most recent date GoalCompleteDialog fired, to prevent repeat shows (MODALS §6.7). */
  lastGoalCelebrationDate: string | null;
  isHydrated: boolean;

  updateLessonProgress: (lessonId: string, phraseIndex: number) => void;
  /** Mark one lesson sub-part complete (idempotent). */
  completePart: (slug: string, partKey: string) => void;
  completeLesson: (
    lessonId: string,
    score: number,
    phrasesLearned: number,
    minutesPracticed: number
  ) => void;
  updateStreak: () => void;
  recordActivity: () => void;
  markGoalCelebrated: () => void;
  setHydrated: (hydrated: boolean) => void;
  /**
   * Merge server-fetched completion slugs into completedLessons as a
   * deduped union. Does not touch xp, streak, lessonProgress, or any
   * other field — completion-only by design (spec_progress_persistence).
   */
  hydrateFromServerCompletions: (slugs: string[]) => void;
  /**
   * Wipe all progress. Called on signOut and when the signed-in Supabase
   * user changes, so a different account doesn't inherit another user's progress.
   */
  reset: () => void;
}

const getTodayISO = () => new Date().toISOString().split('T')[0];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastActiveDate: '',
      completedLessons: [],
      completedParts: [],
      lessonProgress: {},
      xp: 0,
      totalPhrasesLearned: 0,
      totalMinutesPracticed: 0,
      weeklyActivity: {},
      todayMinutes: 0,
      todayMinutesDate: '',
      lastGoalCelebrationDate: null,
      isHydrated: false,

      updateLessonProgress: (lessonId, phraseIndex) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: phraseIndex,
          },
        })),

      completePart: (slug, partKey) =>
        set((state) => {
          const key = `${slug}:${partKey}`;
          if (state.completedParts.includes(key)) return state;
          return { completedParts: [...state.completedParts, key] };
        }),

      completeLesson: (lessonId, score, phrasesLearned, minutesPracticed) =>
        set((state) => {
          // Idempotent: re-entering a completed lesson must not double-count.
          // Streak and lastActiveDate are intentionally not updated here —
          // call updateStreak() separately to keep streak logic in one place.
          if (state.completedLessons.includes(lessonId)) return state;
          const xpAward = score >= 80 ? 20 : 10;
          const today = getTodayISO();
          const carryToday = state.todayMinutesDate === today ? state.todayMinutes : 0;
          return {
            completedLessons: [...state.completedLessons, lessonId],
            xp: state.xp + xpAward,
            totalPhrasesLearned: state.totalPhrasesLearned + phrasesLearned,
            totalMinutesPracticed: state.totalMinutesPracticed + minutesPracticed,
            todayMinutes: carryToday + minutesPracticed,
            todayMinutesDate: today,
          };
        }),

      updateStreak: () => {
        const today = getTodayISO();
        const { lastActiveDate, streak } = get();

        if (lastActiveDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().split('T')[0];

        const newStreak = lastActiveDate === yesterdayISO ? streak + 1 : 1;

        set({ streak: newStreak, lastActiveDate: today });
      },

      recordActivity: () => {
        const today = getTodayISO();
        set((state) => ({
          weeklyActivity: {
            ...state.weeklyActivity,
            [today]: true,
          },
        }));
      },

      markGoalCelebrated: () => set({ lastGoalCelebrationDate: getTodayISO() }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      hydrateFromServerCompletions: (slugs) =>
        set((state) => {
          const merged = new Set(state.completedLessons);
          for (const slug of slugs) merged.add(slug);
          if (merged.size === state.completedLessons.length) return state;
          return { completedLessons: Array.from(merged) };
        }),

      reset: () =>
        set({
          streak: 0,
          lastActiveDate: '',
          completedLessons: [],
          completedParts: [],
          lessonProgress: {},
          xp: 0,
          totalPhrasesLearned: 0,
          totalMinutesPracticed: 0,
          weeklyActivity: {},
          todayMinutes: 0,
          todayMinutesDate: '',
          lastGoalCelebrationDate: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => migratingStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
