import { supabase } from '../supabase';
import { OPPOSITES_ITEMS_BY_LESSON } from '../../../constants/games/oppositesItems';

export type OppositesOption = {
  kn: string;
  tr: string;
  en: string;
};

export type OppositesItem = {
  id: string;
  lessonId: string;
  lessonNo: number;
  sortOrder: number;
  word: string;
  opposite: string;
  transliteration: string | null;
  meaning: string | null;
  section: string | null;
  options: OppositesOption[];
};

/**
 * Bundled-first (spec_scalability_offline_fixes Phase 3): items ship in the
 * binary with their real DB row UUIDs (progress rows + record RPCs key on
 * them). opposites_items remains the regeneration source — `npm run
 * gen:content` after any dashboard content change.
 */
export async function fetchOppositesItemsByLessonNo(lessonNo: number): Promise<OppositesItem[]> {
  return OPPOSITES_ITEMS_BY_LESSON[lessonNo] ?? [];
}

/**
 * UPSERT into opposites_progress via SECURITY INVOKER RPC.
 * OR-merges is_correct (personal-best); increments attempts; updates last_played.
 */
export async function recordOppositesAttempt(itemId: string, isCorrect: boolean): Promise<void> {
  const { error } = await supabase.rpc('record_opposites_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
