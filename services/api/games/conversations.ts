import { supabase } from '../supabase';

export type ConversationOption = {
  id: string;
  kn: string;
  tr: string;
  en: string;
};

export type ConversationTurn = {
  id: string;
  scenarioId: string;
  turnIndex: number;
  speakerLineKn: string;
  speakerLineEn: string;
  options: ConversationOption[];
  correctOptionId: string;
};

export type ConversationScenario = {
  id: string;
  sortOrder: number;
  title: string;
  section: string | null;
  turns: ConversationTurn[];
};

type ScenarioRow = {
  id: string;
  sort_order: number;
  title: string;
  section: string | null;
};

type ItemRow = {
  id: string;
  scenario_id: string;
  turn_index: number;
  speaker_line_kn: string;
  speaker_line_en: string;
  options_json: ConversationOption[] | null;
  correct_option_id: string;
};

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

/**
 * Fetch a lesson's conversation scenarios with their turns grouped and ordered.
 * Two reads (scenarios, then their turns) joined in JS — keeps the per-turn
 * row model while presenting whole dialogues to the runner.
 */
export async function fetchConversationScenariosByLessonNo(
  lessonNo: number,
): Promise<ConversationScenario[]> {
  const lessonId = await lessonIdByNo(lessonNo);
  if (!lessonId) return [];

  const { data: scenarioData, error: scenarioErr } = await supabase
    .from('conversation_scenarios')
    .select('id, sort_order, title, section')
    .eq('lesson_id', lessonId)
    .order('sort_order', { ascending: true });

  if (scenarioErr) throw scenarioErr;
  const scenarios = (scenarioData ?? []) as ScenarioRow[];
  if (scenarios.length === 0) return [];

  const scenarioIds = scenarios.map((s) => s.id);
  const { data: itemData, error: itemErr } = await supabase
    .from('conversation_items')
    .select('id, scenario_id, turn_index, speaker_line_kn, speaker_line_en, options_json, correct_option_id')
    .in('scenario_id', scenarioIds)
    .order('turn_index', { ascending: true });

  if (itemErr) throw itemErr;
  const items = (itemData ?? []) as ItemRow[];

  const turnsByScenario = new Map<string, ConversationTurn[]>();
  for (const row of items) {
    const turn: ConversationTurn = {
      id: row.id,
      scenarioId: row.scenario_id,
      turnIndex: row.turn_index,
      speakerLineKn: row.speaker_line_kn,
      speakerLineEn: row.speaker_line_en,
      options: row.options_json ?? [],
      correctOptionId: row.correct_option_id,
    };
    const list = turnsByScenario.get(row.scenario_id);
    if (list) list.push(turn);
    else turnsByScenario.set(row.scenario_id, [turn]);
  }

  return scenarios
    .map((s) => ({
      id: s.id,
      sortOrder: s.sort_order,
      title: s.title,
      section: s.section,
      turns: turnsByScenario.get(s.id) ?? [],
    }))
    .filter((s) => s.turns.length > 0);
}

/**
 * UPSERT into conversation_progress via SECURITY INVOKER RPC. Recorded against
 * the turn's item id. Conversations is excluded from user_overall_progress
 * (locked formula), so there is no overall-progress recompute server-side.
 */
export async function recordConversationAttempt(
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('record_conversation_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
