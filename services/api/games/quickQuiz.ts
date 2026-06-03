import { supabase } from '../supabase';

export type QuickQuizItem = {
  id: string;
  lessonId: string;
  lessonNo: number;
  sortOrder: number;
  kannada: string;
  transliteration: string | null;
  meaning: string;
};

type Row = {
  id: string;
  lesson_id: string;
  sort_order: number;
  kannada: string;
  transliteration: string | null;
  meaning: string;
};

// Module-level cache for lesson_no -> lesson_id. Mirrors the cache in the
// other game accessors. lessons rows are append-only and stable.
const lessonNoToId = new Map<number, string>();

async function lessonIdByNo(lessonNo: number): Promise<string | null> {
  const cached = lessonNoToId.get(lessonNo);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('lesson_no', lessonNo)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  lessonNoToId.set(lessonNo, data.id as string);
  return data.id as string;
}

function mapRow(row: Row, lessonNo: number): QuickQuizItem {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    lessonNo,
    sortOrder: row.sort_order,
    kannada: row.kannada,
    transliteration: row.transliteration,
    meaning: row.meaning,
  };
}

export async function fetchQuickQuizItemsByLessonNo(
  lessonNo: number,
): Promise<QuickQuizItem[]> {
  const lessonId = await lessonIdByNo(lessonNo);
  if (!lessonId) return [];

  const { data, error } = await supabase
    .from('quick_quiz_items')
    .select('id, lesson_id, sort_order, kannada, transliteration, meaning')
    .eq('lesson_id', lessonId)
    .gt('sort_order', 0)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as unknown as Row, lessonNo));
}

/**
 * UPSERT into quick_quiz_progress via SECURITY INVOKER RPC.
 * OR-merges is_correct (personal-best); increments attempts; updates last_played.
 * Note: Quick Quiz is excluded from user_overall_progress (locked formula),
 * so there is no overall-progress recompute on the server side.
 */
export async function recordQuickQuizAttempt(
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('record_quick_quiz_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
