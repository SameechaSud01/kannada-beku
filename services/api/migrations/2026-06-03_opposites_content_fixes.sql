-- Opposites content fixes — 2026-06-03
-- Source of decision: docs/audits/2026-06-03-opposites-content-review.md
-- Run manually in the Supabase SQL editor (no CLI in this project).
--
-- Only 3 of the reviewed pairs actually change. Items already correct in the
-- DB (ಹೌದು→ಇಲ್ಲ, ಮಲಗು→ಎದ್ದು, ನಿನ್ನ→ನಿಮ್ಮ, ನೀವು→ನೀನು) are intentionally untouched.

-- 1) ಶೀತ ("a cold/illness") was the wrong word for the adjective "cold".
--    Replace the PROMPT word with ತಂಪು; opposite ಬಿಸಿ (hot) is unchanged.
--    options_json needs no edit — ಶೀತ was never one of the options.
update public.opposites_items
set word            = 'ತಂಪು',
    transliteration = 'tampu'
where id = 'b655ae6e-1b62-44bd-92d9-631f91d3c791';

-- 3) ಗೊತ್ತಾ is a question ("do you know?"); the clean antonym is the verb
--    ಗೊತ್ತು ("know") ↔ ಗೊತ್ತಿಲ್ಲ ("don't know"). Change the PROMPT word only.
update public.opposites_items
set word            = 'ಗೊತ್ತು',
    transliteration = 'gottu',
    meaning         = 'know'
where id = '6df052ae-bbf8-4d53-b55d-e3c232b3c986';

-- 7) ನಾನು (I) — change the OPPOSITE from ನೀನು to ನೀವು, and swap the matching
--    option so the correct answer is present in options_json.
update public.opposites_items
set opposite     = 'ನೀವು',
    options_json = '[{"en":"you (respectful)","kn":"ನೀವು","tr":"nīvu"},{"en":"your (respectful)","kn":"ನಿಮ್ಮ","tr":"nimma"},{"en":"this person","kn":"ಇವರು","tr":"ivaru"},{"en":"name","kn":"ಹೆಸರು","tr":"hesaru"}]'::jsonb
where id = 'db0babc3-312c-4179-a820-930784d88d48';
