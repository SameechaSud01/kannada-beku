import { supabase } from '../supabase';
import { QUICK_QUIZ_ITEMS_BY_LESSON } from '../../../constants/games/quickQuizItems';

export type QuickQuizItem = {
  id: string;
  lessonId: string;
  lessonNo: number;
  sortOrder: number;
  kannada: string;
  transliteration: string | null;
  meaning: string;
  section: string | null;
};

/**
 * Bundled-first (spec_scalability_offline_fixes Phase 3): items ship in the
 * binary with their real DB row UUIDs (progress rows + record RPCs key on
 * them). quick_quiz_items remains the regeneration source — `npm run
 * gen:content` after any dashboard content change.
 */
export async function fetchQuickQuizItemsByLessonNo(lessonNo: number): Promise<QuickQuizItem[]> {
  return QUICK_QUIZ_ITEMS_BY_LESSON[lessonNo] ?? [];
}

/**
 * UPSERT into quick_quiz_progress via SECURITY INVOKER RPC.
 * OR-merges is_correct (personal-best); increments attempts; updates last_played.
 * Note: Quick Quiz is excluded from user_overall_progress (locked formula),
 * so there is no overall-progress recompute on the server side.
 */
export async function recordQuickQuizAttempt(itemId: string, isCorrect: boolean): Promise<void> {
  const { error } = await supabase.rpc('record_quick_quiz_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
