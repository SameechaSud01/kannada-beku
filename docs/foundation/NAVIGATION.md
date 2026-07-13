---
doc: NAVIGATION
status: reviewed
owner: samee
last-reviewed: 2026-06-01
related:
  - SCOPE.md
  - STATE.md
  - DESIGN.md
---

# Navigation

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Owns: route tree, params, deep links, auth gating, **and** named user journeys.

## Stack

`[LOCKED]`

Expo Router 6 (file-based). One screen per file in [app/](../../app/). No native code; route groups via `(group)` parentheses.

## Root layout

`[LOCKED]` — matches [app/_layout.tsx](../../app/_layout.tsx).

File: [app/_layout.tsx](../../app/_layout.tsx). Wraps everything in:
1. `QueryClientProvider` (TanStack Query)
2. `SafeAreaProvider`
3. `AppGate` — handles auth + onboarding redirect

Loads fonts, sets audio mode (`playsInSilentModeIOS: true`), probes Kannada TTS on boot.

## Route table

`[LOCKED]` — paths and group layouts match the live route tree. Header column entries marked `TODO` are `[OPEN]`.

| Path | File | Group layout | Header | Notes |
|---|---|---|---|---|
| `/(auth)/login` | [login.tsx](../../app/%28auth%29/login.tsx) | Stack, `headerShown: false`, bg `Colors.surface` | none | Email/password via Supabase; "Forgot password?" link (login mode) |
| `/(auth)/forgot-password` | [forgot-password.tsx](../../app/%28auth%29/forgot-password.tsx) | ↑ | Screen-owned back chip | Request reset email. See [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md). |
| `/(auth)/reset-password` | [reset-password.tsx](../../app/%28auth%29/reset-password.tsx) | ↑ | Screen-owned back chip | Deep-link landing; exchanges `code`, sets new password. See [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md). |
| `/(tabs)/` | [index.tsx](../../app/%28tabs%29/index.tsx) | Custom `TabBar`, `headerShown: false` | none | Home |
| `/(tabs)/learn` | [learn.tsx](../../app/%28tabs%29/learn.tsx) | ↑ | none | Lesson catalog |
| `/(tabs)/practice` | [practice.tsx](../../app/%28tabs%29/practice.tsx) | ↑ | none | Games menu |
| `/(tabs)/profile` | [profile.tsx](../../app/%28tabs%29/profile.tsx) | ↑ | none | Profile + settings |
| `/(games)/dictation` | [dictation.tsx](../../app/%28games%29/dictation.tsx) | Stack, `headerShown: false` | none | Dictation game |
| `/(games)/opposites` | [opposites.tsx](../../app/%28games%29/opposites.tsx) | ↑ | none | Opposites game |
| `/onboarding/welcome` | [welcome.tsx](../../app/onboarding/welcome.tsx) | Stack, `slide_from_right`, `headerShown: false` | none | Intro |
| `/onboarding/name` | [name.tsx](../../app/onboarding/name.tsx) | ↑ | none | Display name (step 1/4). See [spec_onboarding_tweaks](../../spec_docs/Sameecha/spec_onboarding_tweaks.md). |
| `/onboarding/goal` | [goal.tsx](../../app/onboarding/goal.tsx) | ↑ | none | Learning mode (step 2/4) |
| `/onboarding/motivation` | [motivation.tsx](../../app/onboarding/motivation.tsx) | ↑ | none | Motivation (step 3/4, max 3, supports "Other") |
| `/onboarding/commitment` | [commitment.tsx](../../app/onboarding/commitment.tsx) | ↑ | none | Daily goal (intake step 3/4, info dialog per choice) |
| `/onboarding/reminder` | [reminder.tsx](../../app/onboarding/reminder.tsx) | ↑ | none | Daily reminder soft opt-in (intake step 4/4), time chosen on the shared TimeWheelPicker. "Remind me" runs the notification permission → schedule flow; "Not now" skips. See [spec_onboarding_reminder_step](../../spec_docs/Sameecha/spec_onboarding_reminder_step.md). |
| `/onboarding/greeting` | [greeting.tsx](../../app/onboarding/greeting.tsx) | ↑ | none | Post-intake plan confirmation (no progress bar). See [spec_onboarding_audit_fixes](../../spec_docs/Sameecha/spec_onboarding_audit_fixes.md). |
| `/onboarding/basics` | [basics.tsx](../../app/onboarding/basics.tsx) | ↑ | none | Beginners' Guide primer (last step, fires `setOnboarding()`). See [spec_beginners_guide](../../spec_docs/Sameecha/spec_beginners_guide.md). |
| `/guide` | [guide.tsx](../../app/guide.tsx) | root stack | Screen-owned back chip + title | Voluntary re-entry to the Beginners' Guide from `/(tabs)/learn`. Identical content to `/onboarding/basics`, no `ProgressDots`. |
| `/lesson/[id]` | [[id].tsx](../../app/lesson/%5Bid%5D.tsx) | root stack | TODO | Lesson runner. Param: `id` = `LessonId` |
| `/practice/[id]` | [[id].tsx](../../app/practice/%5Bid%5D.tsx) | root stack | TODO | Game detail. Param: `id` = game id |
| `/heritage/[id]` | [[id].tsx](../../app/heritage/%5Bid%5D.tsx) | root stack | TODO | Heritage detail. Param: `id` = slug |
| `/emergency` | [emergency.tsx](../../app/emergency.tsx) | root stack | TODO | Emergency phrase guide |
| `/settings/audio` | [audio.tsx](../../app/settings/audio.tsx) | Stack, `slide_from_right`, `headerShown: false` (screen owns header) | Screen-owned back chip + title | TTS rate, auto-replay, device-voice link. See [spec_profile_settings_wiring](../../spec_docs/Sameecha/spec_profile_settings_wiring.md) §4. |
| `/settings/help` | [help.tsx](../../app/settings/help.tsx) | ↑ | Screen-owned back chip + title | Contact / bug-report mailto + version + policy links. §5. |

Reminders is presented as a bottom sheet ([RemindersSheet](../../components/modals/instances/RemindersSheet.tsx)) via `ModalHost`, not a routed screen — the surface is too small to justify a full page. See [spec_profile_settings_wiring](../../spec_docs/Sameecha/spec_profile_settings_wiring.md) §3.

> **TODO:** Header behavior for dynamic routes (`/lesson/[id]`, `/practice/[id]`, `/heritage/[id]`, `/emergency`) — confirm if any show a header or all are headerless.

## Auth + onboarding gating

`[LOCKED]` — matches `AppGate` in [app/_layout.tsx](../../app/_layout.tsx).

Decision matrix:

| Session? | Onboarded? | Current group | Action |
|---|---|---|---|
| ❌ | — | not `(auth)` | redirect to `/(auth)/login` |
| ❌ | — | `(auth)` | stay |
| ✅ | ❌ | not `onboarding` | redirect to `/onboarding/welcome` |
| ✅ | ❌ | `onboarding` | stay |
| ✅ | ✅ | `(auth)` or `onboarding` | redirect to `/(tabs)` |
| ✅ | ✅ | other | stay |
| ✅ (recovery) | — | `(auth)/reset-password` | **stay** — no redirect; screen owns exit after password is set |

**Reset-password exception:** while the user is on `(auth)/reset-password`, an active (recovery) session must not trigger any redirect. `AppGate` early-returns when `session && segments[1] === 'reset-password'`, so neither the onboarded→`/(tabs)` nor the un-onboarded→`/onboarding/welcome` rule fires; the screen calls `router.replace(...)` itself on success. See [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md).

Hydration: both `useUserStore.isHydrated` AND `useProgressStore.isHydrated` must be true before `AppGate` redirects. Otherwise stale persisted state may cause flicker.

**Why hydrate first:** the persisted onboarding flag controls the redirect target. Without waiting for hydration, an onboarded user briefly sees `/(auth)/login`.

User-switch reset: AppGate compares `session.user.id` against `useUserStore.userId`. First-time bind (stored id `null`) just records the new id. A mismatch fires `useUserStore.resetForUser(newId)` + `useProgressStore.reset()` and the routing effect waits one tick for the reset to land before re-evaluating. Without this, a previously onboarded user signing out and a new user signing up on the same install inherits the prior `hasCompletedOnboarding: true` flag and skips onboarding.

## Deep linking

`[LOCKED]` — scheme matches [app.json](../app.json). _Renamed `kannada-baa` → `kannada-beku` (owner-approved 2026-06-04, app rebrand)._

- **Scheme:** `kannada-beku` (declared in [app.json](../app.json)).
- **Custom linking config:** the password-recovery link (`Linking.createURL('reset-password')`, allow-listed in Supabase) opens `(auth)/reset-password`, which manually exchanges the `?code=` param for a session (`detectSessionInUrl` stays `false`). First and only deep-link handler. See [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md). All other routes are file-based and addressable via path.

> **TODO:** Universal links / Android App Links (`https://`) — needed for marketing? Out of MVP?

## Modal vs push

`[OPEN]` — for route-level modal presentation. Overlay modals **have shipped** via the [MODALS](../../spec_docs/Sameecha/MODALS.md) spec (dialogs, bottom sheets, full-screen takeovers, toasts) and live outside the route stack via `ModalHost` + `ToastHost`. They're orthogonal to the question below.

> **TODO:** No *route-level* modal presentation currently. Confirm: all navigation is push-stack?
> Candidate route-level modals:
> - `/emergency` — it's a "tool" screen, not a page; modal might fit.
> - Lesson runner — full-screen takeover with no tab bar; modal presentation feels right.

## Back behavior

`[LOCKED]` — resolved 2026-05-19.

Every screen except the four `(tabs)` roots, `(auth)/login`, and `onboarding/welcome` shows a back affordance. The chip is a 40×40 round button (`Colors.surfaceContainerHighest` bg, `Icons.back` 20pt in `Colors.primary`), placed top-left at `insets.top + Spacing.sm` / `Spacing.lg`. Implemented by [components/ui/ExitBackButton.tsx](../../../components/ui/ExitBackButton.tsx).

Per-flow rules:

| Flow | Back affordance | Behavior on tap |
|---|---|---|
| `(tabs)` (home, learn, practice, profile) | none | n/a — root tabs |
| `(auth)/login` | none | first screen of its flow |
| `(auth)/forgot-password`, `(auth)/reset-password` | screen-owned back chip (`ExitBackButton skipConfirm`) | Plain `router.back()` — nothing committed yet |
| `/onboarding/welcome` | none | first onboarding step; no meaningful prior route |
| `/onboarding/{name,goal,motivation,commitment,basics}` | inline Back/Continue pair (existing) | `router.back()` — no confirm; selections are not yet committed to the store |
| `/guide` (voluntary re-entry) | screen-owned back chip | Plain `router.back()` — read-only surface, nothing to lose. See [spec_beginners_guide](../../spec_docs/Sameecha/spec_beginners_guide.md). |
| `/lesson/[id]` scenario / intake / drill / output | floating chip overlay | `ExitLessonDialog` (lesson variant) — destructive confirm, blocks backdrop tap + Android hardware back. See [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.1. |
| `/lesson/[id]` done | none | Existing close button on `DoneCard` handles exit |
| `/(games)/dictation`, `/(games)/opposites` mid-game | inline chip in header row | `ExitLessonDialog` (game variant). See [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.1. |
| `/(games)/*` result screen | floating chip overlay | Plain `router.back()` — nothing to lose |
| `/practice/[id]`, `/heritage/[id]`, `/emergency` | screen-owned back arrow (existing) | Plain `router.back()` |

**Why confirm only mid-flow:** drill attempts and in-progress game state are not persisted; a stray back tap on a phone is easy and otherwise silently loses work. Once a lesson reaches `done` or a game reaches `result`, progress is already committed, so plain back is fine.

## User journeys

Named multi-screen flows. Each names entry → exit.

### J1: First-time sign-up

`[LOCKED]` — describes the live flow. Amended 2026-06-01 to add the Beginners' Guide as the final step (see [spec_beginners_guide](../../spec_docs/Sameecha/spec_beginners_guide.md)). Amended 2026-07-09 to add the reminder soft opt-in as intake step 4/4 (see [spec_onboarding_reminder_step](../../spec_docs/Sameecha/spec_onboarding_reminder_step.md)).

1. App launch → `AppGate` → no session → `/(auth)/login`
2. User taps "Create account" toggle → fills email/password → submits
3. Supabase confirms (no email-verification flow in MVP — TODO confirm)
4. `setSession()` fires → `AppGate` reruns → not onboarded → `/onboarding/welcome`
5. Welcome → Name (1/4) → Motivation (2/4) → Commitment (3/4) → **Reminder (4/4)** → Greeting → Basics → `setOnboarding()` → `/(tabs)`
6. On first arrival at `/(tabs)/` after this flow, a one-time home toast fires pointing to the Learn-tab basics card (`hasSeenBasicsHomeNudge` gates re-fire). See [spec_beginners_guide](../../spec_docs/Sameecha/spec_beginners_guide.md).

_The reminder step is skippable ("Not now") and never blocks; every branch — granted, denied, or skipped — advances to Greeting. Notification permission uses the in-app `PermissionDialog` before the OS prompt, per [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.8._

### J2: Complete a lesson

`[LOCKED]`

1. From `/(tabs)/learn` → tap next available lesson → `/lesson/[id]`
2. Phase: `scenario` → `intake` → `drill` → `output` → `done`
3. On `done`: `completeLesson()` fires → updates progress store → user taps close → back to `/(tabs)/learn`

### J3: Play a game

`[LOCKED]`

1. From `/(tabs)/practice` → tap a game card → `/practice/[gameId]`
2. Select source lesson(s) → game launches → `/(games)/<gameId>`
3. Game completes → return to practice menu

### J4: Emergency phrase

`[LOCKED]`

1. From `/(tabs)/` (home) → "Stuck right now?" card → `/emergency`
2. Browse 3 groups → tap a phrase → TTS plays
3. Back out via header/swipe

### J5: Reset a forgotten password

`[LOCKED]` — see [spec_password_reset](../../spec_docs/Sameecha/spec_password_reset.md).

1. `/(auth)/login` (login mode) → tap "Forgot password?" → `/(auth)/forgot-password`
2. Enter email → `resetPasswordForEmail` → "check your email" confirmation (no account-existence leak); Resend available
3. User opens the email → taps the link → app deep-links to `/(auth)/reset-password`
4. App exchanges `?code=` → recovery session; `AppGate` early-returns (no redirect)
5. Set + confirm new password → `updateUser({ password })` → `passwordUpdated`
6. Screen `router.replace`s into the app via the onboarded/un-onboarded split

> **TODO:** J6+ — heritage flow, profile edit flow.

## Open questions

`[OPEN]`

- Should the lesson runner be a modal presentation (full-screen takeover) instead of a stack push?
- Email-verification flow (Supabase supports it) — gate before onboarding, or skip in MVP?
- Account deletion / sign-out flow — sign-out exists but no UX spec.
