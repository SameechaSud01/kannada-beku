# Spec — Fix: onboarding re-shows / loops for existing users

**Issue 1 of the app-wide flow audit (2026-06-16).** Fixed in isolation; do not bundle with the lesson-unlock, games, or home/profile fixes.

## Symptom

A user completes onboarding (or is an existing, already-onboarded user), lands in the app, and is then bounced back to `/onboarding/welcome` — the start of the onboarding flow — and shown onboarding again. It feels intermittent: the completion *did* persist to the DB, so a later cold start often gets them in.

## Root cause

A stale Supabase user-row read overwrites the local `hasCompletedOnboarding` flag back to `false`, and the router reacts to that flag flip by redirecting to onboarding.

1. `supabase.auth.onAuthStateChange` fires multiple times per session (`INITIAL_SESSION`, `SIGNED_IN`, periodic `TOKEN_REFRESHED`). Each fire kicks off an **async** `fetchUserRow(userId)` → `hydrateFromUserRow(row)`.
   - `app/_layout.tsx:121-135`
2. `hydrateFromUserRow` writes the flag unconditionally from the row:
   - `stores/useUserStore.ts:165` → `hasCompletedOnboarding: !!row.onboarding_completed_at`
   - A brand-new user row starts with `onboarding_completed_at = NULL`, and a freshly-committed write can still read NULL from a replica / from a fetch issued before the write committed.
3. `finishOnboarding` writes the DB column, sets the flag `true`, and `router.replace('/(tabs)')` (`app/onboarding/basics.tsx:46-54`). An **in-flight** `fetchUserRow` from an earlier auth event then resolves *after* this, reads the still-`NULL` row, and flips `hasCompletedOnboarding` back to `false`.
4. The routing effect depends on the flag and redirects:
   - `app/_layout.tsx:225-226` → `else if (session && !hasCompletedOnboarding && !inOnboarding) router.replace('/onboarding/welcome')`

Net: a stale read downgrades a locally-true flag, and the router immediately sends the user back to the start of onboarding.

## Fix

Make `hasCompletedOnboarding` **monotonic during a session**: a server read of `NULL` must never downgrade a locally-`true` flag. The DB stays authoritative for "completed = true"; only "completed = false" coming from a possibly-stale read is ignored when local already says true.

### Change — `stores/useUserStore.ts`

`hydrateFromUserRow` (lines 159-169): switch to the functional `set` form and OR the flag with prior local state.

```ts
hydrateFromUserRow: (row) =>
  set((s) => ({
    displayName: row.name,
    learningMode: row.learning_mode,
    motivations: row.motivations ?? [],
    dailyGoalMinutes: row.daily_goal_minutes,
    // Onboarding completion is monotonic within a session: a server row that
    // still reads NULL (replica lag, or a fetch issued before the completion
    // write committed) must not clobber a locally-completed flag back to false
    // and bounce the user into /onboarding/welcome. (spec_fix_onboarding_loop.md)
    hasCompletedOnboarding: s.hasCompletedOnboarding || !!row.onboarding_completed_at,
    dailyReminderTime: row.daily_reminder_time ?? null,
    ttsRate: row.tts_rate ?? 1.0,
    autoReplay: row.auto_replay ?? true,
  })),
```

Only two things change vs. current code: `set({...})` → `set((s) => ({...}))`, and the `hasCompletedOnboarding` line gains `s.hasCompletedOnboarding ||`. Every other field is hydrated exactly as before.

## Why this is safe (account switching)

The flag is only ever *raised* by a stale read, never wrongly persisted across accounts, because a genuine account switch explicitly resets it to `false` first:

- `resetForUser` → `hasCompletedOnboarding: false` (`stores/useUserStore.ts:142-157`)
- `reset` → `hasCompletedOnboarding: false` (`stores/useUserStore.ts:171-187`)

So a switched-in account starts from `false`, and only that account's *real* server value (or its own completion) can raise it. The monotonic OR only protects against same-session stale NULL reads.

The existing `pendingOnboardingSync` retry path (`app/_layout.tsx:140-145`) is unaffected — it keys off the row's `onboarding_completed_at`, not the local flag.

## Out of scope

- No changes to the routing effect, the auth handler, or the DB trigger.
- No DB migration.

## Acceptance criteria

1. New user completing onboarding lands in `/(tabs)` and is **not** redirected to `/onboarding/welcome`, even as later `TOKEN_REFRESHED` events fire stale reads.
2. Existing onboarded user cold-starting the app goes straight to `/(tabs)` and stays there.
3. Signing out and into a *different* account that has not completed onboarding still routes to `/onboarding/welcome` (no leaked flag).
4. No regression to the `pendingOnboardingSync` retry.

## Manual test (owner) — hand off before Issue 2

- [ ] Fresh account: complete onboarding → lands in tabs, stays there (wait ~10s for a token refresh, confirm no bounce).
- [ ] Kill + relaunch app on that account → goes straight to tabs.
- [ ] Sign out → sign into a second, non-onboarded account → sees onboarding/welcome.
- [ ] Complete onboarding on the second account → lands in tabs, stays there.
