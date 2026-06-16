-- Standardize the "hello" greeting on namaskāra (ನಮಸ್ಕಾರ) across the games.
--
-- namaskāra and namaste were seeded as two separate vocab words, so learners
-- saw them as different items in lessons, the quick quiz, dictation, and
-- conversations. Per owner decision (2026-06-16) we keep a single greeting,
-- namaskāra, and drop the duplicate namaste entries.
--
-- The matching lesson-display content lives in TS (constants/lessons/
-- lessonContent.ts) and is edited there in the same change. This file only
-- touches the DB-seeded game tables.
--
-- MANUAL: run in the Supabase SQL editor (no CLI). Idempotent — safe to re-run.

-- ============================================================
-- 1. Quick quiz — drop the namaste item (namaskāra already covers "hello").
--    quick_quiz_progress.item_id cascades on delete.
-- ============================================================
delete from public.quick_quiz_items
where lesson_id = (select id from public.lessons where lesson_no = 1)
  and transliteration = 'namaste';

-- ============================================================
-- 2. Dictation — drop the namaste item. Clear its progress first in case the
--    FK is not ON DELETE CASCADE, then remove the item.
-- ============================================================
delete from public.dictation_progress
where item_id in (
  select id from public.dictation_items
  where lesson_id = (select id from public.lessons where lesson_no = 1)
    and expected_answer = 'ನಮಸ್ತೆ'
);

delete from public.dictation_items
where lesson_id = (select id from public.lessons where lesson_no = 1)
  and expected_answer = 'ನಮಸ್ತೆ';

-- ============================================================
-- 3. Conversations — L1 scenario 2 opens with namaste; switch it (line +
--    option) to namaskāra. correct_option_id stays 'a'.
-- ============================================================
update public.conversation_items ci
set speaker_line_kn = 'ನಮಸ್ಕಾರ!',
    options_json = '[{"id":"a","kn":"ನಮಸ್ಕಾರ","tr":"namaskāra","en":"Hi / hello"},{"id":"b","kn":"ಬೇಡ","tr":"bēḍa","en":"do not want"},{"id":"c","kn":"ಅವರು","tr":"avaru","en":"that person"}]'::jsonb
from public.conversation_scenarios sc
join public.lessons l on l.id = sc.lesson_id
where ci.scenario_id = sc.id
  and l.lesson_no = 1
  and sc.sort_order = 2
  and ci.turn_index = 1;
