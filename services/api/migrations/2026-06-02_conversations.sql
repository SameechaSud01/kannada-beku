-- spec_docs/Sameecha/spec_conversations_runner.md
-- Conversations game: scenario/turn schema + RLS + per-turn attempt RPC.
-- Run in the Supabase SQL editor BEFORE deploying the Conversations runner.
-- Idempotent and safe to re-run. Apply this schema first, then the companion
-- seed 2026-06-02_conversations_seed.sql.
--
-- IMPORTANT: Conversations is INTENTIONALLY EXCLUDED from user_overall_progress
-- (formula LOCKED to opposites/dictation/image_match). This migration adds NO
-- trigger on recompute_overall_progress. conversation_progress exists only for
-- this game's own per-turn history.
--
-- Data model: one row per dialogue TURN (conversation_items), grouped under a
-- parent scenario (conversation_scenarios). A turn's per-item id is the unit
-- recorded against, matching every other game's per-item progress pattern.

-- ============================================================
-- Tables
-- ============================================================
-- NOTE: conversation_items / conversation_progress were scaffolded via the
-- Supabase UI with a minimal column set, so `create table if not exists` is a
-- no-op on existing installs. The `add column if not exists` blocks bring a
-- pre-scaffolded table up to the shape this game needs. conversation_scenarios
-- is new; it is created before conversation_items so the FK resolves.
create table if not exists public.conversation_scenarios (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid references public.lessons(id) on delete cascade,
  sort_order  int  not null default 0,
  title       text,
  created_at  timestamptz not null default now()
);

alter table public.conversation_scenarios
  add column if not exists lesson_id  uuid references public.lessons(id) on delete cascade,
  add column if not exists sort_order int not null default 0,
  add column if not exists title      text,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.conversation_items (
  id                uuid primary key default gen_random_uuid(),
  scenario_id       uuid references public.conversation_scenarios(id) on delete cascade,
  turn_index        int  not null default 0,
  speaker_line_kn   text,
  speaker_line_en   text,
  -- options_json: [{ "id": "a", "kn": "...", "tr": "...", "en": "..." }, ...]
  options_json      jsonb not null default '[]'::jsonb,
  correct_option_id text,
  created_at        timestamptz not null default now()
);

alter table public.conversation_items
  add column if not exists scenario_id       uuid references public.conversation_scenarios(id) on delete cascade,
  add column if not exists turn_index        int not null default 0,
  add column if not exists speaker_line_kn   text,
  add column if not exists speaker_line_en   text,
  add column if not exists options_json      jsonb not null default '[]'::jsonb,
  add column if not exists correct_option_id text,
  add column if not exists created_at        timestamptz not null default now();

create table if not exists public.conversation_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid not null references public.conversation_items(id) on delete cascade,
  is_correct  boolean not null default false,
  attempts    int not null default 0,
  last_played timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.conversation_progress
  add column if not exists is_correct  boolean not null default false,
  add column if not exists attempts    int not null default 0,
  add column if not exists last_played timestamptz not null default now();

-- Relax NOT NULL on any legacy UI-scaffold columns this game never populates,
-- so the seed inserts don't fail on them (same approach as the quick_quiz
-- migration). Runs over whatever legacy columns actually exist per table.
do $$
declare r record;
begin
  for r in
    select column_name
      from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'conversation_scenarios'
       and is_nullable  = 'NO'
       and column_default is null
       and column_name not in ('id','lesson_id','sort_order','title','created_at')
  loop
    execute format('alter table public.conversation_scenarios alter column %I drop not null', r.column_name);
  end loop;

  for r in
    select column_name
      from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'conversation_items'
       and is_nullable  = 'NO'
       and column_default is null
       and column_name not in
         ('id','scenario_id','turn_index','speaker_line_kn','speaker_line_en','options_json','correct_option_id','created_at')
  loop
    execute format('alter table public.conversation_items alter column %I drop not null', r.column_name);
  end loop;

  for r in
    select column_name
      from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'conversation_progress'
       and is_nullable  = 'NO'
       and column_default is null
       and column_name not in ('user_id','item_id','is_correct','attempts','last_played')
  loop
    execute format('alter table public.conversation_progress alter column %I drop not null', r.column_name);
  end loop;
end $$;

-- Upsert targets for the idempotent seed.
do $$ begin
  if not exists (
    select 1 from pg_constraint
     where conname  = 'conversation_scenarios_lesson_sort_unique'
       and conrelid = 'public.conversation_scenarios'::regclass
  ) then
    alter table public.conversation_scenarios
      add constraint conversation_scenarios_lesson_sort_unique unique (lesson_id, sort_order);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
     where conname  = 'conversation_items_scenario_turn_unique'
       and conrelid = 'public.conversation_items'::regclass
  ) then
    alter table public.conversation_items
      add constraint conversation_items_scenario_turn_unique unique (scenario_id, turn_index);
  end if;
end $$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.conversation_scenarios enable row level security;
drop policy if exists "conversation_scenarios_select_authenticated" on public.conversation_scenarios;
create policy "conversation_scenarios_select_authenticated" on public.conversation_scenarios
  for select using (auth.role() = 'authenticated');

alter table public.conversation_items enable row level security;
drop policy if exists "conversation_items_select_authenticated" on public.conversation_items;
create policy "conversation_items_select_authenticated" on public.conversation_items
  for select using (auth.role() = 'authenticated');

alter table public.conversation_progress enable row level security;
drop policy if exists "conversation_progress_select_own" on public.conversation_progress;
create policy "conversation_progress_select_own" on public.conversation_progress
  for select using (auth.uid() = user_id);
drop policy if exists "conversation_progress_insert_own" on public.conversation_progress;
create policy "conversation_progress_insert_own" on public.conversation_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "conversation_progress_update_own" on public.conversation_progress;
create policy "conversation_progress_update_own" on public.conversation_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- intentionally no delete policy.

-- ============================================================
-- Per-turn personal-best attempt RPC (SECURITY INVOKER, OR-merge)
-- Mirrors record_opposites_attempt. NO overall-progress recompute.
-- ============================================================
create or replace function public.record_conversation_attempt(
  p_item_id uuid,
  p_is_correct boolean
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.conversation_progress (user_id, item_id, is_correct, attempts, last_played)
  values (auth.uid(), p_item_id, p_is_correct, 1, now())
  on conflict (user_id, item_id) do update
    set is_correct  = public.conversation_progress.is_correct or excluded.is_correct,
        attempts    = public.conversation_progress.attempts + 1,
        last_played = excluded.last_played;
end;
$$;
