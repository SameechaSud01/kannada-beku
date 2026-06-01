-- spec_docs/Sameecha/spec_beginners_guide.md
-- Seeds the Lesson 0 "basics" reference row in public.lessons.
-- Idempotent: insert ... on conflict do nothing; update ... where slug = 'basics'.
-- Safe to re-run.
--
-- The TS file constants/guide.ts is canonical for the rendered guide screen.
-- This row is the raw reference snapshot from the PDF; the two are not synced.
--
-- recompute_overall_progress audit (per spec):
--   The trigger function counts user_lesson_progress rows where completed_at
--   is not null. It does NOT count public.lessons rows. Because Lesson 0 never
--   gets a user_lesson_progress row (the guide screen does not call
--   record_lesson_completion), the formula is naturally invariant to lesson 0.
--   No predicate change is needed in 2026-05-27_db_wiring_games_and_overall.sql.

-- 1a. Relax the lesson_no check constraint to allow 0.
--     The pre-existing constraint enforced lesson_no > 0 (curriculum slots are
--     1..8). The Beginners' Guide reserves lesson_no = 0 as a reference row
--     outside the curriculum — see spec §Exclusion from progress / completion.
--     Idempotent: drop-if-exists then add the relaxed bound.
alter table public.lessons
  drop constraint if exists lessons_lesson_no_check;
alter table public.lessons
  add constraint lessons_lesson_no_check check (lesson_no >= 0);

-- 1b. Ensure the Lesson 0 row exists. lesson_no = 0 keeps it outside the
--     1..8 curriculum range and the PLANNED_LESSON_SLOTS render path.
--
-- public.lessons.slug is a PARTIAL unique index (where slug is not null), so
-- ON CONFLICT must include the same predicate to match. A plain `on conflict
-- (slug)` fails with 42P10 — verified.
insert into public.lessons
  (lesson_no, title, slug, situation, real_world_prompt, content_json, audio_url)
select 0, 'Kannada basics', 'basics', null, null, '{}'::jsonb, null
where not exists (
  select 1 from public.lessons where slug = 'basics'
);

-- 2. Overwrite content_json idempotently with the full reference payload.
update public.lessons
set content_json = $json$
{
  "reference": {
    "source": "kannada-beginners-guide.pdf",
    "verified": false,
    "words": [],
    "phrases": [],
    "sections": [
      {
        "slug": "vowels", "order": 1,
        "title": "Vowels (ಸ್ವರಗಳು)",
        "subtitle": "Kannada has 13 vowels. Long vowels use a macron — ā, ē, ī, ō, ū.",
        "items": [
          {"kind":"glyph","kannada":"ಅ","transliteration":"a","example":"as in America"},
          {"kind":"glyph","kannada":"ಆ","transliteration":"ā","example":"as in art"},
          {"kind":"glyph","kannada":"ಇ","transliteration":"i","example":"as in igloo"},
          {"kind":"glyph","kannada":"ಈ","transliteration":"ī","example":"as in seed"},
          {"kind":"glyph","kannada":"ಉ","transliteration":"u","example":"as in push"},
          {"kind":"glyph","kannada":"ಊ","transliteration":"ū","example":"as in moon"},
          {"kind":"glyph","kannada":"ಋ","transliteration":"ṛ","example":"as in rupees"},
          {"kind":"glyph","kannada":"ಎ","transliteration":"e","example":"as in cake"},
          {"kind":"glyph","kannada":"ಏ","transliteration":"ē","example":"as in crane"},
          {"kind":"glyph","kannada":"ಐ","transliteration":"ai","example":"as in ice"},
          {"kind":"glyph","kannada":"ಒ","transliteration":"o","example":"as in opener"},
          {"kind":"glyph","kannada":"ಓ","transliteration":"ō","example":"as in go"},
          {"kind":"glyph","kannada":"ಔ","transliteration":"au","example":"as in owl"}
        ]
      },
      {
        "slug": "consonant-rules", "order": 2,
        "title": "Sounding consonants",
        "subtitle": "Three patterns to watch for: retroflex, dental, and doubled letters.",
        "items": [
          {
            "kind":"rule","ruleKind":"retroflex",
            "title":"Retroflex (capital letters)",
            "description":"Tongue curls up and back, touching the ridge behind the teeth. Hollow, fuller sound.",
            "examples":[
              {"transliteration":"Ta","english":"as in Top"},
              {"transliteration":"Da","english":"as in Dark"},
              {"transliteration":"Na","english":"as in Pranam"},
              {"transliteration":"La","english":"as in haLLi"}
            ]
          },
          {
            "kind":"rule","ruleKind":"dental",
            "title":"Dental (lowercase letters)",
            "description":"Tongue tip touches the back of the upper front teeth. Flat, soft, far forward.",
            "examples":[
              {"transliteration":"ta","english":"as in Bharath"},
              {"transliteration":"da","english":"as in the"},
              {"transliteration":"na","english":"as in narrator"},
              {"transliteration":"la","english":"as in large"}
            ]
          },
          {
            "kind":"rule","ruleKind":"geminated",
            "title":"Doubled letters",
            "description":"The consonant is held slightly longer than a single one.",
            "examples":[
              {"transliteration":"appa","english":"father"},
              {"transliteration":"amma","english":"mother"}
            ]
          }
        ]
      },
      {
        "slug": "consonants", "order": 3,
        "title": "Consonant chart (ವ್ಯಂಜನಗಳು)",
        "subtitle": "The 34 consonants grouped by where they're produced in the mouth.",
        "items": [
          {"kind":"glyph","kannada":"ಕ","transliteration":"ka","example":"as in cup"},
          {"kind":"glyph","kannada":"ಖ","transliteration":"kha","example":"as in khadi"},
          {"kind":"glyph","kannada":"ಗ","transliteration":"ga","example":"as in gun"},
          {"kind":"glyph","kannada":"ಘ","transliteration":"gha","example":"as in ghat"},
          {"kind":"glyph","kannada":"ಙ","transliteration":"gna","example":"as in gnome"},
          {"kind":"glyph","kannada":"ಚ","transliteration":"cha","example":"as in chair"},
          {"kind":"glyph","kannada":"ಛ","transliteration":"chha","example":"as in church"},
          {"kind":"glyph","kannada":"ಜ","transliteration":"ja","example":"as in jug"},
          {"kind":"glyph","kannada":"ಝ","transliteration":"jha","example":"as in badge"},
          {"kind":"glyph","kannada":"ಞ","transliteration":"nja","example":"rare in English"},
          {"kind":"glyph","kannada":"ಟ","transliteration":"Ta","example":"as in top"},
          {"kind":"glyph","kannada":"ಠ","transliteration":"Tha","example":"as in cut"},
          {"kind":"glyph","kannada":"ಡ","transliteration":"Da","example":"as in dark"},
          {"kind":"glyph","kannada":"ಢ","transliteration":"Ddha","example":"as in board"},
          {"kind":"glyph","kannada":"ಣ","transliteration":"Nha","example":"rare in English"},
          {"kind":"glyph","kannada":"ತ","transliteration":"ta","example":"as in Bharath"},
          {"kind":"glyph","kannada":"ಥ","transliteration":"tha","example":"as in thumb"},
          {"kind":"glyph","kannada":"ದ","transliteration":"da","example":"as in the"},
          {"kind":"glyph","kannada":"ಧ","transliteration":"dha","example":"as in dhal"},
          {"kind":"glyph","kannada":"ನ","transliteration":"na","example":"as in can"},
          {"kind":"glyph","kannada":"ಪ","transliteration":"pa","example":"as in papaya"},
          {"kind":"glyph","kannada":"ಫ","transliteration":"pha","example":"as in orphan"},
          {"kind":"glyph","kannada":"ಬ","transliteration":"ba","example":"as in balloon"},
          {"kind":"glyph","kannada":"ಭ","transliteration":"bha","example":"as in bharat"},
          {"kind":"glyph","kannada":"ಮ","transliteration":"ma","example":"as in man"},
          {"kind":"glyph","kannada":"ಯ","transliteration":"ya","example":"as in yak"},
          {"kind":"glyph","kannada":"ರ","transliteration":"ra","example":"as in rat"},
          {"kind":"glyph","kannada":"ಲ","transliteration":"la","example":"as in lamp"},
          {"kind":"glyph","kannada":"ವ","transliteration":"va","example":"as in water"},
          {"kind":"glyph","kannada":"ಶ","transliteration":"sha","example":"as in ash"},
          {"kind":"glyph","kannada":"ಷ","transliteration":"sshha","example":"as in shut"},
          {"kind":"glyph","kannada":"ಸ","transliteration":"sa","example":"as in sun"},
          {"kind":"glyph","kannada":"ಹ","transliteration":"ha","example":"as in hump"},
          {"kind":"glyph","kannada":"ಳ","transliteration":"lla","example":"as in clitella"}
        ]
      },
      {
        "slug": "pronunciation-key", "order": 4,
        "title": "Reading transliteration",
        "subtitle": "Symbols you'll see across the app.",
        "items": [
          {"kind":"key","symbol":"Ta","example":"Top"},
          {"kind":"key","symbol":"ta","example":"Bharath"},
          {"kind":"key","symbol":"Da","example":"Dark"},
          {"kind":"key","symbol":"da","example":"the"},
          {"kind":"key","symbol":"Na","example":"Pranam"},
          {"kind":"key","symbol":"na","example":"narrator"},
          {"kind":"key","symbol":"La","example":"haLLi"},
          {"kind":"key","symbol":"la","example":"large"}
        ]
      }
    ]
  }
}
$json$::jsonb
where slug = 'basics';
