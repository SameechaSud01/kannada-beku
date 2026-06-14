-- In-app feedback form (Profile → Help & feedback → Send feedback).
-- Run in the Supabase SQL editor before deploying the matching app code.
-- Each block is idempotent and safe to re-run.

-- ============================================================
-- Migration 1 — user_feedback table
-- ============================================================
-- One row per submitted feedback message. category is nullable (reserved for
-- optional Idea/Bug/Other chips); app_version/device mirror the build+device
-- context the old mailto bug-report body captured. The owner reads these in
-- the dashboard via the service role.
create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text,
  message text not null,
  app_version text,
  device text,
  created_at timestamptz not null default now()
);

create index if not exists user_feedback_user_id_idx
  on public.user_feedback (user_id);

-- ============================================================
-- Migration 2 — RLS (insert/select own; no update/delete)
-- ============================================================
alter table public.user_feedback enable row level security;

drop policy if exists "feedback_insert_own" on public.user_feedback;
create policy "feedback_insert_own" on public.user_feedback
  for insert with check (auth.uid() = user_id);

drop policy if exists "feedback_select_own" on public.user_feedback;
create policy "feedback_select_own" on public.user_feedback
  for select using (auth.uid() = user_id);
-- intentionally no update/delete policy.
