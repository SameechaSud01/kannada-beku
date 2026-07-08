import { supabase } from '../supabase';
import { DICTATION_ITEMS_BY_LESSON } from '../../../constants/games/dictationItems';

export type DictationItem = {
  id: string;
  lessonId: string;
  lessonNo: number;
  sortOrder: number;
  expectedAnswer: string;
  acceptedSpellings: string[];
  phonetic: string | null;
  audioUrl: string | null;
  section: string | null;
};

/**
 * Bundled-first (spec_scalability_offline_fixes Phase 3): items ship in the
 * binary with their real DB row UUIDs (progress rows + record RPCs key on
 * them). dictation_items remains the regeneration source — `npm run
 * gen:content` after any dashboard content change.
 */
export async function fetchDictationItemsByLessonNo(lessonNo: number): Promise<DictationItem[]> {
  return DICTATION_ITEMS_BY_LESSON[lessonNo] ?? [];
}

/**
 * UPSERT into dictation_progress via SECURITY INVOKER RPC.
 * OR-merges is_correct (personal-best); increments attempts; updates last_played.
 */
export async function recordDictationAttempt(itemId: string, isCorrect: boolean): Promise<void> {
  const { error } = await supabase.rpc('record_dictation_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
