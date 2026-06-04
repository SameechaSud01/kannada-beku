-- spec_docs/Sameecha/spec_quick_quiz_runner.md
-- Quick Quiz game: schema + RLS + per-item attempt RPC.
-- Run in the Supabase SQL editor BEFORE deploying the Quick Quiz runner code.
-- Every block is idempotent and safe to re-run. Apply schema (this file)
-- first, then the companion seed 2026-06-02_quick_quiz_seed.sql.
--
-- IMPORTANT: Quick Quiz is INTENTIONALLY EXCLUDED from user_overall_progress.
-- That formula is LOCKED to opposites/dictation/image_match (see
-- 2026-05-27_db_wiring_games_and_overall.sql §Migration 4 and the spec's
-- locked decisions). This migration therefore adds NO trigger on
-- recompute_overall_progress. quick_quiz_progress exists only for this game's
-- own per-item history / future surfaces.

-- ============================================================
-- Tables
-- ============================================================
-- NOTE: quick_quiz_items / quick_quiz_progress were scaffolded via the
-- Supabase UI with a minimal column set, so `create table if not exists`
-- is a no-op on existing installs. The `add column if not exists` blocks
-- below bring a pre-scaffolded table up to the shape this game needs
-- (mirrors how 2026-05-27_db_wiring_games_and_overall.sql handled the other
-- game tables). New installs get the full table from the create statement.
create table if not exists public.quick_quiz_items (
  id              uuid primary key default gen_random_uuid(),
  lesson_id       uuid references public.lessons(id) on delete cascade,
  sort_order      int  not null default 0,
  kannada         text,
  transliteration text,
  meaning         text,
  created_at      timestamptz not null default now()
);

alter table public.quick_quiz_items
  add column if not exists lesson_id       uuid references public.lessons(id) on delete cascade,
  add column if not exists sort_order      int not null default 0,
  add column if not exists kannada         text,
  add column if not exists transliteration text,
  add column if not exists meaning         text,
  add column if not exists created_at      timestamptz not null default now();

create table if not exists public.quick_quiz_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid not null references public.quick_quiz_items(id) on delete cascade,
  is_correct  boolean not null default false,
  attempts    int not null default 0,
  last_played timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.quick_quiz_progress
  add column if not exists is_correct  boolean not null default false,
  add column if not exists attempts    int not null default 0,
  add column if not exists last_played timestamptz not null default now();

-- The UI scaffold gave quick_quiz_items extra NOT NULL columns (e.g.
-- "question") with no default that this game never populates — the seed
-- insert would fail on them. Relax NOT NULL on any column the runner does not
-- use (same "relax the scaffold" move as audio_url/image_url in the
-- 2026-05-27 migration). Runs over whatever legacy columns actually exist.
do $$
declare r record;
begin
  for r in
    select column_name
      from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'quick_quiz_items'
       and is_nullable  = 'NO'
       and column_default is null
       and column_name not in
         ('id','lesson_id','sort_order','kannada','transliteration','meaning','created_at')
  loop
    execute format('alter table public.quick_quiz_items alter column %I drop not null', r.column_name);
  end loop;

  for r in
    select column_name
      from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'quick_quiz_progress'
       and is_nullable  = 'NO'
       and column_default is null
       and column_name not in ('user_id','item_id','is_correct','attempts','last_played')
  loop
    execute format('alter table public.quick_quiz_progress alter column %I drop not null', r.column_name);
  end loop;
end $$;

-- Composite uniqueness on (lesson_id, sort_order) is the seed upsert target.
-- ALTER TABLE ADD CONSTRAINT lacks IF NOT EXISTS — use a catalog probe.
do $$ begin
  if not exists (
    select 1 from pg_constraint
     where conname  = 'quick_quiz_items_lesson_sort_unique'
       and conrelid = 'public.quick_quiz_items'::regclass
  ) then
    alter table public.quick_quiz_items
      add constraint quick_quiz_items_lesson_sort_unique unique (lesson_id, sort_order);
  end if;
end $$;

-- ============================================================
-- RLS
-- ============================================================
-- quick_quiz_items: select for authenticated, no client writes (seed-only).
alter table public.quick_quiz_items enable row level security;
drop policy if exists "quick_quiz_items_select_authenticated" on public.quick_quiz_items;
create policy "quick_quiz_items_select_authenticated" on public.quick_quiz_items
  for select using (auth.role() = 'authenticated');

-- quick_quiz_progress: select / insert / update own, no delete.
alter table public.quick_quiz_progress enable row level security;
drop policy if exists "quick_quiz_progress_select_own" on public.quick_quiz_progress;
create policy "quick_quiz_progress_select_own" on public.quick_quiz_progress
  for select using (auth.uid() = user_id);
drop policy if exists "quick_quiz_progress_insert_own" on public.quick_quiz_progress;
create policy "quick_quiz_progress_insert_own" on public.quick_quiz_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "quick_quiz_progress_update_own" on public.quick_quiz_progress;
create policy "quick_quiz_progress_update_own" on public.quick_quiz_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- intentionally no delete policy.

-- ============================================================
-- Per-item personal-best attempt RPC (SECURITY INVOKER, OR-merge)
-- Mirrors record_opposites_attempt. NO overall-progress recompute.
-- ============================================================
create or replace function public.record_quick_quiz_attempt(
  p_item_id uuid,
  p_is_correct boolean
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.quick_quiz_progress (user_id, item_id, is_correct, attempts, last_played)
  values (auth.uid(), p_item_id, p_is_correct, 1, now())
  on conflict (user_id, item_id) do update
    set is_correct  = public.quick_quiz_progress.is_correct or excluded.is_correct,
        attempts    = public.quick_quiz_progress.attempts + 1,
        last_played = excluded.last_played;
end;
$$;
