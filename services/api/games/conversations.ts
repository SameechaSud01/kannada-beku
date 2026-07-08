import { supabase } from '../supabase';
import { CONVERSATION_SCENARIOS_BY_LESSON } from '../../../constants/games/conversationScenarios';

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

/**
 * Bundled-first (spec_scalability_offline_fixes Phase 3): scenarios ship in
 * the binary with their turns pre-grouped and real DB row UUIDs (progress
 * rows + record RPCs key on turn item ids). `[name]` placeholders stay
 * verbatim — personalization happens in the useConversationScenarios select,
 * as before. conversation_scenarios/_items remain the regeneration source —
 * `npm run gen:content` after any dashboard content change.
 */
export async function fetchConversationScenariosByLessonNo(
  lessonNo: number,
): Promise<ConversationScenario[]> {
  return CONVERSATION_SCENARIOS_BY_LESSON[lessonNo] ?? [];
}

/**
 * UPSERT into conversation_progress via SECURITY INVOKER RPC. Recorded against
 * the turn's item id. Conversations is excluded from user_overall_progress
 * (locked formula), so there is no overall-progress recompute server-side.
 */
export async function recordConversationAttempt(itemId: string, isCorrect: boolean): Promise<void> {
  const { error } = await supabase.rpc('record_conversation_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
