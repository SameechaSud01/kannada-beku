-- 2026-06-15b_lesson_content_fixes.sql
-- Content corrections for Lessons 1–8 (public.lessons reference words/phrases),
-- mirroring the same fixes applied to the TS-canonical constants/lessons/
-- lessonContent.ts so the legacy DB rows stay in sync.
--
-- Fixes:
--   • ಯಾವದು → ಯಾವುದು  (yaavadu → yaavudu)        — L6 "Which"
--   • ಈಗ  iiga → eega                            — L6 "Now"
--   • ಗೊತ್ತಾ relabelled "Do you know?" (drops the
--     "(casual)" tag) and ಗೊತ್ತೇ (gottee) removed — same form serves both
--   • ನೋಡು/ನೋಡಿ  nodu/nodi → nōdu/nōdi           — L5, L7
--   • ತಂದುಕೊಡು/ತಂದುಕೊಡಿ → thandukodu/thandukodi  — L7
--   • "I am studying" → "I am reading / studying" — L7
--   • ಇದು  idu → idhu  (everywhere ಇದು appears;
--     ಇಡು "Keep" stays idu — masked during the swap)
--   • register label "(casual)" → "(neutral)"     — L5, L6, L7
--
-- Idempotent: each transform is a no-op once applied, and the WHERE clause
-- only writes rows whose text actually changed. Re-running is safe.
-- Manual-run: paste into the Supabase SQL editor (no CLI in this project).
--
-- NOTE: relies on jsonb's canonical text form (keys sorted: english, kannada,
-- transliteration; ", " / ": " separators), which Postgres produces verbatim.

update public.lessons as l
set content_json = t.fixed::jsonb
from (
  select
    id,
    -- nōdi (after idu→idhu so "idu nodi" becomes "idhu nōdi")
    regexp_replace(
    -- nōdu
    regexp_replace(
    -- restore the masked "Keep" (ಇಡು) transliteration
    replace(
    -- ಇದು idu → idhu (word-boundary; ಇಡು masked above, so untouched)
    regexp_replace(
    -- mask "Keep" (ಇಡು) so its idu is not rewritten
    replace(
    -- ತಂದುಕೊಡಿ
    replace(
    -- ತಂದುಕೊಡು
    replace(
    -- ಈಗ iiga → eega
    regexp_replace(
    -- ಯಾವದು transliteration
    regexp_replace(
    -- ಯಾವದು kannada glyph
    replace(
    -- "I am studying" → "I am reading / studying"
    replace(
    -- register label
    replace(
    -- drop the ಗೊತ್ತೇ (gottee) word object entirely
    replace(
    -- de-label ಗೊತ್ತಾ before the global (casual)→(neutral) pass
    replace(
      content_json::text,
      '"Do you know? (casual)"', '"Do you know?"'
    ),
      ', {"english": "Do you know? (respectful)", "kannada": "ಗೊತ್ತೇ?", "transliteration": "gottee"}', ''
    ),
      '(casual)', '(neutral)'
    ),
      '"I am studying"', '"I am reading / studying"'
    ),
      'ಯಾವದು', 'ಯಾವುದು'
    ),
      '\yyaavadu\y', 'yaavudu', 'g'
    ),
      '\yiiga\y', 'eega', 'g'
    ),
      'tandukodu', 'thandukodu'
    ),
      'tandukodi', 'thandukodi'
    ),
      '"kannada": "ಇಡು", "transliteration": "idu"',
      '"kannada": "ಇಡು", "transliteration": "__KEEPIDU__"'
    ),
      '\yidu\y', 'idhu', 'g'
    ),
      '__KEEPIDU__', 'idu'
    ),
      '\ynodu\y', 'nōdu', 'g'
    ),
      '\ynodi\y', 'nōdi', 'g'
    ) as fixed
  from public.lessons
  where lesson_no between 1 and 8
) as t
where l.id = t.id
  and l.content_json::text <> t.fixed;
