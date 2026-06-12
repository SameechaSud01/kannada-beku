-- C13 resolution — drop Image Match from the overall-progress formula.
--
-- Owner sign-off 2026-06-10. Amends the [LOCKED] formula in
-- spec_db_wiring_games_and_overall_progress.md (locked 2026-05-27) and
-- docs/foundation/STATE.md from three games to two.
--
-- Why: Image Match has no UI entry point (hidden from Practice since
-- 2026-06-03 pending a redesigned mechanic), so users could never accumulate
-- image_match_progress and overall progress was permanently capped below 100%
-- (CONTRADICTIONS C13). Rather than re-ship the old mechanic, the formula now
-- counts only the two seeded, live games.
--
-- New formula (was 50% lessons + 3×(50/3)% games):
--   progress_pct = 50 * (lessons_done / 8)
--                + 25 * (opposites_subgames_done / 8)
--                + 25 * (dictation_subgames_done / 8)
--   (lessons + 2 games × 25% = 100%). Subgame-cleared rule unchanged:
--   >= 80% of that lesson's items is_correct (personal-best), capped at 8.
--
-- image_match_items / image_match_progress tables and the game runner are left
-- intact — only their contribution to overall progress is removed, so the game
-- can be re-added to the formula later if its redesign ships.
--
-- Idempotent: create-or-replace + drop-if-exists, plus a one-time backfill.

create or replace function public.recompute_overall_progress(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lessons_done numeric;
  v_opp_done     numeric;
  v_dict_done    numeric;
  v_progress_pct numeric;
  v_total_score  int;
begin
  if p_user_id is null then
    return;
  end if;

  -- Lessons completed (capped at 8)
  select least(count(*), 8)
    into v_lessons_done
    from public.user_lesson_progress
   where user_id = p_user_id
     and completed_at is not null;

  -- Opposites subgames cleared (>=80% of lesson's items correct, lifetime)
  with item_totals as (
    select lesson_id, count(*)::numeric as total
      from public.opposites_items
     where lesson_id is not null
     group by lesson_id
  ),
  user_correct as (
    select i.lesson_id, count(*) filter (where p.is_correct) as correct
      from public.opposites_items i
      left join public.opposites_progress p
        on p.item_id = i.id and p.user_id = p_user_id
     where i.lesson_id is not null
     group by i.lesson_id
  )
  select least(count(*), 8)
    into v_opp_done
    from item_totals t
    join user_correct c on c.lesson_id = t.lesson_id
   where t.total > 0
     and c.correct::numeric / t.total >= 0.8;

  -- Dictation subgames cleared
  with item_totals as (
    select lesson_id, count(*)::numeric as total
      from public.dictation_items
     where lesson_id is not null
     group by lesson_id
  ),
  user_correct as (
    select i.lesson_id, count(*) filter (where p.is_correct) as correct
      from public.dictation_items i
      left join public.dictation_progress p
        on p.item_id = i.id and p.user_id = p_user_id
     where i.lesson_id is not null
     group by i.lesson_id
  )
  select least(count(*), 8)
    into v_dict_done
    from item_totals t
    join user_correct c on c.lesson_id = t.lesson_id
   where t.total > 0
     and c.correct::numeric / t.total >= 0.8;

  -- Weighted progress (0..100): lessons 50%, opposites 25%, dictation 25%.
  v_progress_pct := 50.0 * (coalesce(v_lessons_done, 0) / 8.0)
                  + 25.0 * (coalesce(v_opp_done, 0)  / 8.0)
                  + 25.0 * (coalesce(v_dict_done, 0) / 8.0);

  -- Total score = average best lesson score across completed lessons
  select coalesce(round(avg(score))::int, 0)
    into v_total_score
    from public.user_lesson_progress
   where user_id = p_user_id
     and completed_at is not null
     and score is not null;

  insert into public.user_overall_progress (user_id, total_score, progress_pct, recomputed_at)
  values (p_user_id, v_total_score, round(v_progress_pct, 2), now())
  on conflict (user_id) do update
    set total_score   = excluded.total_score,
        progress_pct  = excluded.progress_pct,
        recomputed_at = excluded.recomputed_at;
end;
$$;

-- Image Match progress no longer affects overall progress → stop its trigger
-- from firing pointless recomputes. (Table + RPC are kept for the game itself.)
drop trigger if exists trg_im_recompute_overall on public.image_match_progress;

-- Backfill: recompute every user that already has progress, so existing
-- overall_progress rows reflect the 2-game formula immediately.
do $$
declare
  r record;
begin
  for r in
    select user_id from public.user_overall_progress
    union
    select user_id from public.user_lesson_progress
    union
    select user_id from public.opposites_progress
    union
    select user_id from public.dictation_progress
  loop
    perform public.recompute_overall_progress(r.user_id);
  end loop;
end $$;
