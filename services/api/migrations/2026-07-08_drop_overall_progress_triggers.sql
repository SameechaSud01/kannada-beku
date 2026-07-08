-- ============================================================
-- Phase 5 (spec_scalability_offline_fixes): drop the unused
-- recompute_overall_progress triggers + function.
--
-- OWNER-RUN in the Supabase dashboard SQL editor (no CLI; anon key
-- cannot run DDL). The app stopped reading user_overall_progress when
-- overall mastery moved client-side (services/progress/overallMastery.ts),
-- so these triggers recompute a value nothing consumes.
--
-- Benchmark note (2026-07-08): measured overhead is ~0 ms per write at
-- current content volume — this is hygiene, not urgency. Safe to run
-- whenever convenient.
--
-- The user_overall_progress TABLE is kept (owner decision 2026-07-08):
-- inert, preserves historical rows.
-- ============================================================

-- STEP 1 — VERIFY FIRST. The live DB was hand-patched on 2026-06-13 and
-- diverges from repo migrations (image_match dropped, function rewritten),
-- so list what actually exists before dropping anything:

select event_object_table, trigger_name
from information_schema.triggers
where trigger_name like '%recompute_overall%'
   or action_statement like '%recompute_overall_progress%'
order by event_object_table;

-- Expected (repo migrations say): triggers on user_lesson_progress,
-- opposites_progress, dictation_progress (image_match_progress is gone).
-- Adjust STEP 2 to exactly the rows returned above.

-- STEP 2 — drop the triggers, by their LIVE names (confirmed from the
-- dependency error on the 2026-07-08 run; the live DB's names differ from
-- the repo migrations). IF EXISTS guards a missing trigger but NOT a missing
-- table, so image_match_progress (table dropped 2026-06-13) must not appear:

drop trigger if exists trg_ulp_recompute_overall on public.user_lesson_progress;
drop trigger if exists trg_opp_recompute_overall on public.opposites_progress;
drop trigger if exists trg_dict_recompute_overall on public.dictation_progress;

-- STEP 3 — drop the functions (trigger wrapper + the recompute itself):

drop function if exists public.trg_recompute_overall_progress();
drop function if exists public.recompute_overall_progress(uuid);

-- STEP 4 — VERIFY: rerun the STEP 1 query — it must return zero rows.
-- Then confirm writes still work: play one game answer in the app and
-- complete a lesson; both should succeed (the record_* RPCs never
-- referenced these functions).
