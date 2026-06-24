-- Audit B4 — persist the learning streak server-side so it survives reinstall /
-- new device. Run in the Supabase SQL editor BEFORE deploying the matching app
-- code (the client writes both columns together; without last_active_date the
-- streak write would fail and the streak stays client-only).
-- Idempotent and safe to re-run.

-- ============================================================
-- Extend public.users with the streak's last-active day
-- ============================================================
-- current_streak already exists (see 2026-05-20_auth_onboarding.sql) but was
-- never written. last_active_date is the local calendar day (YYYY-MM-DD) of the
-- user's most recent qualifying activity — needed alongside current_streak so a
-- restored streak knows whether it's still "live" (yesterday/today) or broken.
alter table public.users
  add column if not exists last_active_date date;

-- RLS already covers these columns via the existing users_update_own policy
-- (see 2026-05-20_auth_onboarding.sql Migration 4). No new policy needed.
