-- 2026-06-24_content_reference_alignment.sql
-- Aligns DB-sourced content to the owner-reviewed content reference
-- (Kannada-Beku-Content.docx, generated 2026-06-23, adopted 2026-06-24).
--
-- Scope = the parts of that reference that live in the DB (not lessonContent.ts,
-- which is TS-canonical and edited directly):
--   1. Beginners Guide (Lesson 0) — ಋ ru→ṛ, ಓ example groan→go, haLLi→haḷḷi.
--   2. Quick Quiz — 5 transliterations to ISO-diacritic forms.
--   3. Dictation  — 5 accepted-spelling sets gain the ISO form (additive: the
--      plain keyboard-typeable forms are KEPT so typed answers still match),
--      plus 2 L1 items that were never seeded (ಹೇಗಿದ್ದೀಯ?, ಚೆನ್ನಾಗಿದ್ದೇವೆ).
--   4. Emergency — "Please help" transliteration maadi→mādi.
--   5. Opposites — backfill the 4 rows (L7 ×2, L5 sort 9, L6 sort 6) that
--      existed only in the live DB so the repo can rebuild the table.
--
-- Deliberately NOT changed (owner decisions; the reference predates them):
--   * namaste stays removed from Quick Quiz + Dictation (2026-06-16). The
--     reference's 46/L1-8 and "122 game items" totals are stale by those rows;
--     Quick Quiz stays 45, Dictation reaches 45 (not 46) after the 2 adds.
--   * Self-intro lines keep the [name] personalization (2026-06-23) instead of
--     the reference's literal example names.
--
-- Note: the older opposites base seed (2026-05-27_db_wiring_games_seed.sql) is
-- still stale in other ways (duplicate reversed pairs, a removed L3 row) that
-- the live DB resolved via the 2026-06-12 dedupe. Section 5 here only adds the
-- 4 never-seeded rows; a full canonical 30-row opposites seed is a larger,
-- separate cleanup if a pristine from-scratch rebuild is ever needed.
--
-- Idempotent. Manual-run: paste into the Supabase SQL editor (no CLI here).

-- ============================================================
-- 1. Beginners Guide — re-emit corrected reference.guide payload
-- ============================================================
-- Same payload as 2026-06-15_basics_guide_content.sql with three corrections:
--   vowelLoners ಋ  ru   -> ṛ
--   vowelPairs  ಓ  groan-> go   (long-vowel example)
--   principles/tryIt   haLLi -> haḷḷi
update public.lessons
set content_json = jsonb_set(
  content_json,
  '{reference,guide}',
  $guide${"principles":[{"title":"Say what you see","body":"Kannada is written the way it sounds. Read the letters left to right and you have said the word."},{"title":"Capitals curl your tongue","body":"A capital letter in our spellings (Ta, Da, La) means curl your tongue up and back — a fuller, hollow sound."},{"title":"Doubled letters linger","body":"A doubled consonant (appa, haḷḷi) is just held a beat longer than a single one."}],"vowelPairs":[{"short":{"kannada":"ಅ","transliteration":"a","example":"up"},"long":{"kannada":"ಆ","transliteration":"ā","example":"art"}},{"short":{"kannada":"ಇ","transliteration":"i","example":"igloo"},"long":{"kannada":"ಈ","transliteration":"ī","example":"seed"}},{"short":{"kannada":"ಉ","transliteration":"u","example":"push"},"long":{"kannada":"ಊ","transliteration":"ū","example":"moon"}},{"short":{"kannada":"ಎ","transliteration":"e","example":"cake"},"long":{"kannada":"ಏ","transliteration":"ē","example":"crane"}},{"short":{"kannada":"ಒ","transliteration":"o","example":"opener"},"long":{"kannada":"ಓ","transliteration":"ō","example":"go"}}],"vowelLoners":[{"kannada":"ಋ","transliteration":"ṛ","example":"rupees"},{"kannada":"ಐ","transliteration":"ai","example":"ice"},{"kannada":"ಔ","transliteration":"au","example":"owl"}],"consonantFamilies":[{"id":"throat","place":"Throat","hint":"Sound starts at the back of the mouth.","glyphs":[{"kannada":"ಕ","transliteration":"ka"},{"kannada":"ಖ","transliteration":"kha"},{"kannada":"ಗ","transliteration":"ga"},{"kannada":"ಘ","transliteration":"gha"}]},{"id":"palate","place":"Palate","hint":"Tongue presses the roof of the mouth.","glyphs":[{"kannada":"ಚ","transliteration":"cha"},{"kannada":"ಜ","transliteration":"ja"}]},{"id":"curled","place":"Curled tongue","hint":"Tongue curls up and back (the capital sounds).","glyphs":[{"kannada":"ಟ","transliteration":"Ta"},{"kannada":"ಡ","transliteration":"Da"},{"kannada":"ಣ","transliteration":"Nna"}]},{"id":"teeth","place":"Teeth","hint":"Tongue tip touches the upper teeth (the lowercase sounds).","glyphs":[{"kannada":"ತ","transliteration":"ta"},{"kannada":"ದ","transliteration":"da"},{"kannada":"ನ","transliteration":"na"}]},{"id":"lips","place":"Lips","hint":"Both lips come together.","glyphs":[{"kannada":"ಪ","transliteration":"pa"},{"kannada":"ಬ","transliteration":"ba"},{"kannada":"ಮ","transliteration":"ma"}]}],"readingRows":[{"symbol":"Ta","isCapital":true,"example":"as in Top"},{"symbol":"ta","isCapital":false,"example":"as in Bharath"},{"symbol":"Da","isCapital":true,"example":"as in Dark"},{"symbol":"da","isCapital":false,"example":"as in the"}],"tryIt":{"transliteration":"haḷḷi","kannada":"ಹಳ್ಳಿ","english":"village"},"chart":[{"kannada":"ಕ","transliteration":"ka","example":"as in cup"},{"kannada":"ಖ","transliteration":"kha","example":"as in khadi"},{"kannada":"ಗ","transliteration":"ga","example":"as in gun"},{"kannada":"ಘ","transliteration":"gha","example":"as in ghat"},{"kannada":"ಙ","transliteration":"gna","example":"as in gnome"},{"kannada":"ಚ","transliteration":"cha","example":"as in chair"},{"kannada":"ಛ","transliteration":"chha","example":"as in church"},{"kannada":"ಜ","transliteration":"ja","example":"as in jug"},{"kannada":"ಝ","transliteration":"jha","example":"as in badge"},{"kannada":"ಞ","transliteration":"nja","example":"rare in English"},{"kannada":"ಟ","transliteration":"Ta","example":"as in Top"},{"kannada":"ಠ","transliteration":"Tta","example":"hard 'Tt' — as in cut"},{"kannada":"ಡ","transliteration":"Da","example":"as in Dark"},{"kannada":"ಢ","transliteration":"Dda","example":"hard 'Dd' — as in board"},{"kannada":"ಣ","transliteration":"Nna","example":"heavy 'Nn' — rare in English"},{"kannada":"ತ","transliteration":"ta","example":"as in Bharath"},{"kannada":"ಥ","transliteration":"tha","example":"soft 'th' — as in Thailand"},{"kannada":"ದ","transliteration":"da","example":"as in the"},{"kannada":"ಧ","transliteration":"dha","example":"as in dhal"},{"kannada":"ನ","transliteration":"na","example":"as in can"},{"kannada":"ಪ","transliteration":"pa","example":"as in papaya"},{"kannada":"ಫ","transliteration":"pha","example":"as in orphan"},{"kannada":"ಬ","transliteration":"ba","example":"as in balloon"},{"kannada":"ಭ","transliteration":"bha","example":"as in Bharath"},{"kannada":"ಮ","transliteration":"ma","example":"as in man"},{"kannada":"ಯ","transliteration":"ya","example":"as in yak"},{"kannada":"ರ","transliteration":"ra","example":"as in rat"},{"kannada":"ಲ","transliteration":"la","example":"as in lamp"},{"kannada":"ವ","transliteration":"va","example":"as in van"},{"kannada":"ಶ","transliteration":"sha","example":"as in ash"},{"kannada":"ಷ","transliteration":"sshha","example":"as in shut"},{"kannada":"ಸ","transliteration":"sa","example":"as in sun"},{"kannada":"ಹ","transliteration":"ha","example":"as in hump"},{"kannada":"ಳ","transliteration":"lla","example":"rare 'L' — palate sound"}]}$guide$::jsonb,
  true
)
where slug = 'basics';

-- ============================================================
-- 2. Quick Quiz — ISO-diacritic transliterations
-- ============================================================
update public.quick_quiz_items qi
set transliteration = m.transliteration
from (values
  (3, 5, 'iḷḷa'),   -- ಇಲ್ಲ  No
  (4, 1, 'iḷḷi'),   -- ಇಲ್ಲಿ Here
  (4, 3, 'aḷḷi'),   -- ಅಲ್ಲಿ There
  (4, 5, 'eḷḷi'),   -- ಎಲ್ಲಿ Where
  (6, 3, 'eḷḷi')    -- ಎಲ್ಲಿ Where
) as m(lesson_no, sort_order, transliteration)
join public.lessons l on l.lesson_no = m.lesson_no
where qi.lesson_id = l.id and qi.sort_order = m.sort_order;

-- ============================================================
-- 3a. Dictation — accepted-spelling sets gain the ISO form (additive)
-- ============================================================
-- Full replacement arrays (idempotent); plain keyboard-typeable forms retained.
update public.dictation_items di
set accepted_json = m.accepted_json::jsonb
from (values
  (3, 4, '["illa","ila","illaa","iḷḷa"]'),  -- ಇಲ್ಲ
  (4, 1, '["illi","ili","ilee","iḷḷi"]'),   -- ಇಲ್ಲಿ
  (4, 2, '["alli","ali","alee","aḷḷi"]'),   -- ಅಲ್ಲಿ
  (4, 5, '["elli","eli","elee","eḷḷi"]'),   -- ಎಲ್ಲಿ
  (6, 3, '["elli","eli","elee","eḷḷi"]')    -- ಎಲ್ಲಿ
) as m(lesson_no, sort_order, accepted_json)
join public.lessons l on l.lesson_no = m.lesson_no
where di.lesson_id = l.id and di.sort_order = m.sort_order;

-- ============================================================
-- 3b. Dictation — add the two missing L1 items (section 1b)
-- ============================================================
-- These reference items were never seeded; the section-split migration already
-- reserved (1,7,'1b') and (1,8,'1b'). Guarded with `where not exists` on
-- (lesson_id, sort_order) so it does not depend on a named unique constraint:
-- a no-op if the rows already exist, an insert otherwise.
insert into public.dictation_items
  (lesson_id, sort_order, expected_answer, accepted_json, phonetic, section)
select l.id, s.sort_order, s.expected_answer, s.accepted_json::jsonb, s.phonetic, s.section
from (values
  (1, 7, 'ಹೇಗಿದ್ದೀಯ?',  '["hēgiddīya?","hegiddiya","hegiddiyaa"]',          'hē-gid-dī-ya?', '1b'),
  (1, 8, 'ಚೆನ್ನಾಗಿದ್ದೇವೆ', '["chennāgiddēve","chinnagiddeve","channagiddeve"]', 'chen-nā-gid-dē-ve', '1b')
) as s(lesson_no, sort_order, expected_answer, accepted_json, phonetic, section)
join public.lessons l on l.lesson_no = s.lesson_no
where not exists (
  select 1 from public.dictation_items di
  where di.lesson_id = l.id and di.sort_order = s.sort_order
);

-- ============================================================
-- 4. Emergency — "Please help" transliteration maadi -> mādi
-- ============================================================
update public.emergency_phrases set transliteration = 'Dayavittu sahaaya mādi'
  where id = 'e1111111-0002-4001-8001-000000000001'::uuid;

-- ============================================================
-- 5. Opposites — backfill the rows that lived only in the live DB
-- ============================================================
-- L7 (×2), L5 sort 9, L6 sort 6 match the reference in production but had no
-- repo seed, so the repo could not rebuild opposites_items from scratch. These
-- INSERTs close that gap.
--
-- opposites_items has NO (lesson_id, sort_order) unique constraint and
-- opposites_progress FKs to opposites_items.id, so we must NOT delete/replace.
-- Guarded with `where not exists` on (lesson_id, sort_order): a no-op against
-- the live DB (rows already present), a full rebuild against an empty table.
-- options_json = [correct opposite first, then 3 distractors]. Glosses follow
-- the reference's "(casual)" labels for the L5/L7 verb rows.
insert into public.opposites_items
  (lesson_id, sort_order, word, opposite, options_json, transliteration, meaning, section)
select l.id, s.sort_order, s.word, s.opposite, s.options_json::jsonb,
       s.transliteration, s.meaning, s.section
from (values
  (5, 9, 'ಏಳು', 'ಮಲಗು',
        '[{"kn":"ಮಲಗು","tr":"malagu","en":"Sleep (casual)"},{"kn":"ನಿಲ್ಲು","tr":"nillu","en":"Stand / stop (casual)"},{"kn":"ಕುಳಿತುಕೋ","tr":"kuḷituko","en":"Sit (casual)"},{"kn":"ನೋಡು","tr":"nōḍu","en":"See / watch (casual)"}]',
        'elu', 'Get up (casual)', '5c'),
  (6, 6, 'ಇಲ್ಲ', 'ಹೌದು',
        '[{"kn":"ಹೌದು","tr":"haudu","en":"Yes"},{"kn":"ಸರಿ","tr":"sari","en":"Okay"},{"kn":"ಗೊತ್ತಿಲ್ಲ","tr":"gottilla","en":"Do not know"},{"kn":"ಈಗ","tr":"īga","en":"Now"}]',
        'iḷḷa', 'No / not', '6b'),
  (7, 1, 'ಶುರು ಮಾಡು', 'ಮುಗಿಸು',
        '[{"kn":"ಮುಗಿಸು","tr":"mugisu","en":"Finish (casual)"},{"kn":"ಓದು","tr":"ōdu","en":"Read / study (casual)"},{"kn":"ಬರೆ","tr":"bareyu","en":"Write (casual)"},{"kn":"ಹಾಕು","tr":"hāku","en":"Put (casual)"}]',
        'shuru maadu', 'Start (casual)', '7c'),
  (7, 2, 'ತೆಗೊ', 'ಹಾಕು',
        '[{"kn":"ಹಾಕು","tr":"hāku","en":"Put (casual)"},{"kn":"ಇಡು","tr":"idu","en":"Keep (casual)"},{"kn":"ಮುಗಿಸು","tr":"mugisu","en":"Finish (casual)"},{"kn":"ಮಾಡು","tr":"māḍu","en":"Do / make (casual)"}]',
        'tego', 'Take (casual)', '7b')
) as s(lesson_no, sort_order, word, opposite, options_json, transliteration, meaning, section)
join public.lessons l on l.lesson_no = s.lesson_no
where not exists (
  select 1 from public.opposites_items oi
  where oi.lesson_id = l.id and oi.sort_order = s.sort_order
);
