-- spec_docs/Sameecha/spec_conversations_runner.md — companion seed.
-- Run AFTER 2026-06-02_conversations.sql. Idempotent: scenarios upsert on
-- (lesson_id, sort_order); turns upsert on (scenario_id, turn_index).
--
-- Vocab drawn from lessons.content_json.reference.words (L1 greetings, L2 names).
-- Same `verified: false` caveat applies — NOT audited by a native speaker.
-- Every correct_option_id below references an id present in that turn's
-- options_json (enforced by review; re-check on any edit).
--
-- Coverage: L1 2 scenarios, L2 2 scenarios (3 turns each). L3–L8 unseeded —
-- the runner shows the existing empty state for those lessons.

-- ============================================================
-- Scenarios
-- ============================================================
insert into public.conversation_scenarios (lesson_id, sort_order, title)
select l.id, s.sort_order, s.title
from (values
  (1, 1, 'Greeting a neighbour'),
  (1, 2, 'Meeting a friend'),
  (2, 1, 'Introducing yourself'),
  (2, 2, 'Asking about people')
) as s(lesson_no, sort_order, title)
join public.lessons l on l.lesson_no = s.lesson_no
on conflict on constraint conversation_scenarios_lesson_sort_unique do update
  set title = excluded.title;

-- ============================================================
-- Turns
-- ============================================================
insert into public.conversation_items
  (scenario_id, turn_index, speaker_line_kn, speaker_line_en, options_json, correct_option_id)
select sc.id, v.turn_index, v.kn, v.en, v.options::jsonb, v.correct
from (values
  -- ===== L1 Scenario 1: Greeting a neighbour =====
  (1, 1, 1, 'ನಮಸ್ಕಾರ!', 'Hello!',
   '[{"id":"a","kn":"ನಮಸ್ಕಾರ","tr":"namaskāra","en":"Hello / greetings"},{"id":"b","kn":"ಮನೆ","tr":"mane","en":"house"},{"id":"c","kn":"ಹೆಸರು","tr":"hesaru","en":"name"}]', 'a'),
  (1, 1, 2, 'ಹೇಗಿದ್ದೀರ?', 'How are you? (respectful)',
   '[{"id":"a","kn":"ಚೆನ್ನಾಗಿದ್ದೇನೆ","tr":"chennāgiddēne","en":"I am fine"},{"id":"b","kn":"ನೀವು","tr":"nīvu","en":"you (respectful)"},{"id":"c","kn":"ನೀನು","tr":"nīnu","en":"you (neutral)"}]', 'a'),
  (1, 1, 3, 'ನೀವು ಚೆನ್ನಾಗಿದ್ದೀರಾ?', 'Are you fine? (respectful)',
   '[{"id":"a","kn":"ಹೌದು, ಚೆನ್ನಾಗಿದ್ದೇನೆ","tr":"haudu, chennāgiddēne","en":"Yes, I am fine"},{"id":"b","kn":"ಹೆಸರು","tr":"hesaru","en":"name"},{"id":"c","kn":"ಮನೆ","tr":"mane","en":"house"}]', 'a'),

  -- ===== L1 Scenario 2: Meeting a friend (neutral) =====
  (1, 2, 1, 'ನಮಸ್ತೆ!', 'Hi!',
   '[{"id":"a","kn":"ನಮಸ್ತೆ","tr":"namaste","en":"Hi / hello"},{"id":"b","kn":"ಬೇಡ","tr":"bēḍa","en":"do not want"},{"id":"c","kn":"ಅವರು","tr":"avaru","en":"that person"}]', 'a'),
  (1, 2, 2, 'ಹೇಗಿದ್ದೀಯ?', 'How are you? (neutral)',
   '[{"id":"a","kn":"ಚೆನ್ನಾಗಿದ್ದೇನೆ","tr":"chennāgiddēne","en":"I am fine"},{"id":"b","kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"},{"id":"c","kn":"ಎಲ್ಲಿ","tr":"elli","en":"where"}]', 'a'),
  (1, 2, 3, 'ಸರಿ, ನಮಸ್ಕಾರ.', 'Okay, goodbye.',
   '[{"id":"a","kn":"ನಮಸ್ಕಾರ","tr":"namaskāra","en":"Goodbye"},{"id":"b","kn":"ಹೆಸರು","tr":"hesaru","en":"name"},{"id":"c","kn":"ಮನೆ","tr":"mane","en":"house"}]', 'a'),

  -- ===== L2 Scenario 1: Introducing yourself =====
  (2, 1, 1, 'ನಿಮ್ಮ ಹೆಸರು ಏನು?', 'What is your name? (respectful)',
   '[{"id":"a","kn":"ನಾನು ಪ್ರಿಯಾ","tr":"nānu priyā","en":"I am Priya"},{"id":"b","kn":"ಮನೆ","tr":"mane","en":"house"},{"id":"c","kn":"ಅವರು","tr":"avaru","en":"that person"}]', 'a'),
  (2, 1, 2, 'ನಿಮ್ಮ ಮನೆ ಎಲ್ಲಿ?', 'Where is your house?',
   '[{"id":"a","kn":"ಇಲ್ಲಿ","tr":"illi","en":"Here"},{"id":"b","kn":"ಹೆಸರು","tr":"hesaru","en":"name"},{"id":"c","kn":"ನೀವು","tr":"nīvu","en":"you (respectful)"}]', 'a'),
  (2, 1, 3, 'ಸರಿ, ನಮಸ್ಕಾರ.', 'Okay, goodbye.',
   '[{"id":"a","kn":"ನಮಸ್ಕಾರ","tr":"namaskāra","en":"Goodbye"},{"id":"b","kn":"ನಾನು","tr":"nānu","en":"I"},{"id":"c","kn":"ಮನೆ","tr":"mane","en":"house"}]', 'a'),

  -- ===== L2 Scenario 2: Asking about people (neutral) =====
  (2, 2, 1, 'ನಿನ್ನ ಹೆಸರು ಏನು?', 'What is your name? (neutral)',
   '[{"id":"a","kn":"ನಾನು ರವಿ","tr":"nānu ravi","en":"I am Ravi"},{"id":"b","kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"},{"id":"c","kn":"ಮನೆ","tr":"mane","en":"house"}]', 'a'),
  (2, 2, 2, 'ಇವಳು ಯಾರು?', 'Who is she?',
   '[{"id":"a","kn":"ಇವಳು ಪ್ರಿಯಾ","tr":"ivaḷu priyā","en":"She is Priya"},{"id":"b","kn":"ಅವನು","tr":"avanu","en":"that person (he)"},{"id":"c","kn":"ಮನೆ","tr":"mane","en":"house"}]', 'a'),
  (2, 2, 3, 'ಸರಿ!', 'Okay!',
   '[{"id":"a","kn":"ನಮಸ್ಕಾರ","tr":"namaskāra","en":"Goodbye"},{"id":"b","kn":"ಹೆಸರು","tr":"hesaru","en":"name"},{"id":"c","kn":"ನೀನು","tr":"nīnu","en":"you (neutral)"}]', 'a')
) as v(lesson_no, scenario_sort, turn_index, kn, en, options, correct)
join public.lessons l on l.lesson_no = v.lesson_no
join public.conversation_scenarios sc
  on sc.lesson_id = l.id and sc.sort_order = v.scenario_sort
on conflict on constraint conversation_items_scenario_turn_unique do update
  set speaker_line_kn   = excluded.speaker_line_kn,
      speaker_line_en   = excluded.speaker_line_en,
      options_json      = excluded.options_json,
      correct_option_id = excluded.correct_option_id;
