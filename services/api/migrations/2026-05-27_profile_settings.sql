-- spec_docs/Sameecha/spec_profile_settings_wiring.md
-- Run in the Supabase SQL editor before deploying the matching app code.
-- Each block is idempotent and safe to re-run.

-- ============================================================
-- Migration 1 — extend public.users with reminder + audio prefs
-- ============================================================
-- daily_reminder_time: 'HH:MM' 24h. Null = no reminder scheduled.
-- tts_rate: clamped 0.50..1.50 client-side; no CHECK so future bounds
-- changes don't need a migration.
-- auto_replay: whether lesson cards auto-speak on mount.
alter table public.users
  add column if not exists daily_reminder_time text,
  add column if not exists tts_rate numeric(3,2) not null default 1.00,
  add column if not exists auto_replay boolean not null default true;

-- RLS already covers these columns via the existing users_update_own policy
-- (see 2026-05-20_auth_onboarding.sql Migration 4). No new policy needed.
