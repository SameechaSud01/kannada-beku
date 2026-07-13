-- Lesson 0 redesign — replace content_json.reference.guide with the new
-- paced, listen-first 7-step payload (spec_lesson0_redesign.md, owner-signed
-- 2026-06-30). Supersedes the principles/vowelPairs/vowelLoners/consonantFamilies/
-- readingRows/chart/tryIt shape read by the old 3-step flow.
--
-- This only rewrites the `{reference,guide}` path. The legacy `reference.sections`
-- (the 13-vowel list + full 34-consonant chart + pronunciation key) and the empty
-- words[]/phrases[] are intentionally left in place — they're harmless and are not
-- read by services/api/guide.ts after the redesign.
--
-- Manual-migration project: run this in the Supabase SQL editor (no CLI). Idempotent.

-- 1. Ensure the basics row exists (no-op if it already does; slug is unique).
insert into public.lessons (lesson_no, title, slug, situation, real_world_prompt, content_json, audio_url)
values (0, 'Kannada basics', 'basics', null, null, '{}'::jsonb, null)
on conflict (slug) do nothing;

-- 2. Overwrite reference.guide in place, creating the `reference` object first if
--    it is somehow absent (fresh row). Spec leads; the migration follows.
update public.lessons
set content_json = jsonb_set(
  jsonb_set(
    coalesce(content_json, '{}'::jsonb),
    '{reference}',
    coalesce(content_json -> 'reference', '{}'::jsonb),
    true
  ),
  '{reference,guide}',
  $json$
  {
    "welcomePoints": [
      {"n": 1, "text": "It is spoken almost exactly as it is written."},
      {"n": 2, "text": "Every vowel is pronounced — nothing stays silent."},
      {"n": 3, "text": "Even stress: syllables share the weight."}
    ],
    "vowels": [
      {"kannada": "ಅ", "transliteration": "a"},
      {"kannada": "ಆ", "transliteration": "aa"},
      {"kannada": "ಇ", "transliteration": "i"},
      {"kannada": "ಈ", "transliteration": "ee"},
      {"kannada": "ಉ", "transliteration": "u"},
      {"kannada": "ಊ", "transliteration": "oo"},
      {"kannada": "ಎ", "transliteration": "e"},
      {"kannada": "ಒ", "transliteration": "o"}
    ],
    "shortLong": {
      "short": {"kannada": "ಬಲ", "transliteration": "bala", "english": "strength"},
      "long":  {"kannada": "ಬಾಲ", "transliteration": "baala", "english": "tail"}
    },
    "retroflexRows": [
      {"curled": {"kannada": "ಟ", "transliteration": "Ta"}, "dental": {"kannada": "ತ", "transliteration": "ta"}},
      {"curled": {"kannada": "ಡ", "transliteration": "Da"}, "dental": {"kannada": "ದ", "transliteration": "da"}}
    ],
    "doubles": [
      {"kannada": "ಅಪ್ಪ", "transliteration": "appa", "english": "father"},
      {"kannada": "ಅಮ್ಮ", "transliteration": "amma", "english": "mother"},
      {"kannada": "ಹಳ್ಳಿ", "transliteration": "haLLi", "english": "village"}
    ],
    "rhythm": {
      "kannada": "ನನಗೆ ಕನ್ನಡ ಬೇಕು",
      "syllables": ["na", "na", "ge", "kan", "na", "da", "bē", "ku"],
      "transliteration": "Nanage Kannada bēku",
      "english": "“I want Kannada”"
    },
    "recap": [
      "Kannada is phonetic — say what you see.",
      "Long vowels change the word (bala vs baala).",
      "Capital letters (Ta, Da, Na, La) mean curl your tongue.",
      "Double letters are held slightly longer."
    ]
  }
  $json$::jsonb,
  true
)
where slug = 'basics';

-- Verify:
--   select content_json -> 'reference' -> 'guide' -> 'vowels'
--   from public.lessons where slug = 'basics';
