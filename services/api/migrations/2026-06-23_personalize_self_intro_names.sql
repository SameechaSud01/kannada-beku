-- Personalize self-introduction replies with the learner's name.
--
-- Lessons taught example self-intros under fixed names (Priya, Rahul, Ravi).
-- Per owner decision (2026-06-23) the learner's onboarding name is substituted
-- wherever they introduce *themselves*. Content carries a `[name]` placeholder
-- that the app resolves at render to the learner's first name
-- (utils/personalize.ts, wired through the lesson + conversation hooks).
--
-- Scope — ONLY first-person self-introductions in response to "what is your
-- name?". Third-person lines (e.g. L2 S2 "ಇವಳು ಪ್ರಿಯಾ" / "She is Priya") keep
-- their example name and are intentionally NOT touched.
--
-- Depth — only the English gloss + transliteration take `[name]`. The Kannada
-- line keeps its authored name so its pre-recorded audio still resolves
-- (normalizeForAudio / getBundledAudio) and the script stays an authentic
-- example. The matching TS lesson phrases (L2 "I am [name]", L8 "My name is
-- [name]") are edited in constants/lessons/lessonContent.ts in the same change;
-- this file only touches the DB-seeded conversation table.
--
-- MANUAL: run in the Supabase SQL editor (no CLI). Idempotent — safe to re-run.

-- ============================================================
-- L2 Scenario 1 (Introducing yourself), turn 1 — "What is your name?
-- (respectful)". Correct reply was "I am Priya"; tokenize en + tr, keep kn.
-- ============================================================
update public.conversation_items ci
set options_json = '[{"id":"a","kn":"ನಾನು ಪ್ರಿಯಾ","tr":"nānu [name]","en":"I am [name]"},{"id":"b","kn":"ಮನೆ","tr":"mane","en":"house"},{"id":"c","kn":"ಅವರು","tr":"avaru","en":"that person"}]'::jsonb
from public.conversation_scenarios sc
join public.lessons l on l.id = sc.lesson_id
where ci.scenario_id = sc.id
  and l.lesson_no = 2
  and sc.sort_order = 1
  and ci.turn_index = 1;

-- ============================================================
-- L2 Scenario 2 (Asking about people, neutral), turn 1 — "What is your name?
-- (neutral)". Correct reply was "I am Ravi"; tokenize en + tr, keep kn.
-- Turn 2 of this scenario ("She is Priya") is third-person and left as-is.
-- ============================================================
update public.conversation_items ci
set options_json = '[{"id":"a","kn":"ನಾನು ರವಿ","tr":"nānu [name]","en":"I am [name]"},{"id":"b","kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"},{"id":"c","kn":"ಮನೆ","tr":"mane","en":"house"}]'::jsonb
from public.conversation_scenarios sc
join public.lessons l on l.id = sc.lesson_id
where ci.scenario_id = sc.id
  and l.lesson_no = 2
  and sc.sort_order = 2
  and ci.turn_index = 1;
