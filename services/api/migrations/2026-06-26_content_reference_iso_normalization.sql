-- 2026-06-26_content_reference_iso_normalization.sql
-- Full ISO-diacritic normalization of DB-sourced game/emergency content, to
-- match the owner-reviewed content reference (Kannada-Beku-Content.docx,
-- marked-up "original" copy, 2026-06-26) and the parallel TS pass in
-- constants/lessons/lessonContent.ts.
--
-- Owner decisions baked in (AskUserQuestion, 2026-06-26):
--   * Full ISO normalization (not "match the doc's inconsistent forms").
--   * namaste stays REMOVED from every game (prior 2026-06-16 decision wins
--     over the doc re-introducing it). See section 0 — the live DB still has
--     the namaste rows, so the 2026-06-16 deletes are re-asserted here.
--   * New L3–L8 conversation scenarios are deferred — not in this migration.
--
-- The change set below was derived by diffing the LIVE DB (via the service-role
-- read) against the canonical ISO forms — the live tables had drifted from the
-- repo seeds (e.g. opposites options carried plain haaku/maadu/nodu/odu/iiga).
--
-- KEY CORRECTION — this REVERSES part of 2026-06-24_content_reference_alignment.
-- That migration romanized ಇಲ್ಲಿ/ಅಲ್ಲಿ/ಎಲ್ಲಿ/ಇಲ್ಲ as iḷḷi/aḷḷi/eḷḷi/iḷḷa,
-- treating the ಲ್ಲ cluster as retroflex ḷ. It is NOT: those words use plain ಲ
-- (la). The reference itself proves the contrast — ಹಳ್ಳಿ haḷḷi (village, ಳ್ಳ)
-- vs ಹಲ್ಲಿ halli (lizard, ಲ್ಲ) — and every game table in the doc spells these
-- illi/alli/elli/illa. Only ಳ is ḷ. So we revert those forms to plain here.
--
-- Idempotent. Manual-run: paste into the Supabase SQL editor (no CLI here).

-- ============================================================
-- 0. namaste cleanup — re-assert the 2026-06-16 removal (live still has it)
-- ============================================================
delete from public.quick_quiz_items
where lesson_id = (select id from public.lessons where lesson_no = 1)
  and transliteration = 'namaste';

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
-- 1. Quick Quiz — revert the wrong retroflex forms + fix thinnu
-- ============================================================
-- (3,5) ಇಲ್ಲ, (4,1) ಇಲ್ಲಿ, (4,3) ಅಲ್ಲಿ, (4,5) ಎಲ್ಲಿ, (6,3) ಎಲ್ಲಿ → plain.
-- (5,4) ತಿನ್ನು thinnu → tinnu (ತ = t in ISO; ಠ/ಥ carry the aspirate).
update public.quick_quiz_items qi
set transliteration = m.transliteration
from (values
  (3, 5, 'illa'),
  (4, 1, 'illi'),
  (4, 3, 'alli'),
  (4, 5, 'elli'),
  (6, 3, 'elli'),
  (5, 4, 'tinnu')
) as m(lesson_no, sort_order, transliteration)
join public.lessons l on l.lesson_no = m.lesson_no
where qi.lesson_id = l.id and qi.sort_order = m.sort_order;

-- ============================================================
-- 2. Dictation — drop the wrong retroflex spellings, fix phonetic
-- ============================================================
-- 2a. The 2026-06-24 migration appended iḷḷa/iḷḷi/aḷḷi/eḷḷi to these accepted
-- arrays. The plain forms were already present (and are the correct ISO), so
-- reset to plain-only. Typed answers still match (nobody types the retroflex).
update public.dictation_items di
set accepted_json = m.accepted_json::jsonb
from (values
  (3, 4, '["illa","ila","illaa"]'),  -- ಇಲ್ಲ
  (4, 1, '["illi","ili","ilee"]'),   -- ಇಲ್ಲಿ
  (4, 2, '["alli","ali","alee"]'),   -- ಅಲ್ಲಿ
  (4, 5, '["elli","eli","elee"]'),   -- ಎಲ್ಲಿ
  (6, 3, '["elli","eli","elee"]')    -- ಎಲ್ಲಿ
) as m(lesson_no, sort_order, accepted_json)
join public.lessons l on l.lesson_no = m.lesson_no
where di.lesson_id = l.id and di.sort_order = m.sort_order;

-- 2b. (5,4) ತಿನ್ನು phonetic thin-nu → tin-nu (ತ = t). accepted_json keeps the
-- permissive "thinnu" alt so older typed answers still match.
update public.dictation_items di
set phonetic = 'tin-nu'
from public.lessons l
where di.lesson_id = l.id and l.lesson_no = 5 and di.sort_order = 4;

-- ============================================================
-- 3. Opposites — long-vowel macrons + gloss fixes
-- ============================================================
-- 3a. Main transliteration column (exact-value updates).
--   ಕುಳಿತುಕೋ kuḷituko → kuḷitukō  (final ೋ is long)
--   ಶುರು ಮಾಡು shuru maadu → shuru māḍu
--   ಏಳು elu → ēḷu  (ಏ = ē, ಳ = ḷ)
update public.opposites_items set transliteration = 'kuḷitukō' where transliteration = 'kuḷituko';
update public.opposites_items set transliteration = 'shuru māḍu' where transliteration = 'shuru maadu';
update public.opposites_items set transliteration = 'ēḷu' where transliteration = 'elu';

-- 3b. Distractor glosses inside options_json. Each token below maps to exactly
-- one word, so replacing the quoted VALUE is unambiguous AND independent of
-- jsonb's "key": "value" spacing. Idempotent (re-runs find nothing to change).
--   thinnu→tinnu  tegeduko→tego  kulituko/kuḷituko→kuḷitukō
--   nodu→nōḍu  odu→ōdu  maadu→māḍu  haaku→hāku  iiga→īga
update public.opposites_items set options_json =
  replace(replace(replace(replace(replace(replace(replace(replace(replace(
    options_json::text,
    '"thinnu"',   '"tinnu"'),
    '"tegeduko"', '"tego"'),
    '"kulituko"', '"kuḷitukō"'),
    '"kuḷituko"', '"kuḷitukō"'),
    '"nodu"',     '"nōḍu"'),
    '"odu"',      '"ōdu"'),
    '"maadu"',    '"māḍu"'),
    '"haaku"',    '"hāku"'),
    '"iiga"',     '"īga"')::jsonb
where options_json::text ~ '"(thinnu|tegeduko|kulituko|kuḷituko|nodu|odu|maadu|haaku|iiga)"';

-- 3c. L7 sort 2 (ತೆಗೊ ↔ ಹಾಕು): the ಇಡು "Keep" distractor is retroflex ಡ → iḍu.
-- A blanket "idu"→"iḍu" would wrongly hit ಇದು "this" elsewhere, so scope to
-- this one row (its only "idu" is the ಇಡು Keep gloss).
update public.opposites_items oi
set options_json = replace(oi.options_json::text, '"idu"', '"iḍu"')::jsonb
from public.lessons l
where oi.lesson_id = l.id and l.lesson_no = 7 and oi.sort_order = 2
  and oi.options_json::text like '%"idu"%';

-- ============================================================
-- 4. Emergency — keep all-plain (revert the lone diacritic)
-- ============================================================
-- The reference's Emergency section is deliberately all-plain ("needs to be
-- obvious in any situation"): Eshtu, haaki, nidhanavagi, maadi. The 2026-06-24
-- migration alone diacritized "Please help" to mādi; revert it so the screen is
-- internally consistent with the rest of the emergency phrases.
update public.emergency_phrases set transliteration = 'Dayavittu sahaaya maadi'
  where id = 'e1111111-0002-4001-8001-000000000001'::uuid;
