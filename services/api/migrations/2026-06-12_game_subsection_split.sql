-- spec_docs/Sameecha/spec_game_subsection_split.md — section linking key.
--
-- Adds `section` to every (remaining) game table and backfills it against the
-- LIVE DB rows (verified by direct query 2026-06-12, not the repo seed files —
-- the two had drifted). section = the lesson section key (1a / 1b / 1c …) the
-- item belongs to; a single-section lesson (Lesson 4) uses key '4'.
--
-- Image Match is out of scope (being removed) and not touched.
-- section lives on conversation_SCENARIOS, not conversation_items (per-turn).
--
-- Safe + additive: ADD COLUMN IF NOT EXISTS + value-keyed UPDATEs. Duplicate
-- opposites rows are tagged with their canonical pair's section; the optional
-- dedupe is a SEPARATE migration (2026-06-12_opposites_dedupe.sql).
--
-- Rows marked `-- REVIEW` use vocab NOT in the lesson (opposite-pairs drawn from
-- outside the lesson); section is a best-effort placement pending curation.
-- Rows marked `-- DUP` duplicate an earlier pair in the same lesson.

-- ============================================================
-- 1. Columns
-- ============================================================
alter table public.opposites_items        add column if not exists section text;
alter table public.dictation_items          add column if not exists section text;
alter table public.quick_quiz_items          add column if not exists section text;
alter table public.conversation_scenarios    add column if not exists section text;

create index if not exists opposites_items_lesson_section_idx    on public.opposites_items (lesson_id, section);
create index if not exists dictation_items_lesson_section_idx     on public.dictation_items (lesson_id, section);
create index if not exists quick_quiz_items_lesson_section_idx    on public.quick_quiz_items (lesson_id, section);
create index if not exists conversation_scenarios_lesson_section_idx on public.conversation_scenarios (lesson_id, section);

-- ============================================================
-- 2a. Dictation (L1–L6) — items are lesson words
-- ============================================================
update public.dictation_items di
set section = m.section
from (values
  (1,1,'1a'),(1,2,'1a'),(1,3,'1b'),(1,4,'1b'),(1,5,'1a'),(1,6,'1a'),(1,7,'1b'),(1,8,'1b'),
  (2,1,'2a'),(2,2,'2a'),(2,3,'2c'),(2,4,'2c'),(2,5,'2b'),(2,6,'2b'),(2,7,'2a'),(2,8,'2a'),
  (3,1,'3a'),(3,2,'3a'),(3,3,'3a'),(3,4,'3a'),(3,5,'3b'),(3,6,'3b'),(3,7,'3c'),(3,8,'3c'),
  (4,1,'4'),(4,2,'4'),(4,3,'4'),(4,4,'4'),(4,5,'4'),(4,6,'4'),
  (5,1,'5a'),(5,2,'5a'),(5,3,'5a'),(5,4,'5a'),(5,5,'5a'),(5,6,'5a'),(5,7,'5b'),(5,8,'5b'),
  (6,1,'6a'),(6,2,'6a'),(6,3,'6a'),(6,4,'6a'),(6,5,'6a'),(6,6,'6a'),(6,7,'6a'),(6,8,'6c')
) as m(lesson_no, sort_order, section)
join public.lessons l on l.lesson_no = m.lesson_no
where di.lesson_id = l.id and di.sort_order = m.sort_order;

-- ============================================================
-- 2b. Quick Quiz (L1–L6) — items are lesson words
-- ============================================================
update public.quick_quiz_items qi
set section = m.section
from (values
  (1,1,'1a'),(1,2,'1a'),(1,3,'1b'),(1,4,'1b'),(1,5,'1b'),(1,6,'1b'),(1,7,'1a'),(1,8,'1a'),
  (2,1,'2a'),(2,2,'2a'),(2,3,'2a'),(2,4,'2a'),(2,5,'2a'),(2,6,'2b'),(2,7,'2c'),(2,8,'2c'),
  (3,1,'3a'),(3,2,'3a'),(3,3,'3a'),(3,4,'3a'),(3,5,'3a'),(3,6,'3b'),(3,7,'3b'),(3,8,'3c'),
  (4,1,'4'),(4,2,'4'),(4,3,'4'),(4,4,'4'),(4,5,'4'),(4,6,'4'),
  (5,1,'5a'),(5,2,'5a'),(5,3,'5a'),(5,4,'5a'),(5,5,'5a'),(5,6,'5a'),(5,7,'5b'),(5,8,'5b'),
  (6,1,'6a'),(6,2,'6a'),(6,3,'6a'),(6,4,'6a'),(6,5,'6a'),(6,6,'6a'),(6,7,'6a'),(6,8,'6b')
) as m(lesson_no, sort_order, section)
join public.lessons l on l.lesson_no = m.lesson_no
where qi.lesson_id = l.id and qi.sort_order = m.sort_order;

-- ============================================================
-- 2c. Opposites (L1–L7) — opposite-pairs, partly outside lesson vocab
-- ============================================================
update public.opposites_items oi
set section = m.section
from (values
  -- L1
  (1,1,'1a'),                       -- nīvu / nīnu
  (1,2,'1b'),                       -- chennāgi / keṭṭadāgi (≈ "I'm fine")
  (1,3,'1b'),  -- REVIEW            -- haudu / illa (yes/no) not in L1
  -- L2
  (2,1,'2b'),(2,2,'2b'),(2,3,'2b'),(2,4,'2a'),(2,5,'2a'),
  (2,6,'2b'),  -- DUP of 2
  (2,7,'2b'),  -- DUP of 3
  (2,8,'2b'),  -- DUP of 1
  -- L3 (no sort 2)
  (3,1,'3a'),(3,3,'3b'),(3,4,'3c'),
  (3,5,'3b'),  -- REVIEW           -- hosa / haḷeya (new/old) not in L3
  (3,6,'3a'),  -- DUP of 1
  (3,7,'3b'),  -- DUP of 3
  (3,8,'3c'),  -- DUP of 4
  -- L4 (single section)
  (4,1,'4'),(4,2,'4'),(4,3,'4'),(4,4,'4'),(4,5,'4'),
  (4,6,'4'),   -- DUP of 1
  (4,7,'4'),   -- DUP of 2
  -- L5
  (5,1,'5a'),(5,2,'5b'),(5,3,'5c'),(5,4,'5c'),
  (5,5,'5c'),  -- REVIEW           -- bēga / nidhāna (fast/slow) not in L5
  (5,6,'5a'),  -- DUP of 1
  (5,7,'5b'),  -- DUP of 2
  (5,8,'5c'),  -- DUP of 4
  (5,9,'5c'),  -- ≈ DUP of 3 (eḷu/malagu vs malagu/eddu)
  -- L6 (no sort 2)
  (6,1,'6c'),                       -- gottu / gottilla
  (6,3,'6c'),  -- REVIEW           -- santoṣa / duḥkha not in L6
  (6,4,'6c'),  -- REVIEW           -- oḷḷeya / keṭṭa not in L6
  (6,5,'6c'),  -- REVIEW           -- tampu / bisi not in L6
  (6,6,'6b'),                       -- illa / haudu
  -- L7
  (7,1,'7c'),                       -- shuru maadu / mugisu
  (7,2,'7b')                        -- tego / haaku
) as m(lesson_no, sort_order, section)
join public.lessons l on l.lesson_no = m.lesson_no
where oi.lesson_id = l.id and oi.sort_order = m.sort_order;

-- ============================================================
-- 2d. Conversations (L1–L2) — section on the scenario
-- ============================================================
update public.conversation_scenarios sc
set section = m.section
from (values
  (1,1,'1c'),                       -- Greeting a neighbour
  (1,2,'1c'),                       -- Meeting a friend
  (2,1,'2c'),                       -- Introducing yourself
  (2,2,'2c')                        -- Asking about people
) as m(lesson_no, sort_order, section)
join public.lessons l on l.lesson_no = m.lesson_no
where sc.lesson_id = l.id and sc.sort_order = m.sort_order;

-- ============================================================
-- 3. Verification — all four should return 0 rows
-- ============================================================
-- select 'opp' g, lesson_id, sort_order from public.opposites_items where section is null
-- union all select 'dict', lesson_id, sort_order from public.dictation_items where section is null
-- union all select 'quiz', lesson_id, sort_order from public.quick_quiz_items where section is null
-- union all select 'conv', lesson_id, sort_order from public.conversation_scenarios where section is null;
