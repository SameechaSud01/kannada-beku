-- spec_docs/Sameecha/spec_content_integrity.md (§3.2 brackets, §3.3 repetitions)
--
-- Source-of-truth content patch. The DB is the single source for served
-- game/lesson content (foundation CONTENT.md), so corrections ship here, not
-- in app code (D2).
--
-- Scope of this migration:
--   §3.2  Fix awkward / slash glosses in opposites options so the render-time
--         chip (utils/gloss.splitGloss) yields a clean primary gloss + a
--         register/gender tag. Parenthetical glosses like "(respectful)" are
--         left in place — they are extracted into chips at render and need no
--         data change.
--   §3.3  De-duplicate the ಹೌದು ↔ ಇಲ್ಲ (yes ↔ no) opposite pair, which was
--         seeded three times (L1 S3, L3 S2, L6 S2). The L1 instance is kept as
--         the canonical one; the L3 and L6 duplicates are removed (owner
--         decision: remove duplicates only, no new authoring).
--
-- Idempotent: UPDATEs are absolute rewrites of the target rows; DELETEs are
-- no-ops once the duplicate rows are gone.

-- ============================================================
-- §3.2 — Opposites gloss cleanup
-- ============================================================

-- L2 S1 (ಇವರು ↔ ಅವರು): drop the "/ those people" / "/ these people" slash
-- alternates in favour of a single primary gloss.
update public.opposites_items
set meaning = 'this person',
    options_json = '[{"kn":"ಅವರು","tr":"avaru","en":"that person"},{"kn":"ನಾನು","tr":"nānu","en":"I"},{"kn":"ನೀವು","tr":"nīvu","en":"you (respectful)"},{"kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"}]'::jsonb
where lesson_id = (select id from public.lessons where lesson_no = 2)
  and sort_order = 1;

-- L2 S5 (ನಿನ್ನ ↔ ನಿಮ್ಮ): fix the awkward "this he" / "that she" distractor
-- glosses into "this person (he)" / "that person (she)" so the gender reads as
-- a chip, not a malformed phrase.
update public.opposites_items
set options_json = '[{"kn":"ನಿಮ್ಮ","tr":"nimma","en":"your (respectful)"},{"kn":"ನಾನು","tr":"nānu","en":"I"},{"kn":"ಇವನು","tr":"ivanu","en":"this person (he)"},{"kn":"ಅವಳು","tr":"avaḷu","en":"that person (she)"}]'::jsonb
where lesson_id = (select id from public.lessons where lesson_no = 2)
  and sort_order = 5;

-- ============================================================
-- §3.3 — De-duplicate ಹೌದು ↔ ಇಲ್ಲ (yes ↔ no)
-- ============================================================
-- Keep L1 S3 (canonical). Remove the L3 S2 and L6 S2 duplicates.
delete from public.opposites_items
where word = 'ಹೌದು'
  and opposite = 'ಇಲ್ಲ'
  and lesson_id in (select id from public.lessons where lesson_no in (3, 6));
