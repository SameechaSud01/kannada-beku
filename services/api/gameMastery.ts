import { supabase } from './supabase';
import { logger } from '../../lib/logger';
import { withTimeout, DEFAULT_TIMEOUT_MS } from '../../lib/withTimeout';
import { TS_LESSONS } from '../../constants/lessons/lessonContent';
import { fetchOppositesItemsByLessonNo } from './games/opposites';
import { fetchDictationItemsByLessonNo } from './games/dictation';
import { fetchQuickQuizItemsByLessonNo } from './games/quickQuiz';
import { fetchConversationScenariosByLessonNo } from './games/conversations';

/** Per-lesson games tally: how many of a lesson's game items the user has
 *  ever answered correctly (personal-best), out of the total that exist. */
export type LessonMastery = { correct: number; total: number };
export type GameMasteryByLesson = Record<number, LessonMastery>;

/**
 * All four games share the same progress shape:
 *   (user_id, item_id, is_correct, attempts, last_played)
 * with item_id FK'd to <game>_items. `is_correct` is OR-merged personal-best,
 * so "correct" means "got it right at least once".
 */
type ProgressTable =
  'opposites_progress' | 'dictation_progress' | 'quick_quiz_progress' | 'conversation_progress';

/** Item ids the user has ever answered correctly for one game (RLS scopes the
 *  read to this user; we also filter on user_id defensively). Read-only. */
async function fetchCorrectItemIds(table: ProgressTable, userId: string): Promise<Set<string>> {
  const { data, error } = await withTimeout(
    supabase
      .from(table)
      .select('item_id')
      .eq('user_id', userId)
      .eq('is_correct', true)
      // Defensive cap (Phase 4) — well above any game's total item count.
      .limit(2000),
    DEFAULT_TIMEOUT_MS,
    `fetchCorrectItemIds:${table}`,
  );
  if (error) throw error;
  return new Set((data ?? []).map((r) => (r as { item_id: string }).item_id));
}

const LESSON_NOS = TS_LESSONS.map((l) => l.lessonNo);

/** Map lessonNo -> the game's item ids in that lesson (totals + correctness map). */
async function itemIdsByLesson(
  fetchIds: (lessonNo: number) => Promise<string[]>,
): Promise<Map<number, string[]>> {
  const lists = await Promise.all(LESSON_NOS.map((no) => fetchIds(no)));
  return new Map(LESSON_NOS.map((no, i) => [no, lists[i]]));
}

/** {correct, total} per lesson for a single game. */
async function gameMastery(
  table: ProgressTable,
  fetchIds: (lessonNo: number) => Promise<string[]>,
  userId: string,
): Promise<GameMasteryByLesson> {
  const [correctSet, idsByLesson] = await Promise.all([
    fetchCorrectItemIds(table, userId),
    itemIdsByLesson(fetchIds),
  ]);
  const out: GameMasteryByLesson = {};
  for (const [lessonNo, ids] of idsByLesson) {
    const correct = ids.reduce((n, id) => (correctSet.has(id) ? n + 1 : n), 0);
    out[lessonNo] = { correct, total: ids.length };
  }
  return out;
}

/**
 * Sum every game's {correct, total} per lesson. Read-only — the per-lesson
 * item fetchers now resolve from bundled constants (Phase 3), so this issues
 * exactly four network reads (one per `*_progress` table). No DDL, no writes.
 *
 * Every game with content for a lesson counts, weighted by its real item
 * volume — there is no per-game weighting constant to tune. This is the
 * "practice" half of the overall-progress rollup (see overallMastery.ts).
 */
export async function fetchGameMasteryByLesson(userId: string): Promise<GameMasteryByLesson> {
  const start = Date.now();
  const games = await Promise.all([
    gameMastery(
      'opposites_progress',
      async (no) => (await fetchOppositesItemsByLessonNo(no)).map((i) => i.id),
      userId,
    ),
    gameMastery(
      'dictation_progress',
      async (no) => (await fetchDictationItemsByLessonNo(no)).map((i) => i.id),
      userId,
    ),
    gameMastery(
      'quick_quiz_progress',
      async (no) => (await fetchQuickQuizItemsByLessonNo(no)).map((i) => i.id),
      userId,
    ),
    gameMastery(
      'conversation_progress',
      async (no) =>
        (await fetchConversationScenariosByLessonNo(no)).flatMap((s) => s.turns.map((t) => t.id)),
      userId,
    ),
  ]);

  const merged: GameMasteryByLesson = {};
  for (const game of games) {
    for (const [noStr, m] of Object.entries(game)) {
      const no = Number(noStr);
      const cur = merged[no] ?? { correct: 0, total: 0 };
      merged[no] = { correct: cur.correct + m.correct, total: cur.total + m.total };
    }
  }
  logger.info('progress', 'game-mastery computed (4 progress reads, bundled items)', {
    ms: Math.round(Date.now() - start),
  });
  return merged;
}
