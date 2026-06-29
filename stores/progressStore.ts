import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { localDateISO, localYesterdayISO } from '../utils/date';
import { TS_LESSONS_BY_SLUG } from '../constants/lessons/lessonContent';

/** Every completed lesson awards a flat 20 XP (completion score is always 100). */
const LESSON_XP = 20;

/**
 * Words+phrases implied by a set of completed lesson slugs — the same
 * `words.length + phrases.length` a lesson contributes via completeLesson.
 * Used to rebuild the local-only xp/words counters after a reinstall, where
 * completedLessons is restored from the server but the counters are not
 * (audit B4/H1). Slugs without TS content (e.g. L0 basics) contribute 0.
 */
function itemsLearnedFor(slugs: Iterable<string>): number {
  let total = 0;
  for (const slug of slugs) {
    const lesson = TS_LESSONS_BY_SLUG[slug];
    if (lesson) total += lesson.words.length + lesson.phrases.length;
  }
  return total;
}

function lessonXpFor(slugs: Iterable<string>): number {
  let total = 0;
  for (const slug of slugs) if (TS_LESSONS_BY_SLUG[slug]) total += LESSON_XP;
  return total;
}

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

/** Per-day activity tally for the daily-goal rings (see ProgressState.dailyActivity). */
export interface DailyActivity {
  date: string;
  listen: number;
  speak: number;
  practice: number;
}

const EMPTY_DAILY_ACTIVITY: DailyActivity = { date: '', listen: 0, speak: 0, practice: 0 };

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
  /**
   * Completed game sub-parts, as `"<gameKey>:<sectionKey>"` (e.g.
   * "opposites:1a"). Drives the sequential per-game part chooser
   * (spec_game_subsection_split). Section keys embed the lesson number, so they
   * are unique across lessons. Client-only, mirroring `completedParts`.
   */
  completedGameParts: string[];
  lessonProgress: Record<string, number>;
  xp: number;
  totalPhrasesLearned: number;
  /** Surfaced on Profile via `useMinutesPracticed()` (T008). */
  totalMinutesPracticed: number;
  /** Surfaced on the Profile week-view via `useWeekActivity()` (T009). */
  weeklyActivity: Record<string, boolean>;
  /** Minutes practiced today — keyed by ISO date so it resets at midnight (MODALS §6.7). */
  todayMinutes: number;
  todayMinutesDate: string;
  /**
   * Per-day Listen/Speak/Practice activity counts for the daily-goal rings.
   * Client-only by design: the DB has no per-day activity table, and Listen
   * (audio plays) + Speak (practice reps) have no server footprint at all.
   * `date` keys the counts to one ISO day so they reset at midnight — reads
   * for any other day are treated as zero (see useDailyGoal).
   */
  dailyActivity: DailyActivity;
  /** Most recent date GoalCompleteDialog fired, to prevent repeat shows (MODALS §6.7). */
  lastGoalCelebrationDate: string | null;
  isHydrated: boolean;

  updateLessonProgress: (lessonId: string, phraseIndex: number) => void;
  /** Mark one lesson sub-part complete (idempotent). */
  completePart: (slug: string, partKey: string) => void;
  /** Mark one game sub-part complete (idempotent). */
  completeGamePart: (gameKey: string, sectionKey: string) => void;
  completeLesson: (
    lessonId: string,
    score: number,
    phrasesLearned: number,
    minutesPracticed: number,
  ) => void;
  updateStreak: () => void;
  recordActivity: () => void;
  /** +1 to today's Listen count (an in-app audio play). Resets at date rollover. */
  recordListen: () => void;
  /** +1 to today's Speak count (a practice-phase rep). Resets at date rollover. */
  recordSpeak: () => void;
  /** +1 to today's Practice count (a game question answered). Resets at date rollover. */
  recordPractice: () => void;
  markGoalCelebrated: () => void;
  setHydrated: (hydrated: boolean) => void;
  /**
   * Merge server-fetched completion slugs into completedLessons as a
   * deduped union. Does not touch xp, streak, lessonProgress, or any
   * other field — completion-only by design (spec_progress_persistence).
   */
  hydrateFromServerCompletions: (slugs: string[]) => void;
  /**
   * Adopt the server-persisted streak when it reflects equal-or-more-recent
   * activity than the local store (true after a reinstall, where local is
   * empty). No-op when local is already as fresh (audit B4).
   */
  hydrateStreakFromServer: (serverStreak: number, serverLastActive: string | null) => void;
  /**
   * Wipe all progress. Called on signOut and when the signed-in Supabase
   * user changes, so a different account doesn't inherit another user's progress.
   */
  reset: () => void;
}

const getTodayISO = () => localDateISO();

/**
 * Increment one dimension of today's activity tally, rolling the counts over to
 * a fresh day when the stored date is stale. Returns the partial state update.
 */
const bumpDaily = (
  current: DailyActivity,
  key: 'listen' | 'speak' | 'practice',
): { dailyActivity: DailyActivity } => {
  const today = getTodayISO();
  const base = current.date === today ? current : { ...EMPTY_DAILY_ACTIVITY, date: today };
  return { dailyActivity: { ...base, [key]: base[key] + 1 } };
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastActiveDate: '',
      completedLessons: [],
      completedParts: [],
      completedGameParts: [],
      lessonProgress: {},
      xp: 0,
      totalPhrasesLearned: 0,
      totalMinutesPracticed: 0,
      weeklyActivity: {},
      todayMinutes: 0,
      todayMinutesDate: '',
      dailyActivity: EMPTY_DAILY_ACTIVITY,
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

      completeGamePart: (gameKey, sectionKey) =>
        set((state) => {
          const key = `${gameKey}:${sectionKey}`;
          if (state.completedGameParts.includes(key)) return state;
          return { completedGameParts: [...state.completedGameParts, key] };
        }),

      completeLesson: (lessonId, score, phrasesLearned, minutesPracticed) =>
        set((state) => {
          // Idempotent: re-entering a completed lesson must not double-count.
          // Streak and lastActiveDate are intentionally not updated here —
          // call updateStreak() separately to keep streak logic in one place.
          if (state.completedLessons.includes(lessonId)) return state;
          const xpAward = typeof score === 'number' && score >= 80 ? 20 : 10;
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

        const yesterdayISO = localYesterdayISO();

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

      recordListen: () => set((state) => bumpDaily(state.dailyActivity, 'listen')),
      recordSpeak: () => set((state) => bumpDaily(state.dailyActivity, 'speak')),
      recordPractice: () => set((state) => bumpDaily(state.dailyActivity, 'practice')),

      markGoalCelebrated: () => set({ lastGoalCelebrationDate: getTodayISO() }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      hydrateFromServerCompletions: (slugs) =>
        set((state) => {
          const merged = new Set(state.completedLessons);
          for (const slug of slugs) merged.add(slug);
          const mergedArr = Array.from(merged);
          // Rebuild the local-only words/xp counters from the merged completion
          // set so a reinstall shows correct stats. max() preserves any higher
          // legit local value and keeps this idempotent against the live
          // completeLesson increment (audit B4/H1).
          const nextWords = Math.max(state.totalPhrasesLearned, itemsLearnedFor(mergedArr));
          const nextXp = Math.max(state.xp, lessonXpFor(mergedArr));
          if (
            merged.size === state.completedLessons.length &&
            nextWords === state.totalPhrasesLearned &&
            nextXp === state.xp
          ) {
            return state;
          }
          return {
            completedLessons: mergedArr,
            totalPhrasesLearned: nextWords,
            xp: nextXp,
          };
        }),

      hydrateStreakFromServer: (serverStreak, serverLastActive) =>
        set((state) => {
          if (!serverLastActive) return state;
          // ISO dates compare lexicographically. Keep local when it's at least
          // as recent; otherwise adopt the server's streak + last-active day.
          if (state.lastActiveDate && state.lastActiveDate >= serverLastActive) return state;
          return { streak: serverStreak, lastActiveDate: serverLastActive };
        }),

      reset: () =>
        set({
          streak: 0,
          lastActiveDate: '',
          completedLessons: [],
          completedParts: [],
          completedGameParts: [],
          lessonProgress: {},
          xp: 0,
          totalPhrasesLearned: 0,
          totalMinutesPracticed: 0,
          weeklyActivity: {},
          todayMinutes: 0,
          todayMinutesDate: '',
          dailyActivity: EMPTY_DAILY_ACTIVITY,
          lastGoalCelebrationDate: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => migratingStorage),
      // Always release the boot gate, even when rehydration fails (corrupt or
      // locked storage). On error zustand passes `state === undefined`, so reach
      // the store via getState() — otherwise isHydrated stays false and the
      // splash screen hangs forever (audit B1).
      onRehydrateStorage: () => (state, error) => {
        (state ?? useProgressStore.getState()).setHydrated(true);
        if (error) console.warn('[progress] rehydrate failed', error);
      },
    },
  ),
);
