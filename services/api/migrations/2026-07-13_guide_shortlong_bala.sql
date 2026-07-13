-- Guide step-3 content fix (owner-directed 2026-07-13): ಕಾಲಿ "kaali" (glossed
-- "empty") is not a Kannada word — empty is ಖಾಲಿ khaali, a different consonant,
-- so it can't sit in a vowel-length minimal pair with ಕಲಿ. Replace the pair with
-- the true short/long pair ಬಲ bala (strength) vs ಬಾಲ baala (tail), and fix the
-- recap line that cites it. spec_lesson0_redesign.md amended same day.
--
-- Manual-migration project: run this in the Supabase SQL editor (no CLI). Idempotent.

update public.lessons
set content_json = jsonb_set(
  jsonb_set(
    content_json,
    '{reference,guide,shortLong}',
    $json$
    {
      "short": {"kannada": "ಬಲ", "transliteration": "bala", "english": "strength"},
      "long":  {"kannada": "ಬಾಲ", "transliteration": "baala", "english": "tail"}
    }
    $json$::jsonb,
    true
  ),
  '{reference,guide,recap,1}',
  '"Long vowels change the word (bala vs baala)."'::jsonb,
  true
)
where slug = 'basics'
  and content_json #> '{reference,guide}' is not null;

-- Verify:
--   select content_json #> '{reference,guide,shortLong}',
--          content_json #> '{reference,guide,recap,1}'
--   from public.lessons where slug = 'basics';
