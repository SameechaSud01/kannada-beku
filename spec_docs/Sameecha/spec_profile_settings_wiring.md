---
doc: SPEC_PROFILE_SETTINGS_WIRING
status: proposed
owner: samee
last-reviewed: 2026-05-27
branch: settings-profile-changes
related:
  - ../../docs/foundation/STATE.md
  - ../../docs/foundation/NAVIGATION.md
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/INTERACTIONS.md
  - ./MODALS.md
  - ./spec_onboarding_tweaks.md
  - ./spec_db_wiring_games_and_overall_progress.md
---

# Profile / Settings wiring

Closes every non-functional or partially-functional control on [app/(tabs)/profile.tsx](../../app/(tabs)/profile.tsx). Audit baseline: [docs/audits/2026-05-27-non-negotiables-audit.md](../../docs/audits/2026-05-27-non-negotiables-audit.md) and the 2026-05-27 chat audit captured the gaps; this spec defines how each is closed.

## Goal

After this spec lands, every interactive element on the profile tab does what it implies:

1. **Learning goal** toggle persists to `public.users.learning_mode` (today: Zustand only — silently lost after sign-out / DB rehydrate).
2. **Reminders** row opens a daily-time picker that schedules a local notification via `expo-notifications`.
3. **Audio & pronunciation** row opens a sub-screen that controls TTS playback rate, auto-replay default, and exposes the existing "Open device TTS settings" path from [MODALS.md](MODALS.md) §6.9.
4. **Help & feedback** row opens a sub-screen with a `mailto:` contact, "Report a bug" prefill, version/build display, and links to privacy/terms (paths in §5).
5. **"Linguistic enthusiast"** subtitle is either removed or driven by data — no more hardcoded copy.

Read-only surfaces (streak chip, overall-progress band, two stat cards, avatar, sign-out) are already wired and out of scope.

## Out of scope (explicitly deferred)

| Item | Why deferred |
|---|---|
| Editing display name from profile | Onboarding sets it once; rename is a separate spec. Audit confirms `setDisplayName` exists in store but no UI surfaces it. |
| Multiple daily reminder times | Single-time MVP is enough — `Toasts.reminderSet(time)` already implies one time. Multi-time can extend the schema later. |
| Voice selection (kn-IN voice picker) | Device-level. Spec defers to the existing `Linking.openSettings()` path in [MODALS](MODALS.md) §6.9. |
| In-app feedback form (vs. mailto) | Requires a Supabase `feedback` table + moderation flow. MVP uses `mailto:` so it ships without backend work. |
| Push notifications (server-sent) | Local notifications only. Server push needs APNs/FCM credentials + EAS Build profile changes — outside the audit-flagged EAS gap from [audit §2.6](../../docs/audits/2026-05-27-non-negotiables-audit.md). |
| Removing/reshaping the voice-system `mode` field on `useUserStore` | Owned by [CONTRADICTIONS](../../docs/foundation/CONTRADICTIONS.md) C3. Do not touch in this spec. |

## Architecture rules (non-negotiables)

1. **Server-first for user-scoped prefs.** Anything that lives on `public.users` (learning_mode, reminder_time, tts_rate, etc.) writes to Supabase first, then mirrors into `useUserStore` on success. On failure, surface a toast and do not flip the UI. Mirrors [spec_progress_persistence.md](spec_progress_persistence.md) §Architecture rule 3.
2. **Device-only prefs stay in `useUserStore`** without a DB round-trip. Examples in this spec: `hasSeenTtsWarning` (already exists), `permissionDenials` (already exists). New device-only fields are flagged below.
3. **Permissions follow [MODALS](MODALS.md) §6.8.** Always show the in-app PermissionDialog before the system prompt. If the user denies, write to `permissionDenials.notifications` and re-ask at most once per week.
4. **One screen per file in `app/`.** New sub-screens go in `app/settings/<name>.tsx` (a new folder — flagged for owner sign-off below since CLAUDE.md says "Do not create new top-level folders without asking"). Stack navigation handled by Expo Router default; no custom header.
5. **No new state library.** TanStack Query for server reads/writes; Zustand for device-only prefs. Time pickers use the standard RN `DateTimePicker` (already a transitive dep via Expo SDK 54, not Expo Notifications).
6. **No raw pixels.** Every numeric layout value goes through `moderateScale()` per [CLAUDE.md](../../.claude/CLAUDE.md). Inline styles + tokens from `constants/*.ts`. No StyleSheet, no NativeWind.

## Decision summary

| Topic | Decision | Tag |
|---|---|---|
| Learning goal persists to `public.users.learning_mode` on every toggle | Yes — service write first, store mirror on success | `[LOCKED]` |
| Add `daily_reminder_time text` column to `public.users` | Yes — `'HH:MM'` 24h, nullable | `[LOCKED]` |
| Reminder model: single daily local notification | Yes for MVP | `[LOCKED]` |
| Add `tts_rate numeric(3,2)` column to `public.users` (0.50–1.50) | Yes — default `1.00` | `[LOCKED]` |
| Add `auto_replay boolean` column to `public.users` (default `true`) | Yes | `[LOCKED]` |
| Help & feedback uses `mailto:` rather than in-app form | Yes for MVP | `[LOCKED]` |
| New `app/settings/` folder under Expo Router | Proposed — needs owner sign-off | `[OPEN]` |
| "Linguistic enthusiast" subtitle | Remove, OR replace with goal-derived ("Spoken-only learner" / "Fluency learner") | `[OPEN]` |
| Multiple reminder times per day | No (deferred, see Out of scope) | `[LOCKED]` |
| Voice selection inside the app | No — defer to device TTS settings | `[LOCKED]` |
| Adding `expo-notifications` dep + iOS permission strings | Required for §3; touches `app.json` and lockfile — explicit owner sign-off required per CLAUDE.md | `[OPEN]` |

## 1. Learning goal — DB sync

`[LOCKED]`

### Data model

No schema change — `public.users.learning_mode` already exists (`'spoken' | 'written' | 'both'`).

### Service

Add to [services/api/users.ts](../../services/api/users.ts):

```ts
export async function updateLearningMode(
  userId: string,
  mode: LearningMode,
): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({ learning_mode: mode })
    .eq('id', userId)
    .select('id, email, name, avatar_url, learning_mode, motivations, daily_goal_minutes, current_streak, onboarding_completed_at, created_at')
    .single();
  if (error) throw error;
  return data as UserRow;
}
```

### UI behavior

[app/(tabs)/profile.tsx](../../app/(tabs)/profile.tsx) `handleGoalChange`:

1. Capture previous value.
2. Optimistically `setLearningMode(next)` in Zustand.
3. Call `updateLearningMode(userId, next)`.
4. On error: revert store to previous value, fire `Toasts.networkOffline()` (or a new `Toasts.preferenceSaveFailed()` — see §6 toast additions). Do **not** leave a stale optimistic value behind.
5. On success: leave the store as-is. No toast — the visual state change is feedback enough.

### `useFluencyMode()` selector

Per [STATE.md](../../docs/foundation/STATE.md) inline TODO: extract the `storeToGoal`/`goalToStore` collapse into `hooks/useFluencyMode.ts`. The profile screen consumes it; the onboarding goal screen continues to write the full `'spoken' | 'both'` value (it never wrote `'written'`).

### Acceptance

- Toggle between Spoken / Fluency → Supabase `users.learning_mode` updates within 500ms (verify via Supabase dashboard).
- Kill app → reopen → toggle survives.
- Sign out → sign in → store rehydrates from DB with the persisted value.
- Network off → toggle reverts within 2s + error toast fires.

## 2. "Linguistic enthusiast" subtitle

`[OPEN]` — pick one:

| Option | Outcome |
|---|---|
| **A** | Remove the line entirely. Less noise; avatar + name carry the header. |
| **B** | Replace with goal-derived text: `'spoken'` → `"Spoken-only learner"`, `'both' \| 'written'` → `"Fluency learner"`, `null` → omit. |
| **C** | Replace with streak/progress-derived text: `"Day-N streak · X% complete"`. Adds a useful surface but duplicates info already in the band + chip below. |

Default if owner picks no option: **A (remove)**. Cheapest, lowest semantic debt.

## 3. Reminders

### Schema

Migration `2026-MM-DD_profile_settings.sql`:

```sql
alter table public.users
  add column if not exists daily_reminder_time text;
-- Format: 'HH:MM' 24h. Null = no reminder scheduled.
-- Validated client-side. No CHECK constraint because RN time picker output is trusted.
```

### Service

[services/api/users.ts](../../services/api/users.ts) — `updateDailyReminderTime(userId, time | null)` mirrors `updateLearningMode`.

### Notifications

`[OPEN]` — adding `expo-notifications` to [package.json](../../package.json) needs owner sign-off (CLAUDE.md "After any dependency change, run the app to verify it still builds"). It also requires:

- `app.json` `ios.infoPlist.NSUserNotificationsUsageDescription` (Expo SDK 54 pattern).
- `app.json` `android.useNextNotificationsApi: true` and a `notifications` plugin block.
- iOS background mode: not required for local notifications.

Once the dep lands, scheduling lives in a new helper `lib/reminders.ts`:

```ts
import * as Notifications from 'expo-notifications';

const REMINDER_ID = 'kannada-baa-daily-reminder';

export async function scheduleDailyReminder(time: string /* 'HH:MM' */) {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'ಕನ್ನಡ ಬಾ',
      body: 'Time for today\'s lesson.',
    },
    trigger: { hour, minute, repeats: true },
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
}
```

The OS-level schedule is the source of truth for the actual fire time; DB stores the user's selected `HH:MM` so the schedule can be re-created on a new install / device.

### UI — `app/settings/reminders.tsx`

`[LOCKED]` shape:

| Element | Behavior |
|---|---|
| Header | Standard Expo Router header (`title: 'Reminders'`). Back chevron returns to profile. |
| Toggle row | "Daily lesson reminder" switch. Off by default if `daily_reminder_time` is null. |
| Time row | When toggle is on: shows the current time, tap opens `DateTimePicker` (mode `time`). Hidden when toggle is off. |
| Caption | "We'll send one nudge a day. Tap the time to change it." |

### Flow

1. User taps switch ON → run [MODALS](MODALS.md) §6.8 PermissionDialog for `notifications`.
2. On grant → set default time `19:00` if `daily_reminder_time` is null → write DB → schedule → fire `Toasts.reminderSet('7:00 PM')`.
3. On deny → record `permissionDenials.notifications` → fire `Toasts.notificationsDenied()` (already exists in catalog) → leave switch off.
4. User changes time → write DB → re-schedule → fire `Toasts.reminderSet(newTime)`.
5. User taps switch OFF → null DB column → cancel schedule → no toast.

### Display format

Render to user with `Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })`. Persist as `'HH:MM'` 24h. Convert at boundaries only.

### Acceptance

- Foreground → set time → see the system notification fire at the chosen time on a real device.
- Background → notification still fires (local notifications survive backgrounding).
- Reinstall app → restore from DB on sign-in → schedule is re-created in `app/_layout.tsx` boot path (add a one-shot re-arm on login).
- Deny permission → toast with deep-link to system settings.

## 4. Audio & pronunciation

### Schema

```sql
alter table public.users
  add column if not exists tts_rate numeric(3,2) not null default 1.00,
  add column if not exists auto_replay boolean not null default true;
-- tts_rate clamped 0.50..1.50 client-side. No CHECK constraint to avoid blocking future bounds changes.
```

### Store additions

[stores/useUserStore.ts](../../stores/useUserStore.ts):

| Field | Type | Default | Persisted |
|---|---|---|---|
| `ttsRate` | `number` | `1.0` | Yes (mirrors DB) |
| `autoReplay` | `boolean` | `true` | Yes (mirrors DB) |

Add `hydrateFromUserRow` mapping for both columns.

### UI — `app/settings/audio.tsx`

`[LOCKED]` shape:

| Element | Behavior |
|---|---|
| Section: Playback | |
| Speed segmented control | Three buttons: `0.75x` / `1.0x` / `1.25x`. Selected one carries the [DESIGN.md](../../docs/foundation/DESIGN.md) `secondaryContainer` treatment from the existing `GoalOption`. |
| "Try it" button | Speaks "ನಮಸ್ಕಾರ" (`namaskāra`) at the currently selected rate. Uses the existing TTS helper. |
| Section: Auto-replay | |
| Toggle row | "Auto-replay audio on lesson cards" — controls whether Phrase/Drill cards auto-speak on mount. Hook into wherever lesson cards currently trigger TTS. |
| Section: Device voice | |
| Row | "Open device TTS settings" → opens the existing [MODALS](MODALS.md) §6.9 `TTSUnavailableDialog` flow (reuse — same `Linking.openSettings()` path). Caption: "Install or change the Kannada (kn-IN) voice from system settings." |

`[OPEN]` Decisions on the speed control:
- **A.** Three discrete steps as above (cleanest).
- **B.** Five steps (`0.5x / 0.75x / 1.0x / 1.25x / 1.5x`).
- **C.** Continuous slider.

Default if owner picks no option: **A**. Discrete steps avoid the "what does 0.83x mean?" problem; covers the 80% case.

### Wiring `autoReplay` into lesson cards

`[OPEN]` — needs a survey of every TTS call site before locking. Candidate sites (verify before implementing):

- [components/lesson/](../../components/lesson/) Phrase phase auto-speak (referenced in [spec_lesson_redesign.md](spec_lesson_redesign.md)).
- Drill phase auto-speak on prompt show.

The change: each call site reads `useUserStore((s) => s.autoReplay)`. When `false`, the manual "speak" button still works; the auto-trigger on mount is suppressed.

### Acceptance

- Change speed → tap "Try it" → audio is audibly slower/faster.
- Change speed → start a lesson → phrase audio plays at the new rate.
- Toggle auto-replay off → start a lesson → first card shows but does not auto-speak; manual speak button still works.
- Both prefs survive sign-out/sign-in via DB.

## 5. Help & feedback

### UI — `app/settings/help.tsx`

`[LOCKED]` shape:

| Element | Behavior |
|---|---|
| Section: Contact | |
| Row "Contact us" | `Linking.openURL('mailto:hello@kannadabaa.app?subject=Kannada%20Baa%20support')`. **Address `[OPEN]` — owner picks the canonical support address.** |
| Row "Report a bug" | `mailto:` with prefilled subject `"Bug report — Kannada Baa"` and body containing `Build: ${Application.nativeBuildVersion}\nVersion: ${Application.nativeApplicationVersion}\nDevice: ${Device.modelName}\n\n---\n\n[describe what happened]`. Pulls `expo-application` + `expo-device` (already transitive via Expo SDK). |
| Section: About | |
| Row "Version" | `Application.nativeApplicationVersion` ` · ` `Application.nativeBuildVersion`. Non-tappable. |
| Row "Privacy policy" | `Linking.openURL(...)`. **URL `[OPEN]` — owner provides.** |
| Row "Terms of service" | `Linking.openURL(...)`. **URL `[OPEN]` — owner provides.** |

### Acceptance

- Tap "Contact us" → device mail composer opens with the address pre-filled.
- Tap "Report a bug" → composer opens with prefilled subject + body containing real version/build numbers.
- Tap a policy row with no URL set yet → row is hidden (do not ship dead links).

## 6. Toast catalog additions

[components/modals/instances/toastCatalog.ts](../../components/modals/instances/toastCatalog.ts):

```ts
preferenceSaveFailed() {
  Toast.show({
    kind: 'error',
    id: 'preference.saveFailed',
    title: "Couldn't save",
    subtitle: 'Check your connection and try again',
  });
},
```

Used by §1 (learning-goal revert), §3 (reminder save failure), §4 (audio save failure). Mirrors [MODALS](MODALS.md) §6.10 conventions. Add a row to that table in the same PR.

`reminderSet` and `notificationsDenied` already exist — no change.

## 7. Store + DB summary

### `useUserStore` changes

| Field | Type | Default | Action | Note |
|---|---|---|---|---|
| `ttsRate` | `number` | `1.0` | `setTtsRate(rate)` | Mirrors `public.users.tts_rate`. |
| `autoReplay` | `boolean` | `true` | `setAutoReplay(value)` | Mirrors `public.users.auto_replay`. |
| `dailyReminderTime` | `string \| null` | `null` | `setDailyReminderTime(time)` | Mirrors `public.users.daily_reminder_time`. `'HH:MM'` 24h. |

`hydrateFromUserRow` extended to populate all three. `resetForUser` and `reset` clear all three (they are user-scoped, not device-scoped).

[STATE.md](../../docs/foundation/STATE.md) table updated in the same PR.

### `public.users` columns added

```sql
alter table public.users
  add column if not exists daily_reminder_time text,
  add column if not exists tts_rate numeric(3,2) not null default 1.00,
  add column if not exists auto_replay boolean not null default true;
```

RLS: already enforced on `public.users` (`auth.uid() = id`). No new policies needed; existing `update own row` policy covers these columns.

### `UserRow` type

[services/api/users.ts](../../services/api/users.ts) `UserRow` extended; `fetchUserRow` and `completeOnboarding` select-lists updated to include the three new columns.

## 8. Navigation

`[OPEN]` — owner sign-off needed before creating `app/settings/`. CLAUDE.md says "Do not create new top-level folders without asking." Alternatives:

- **A.** `app/settings/reminders.tsx`, `app/settings/audio.tsx`, `app/settings/help.tsx`. Three new files in a new folder.
- **B.** Sibling files: `app/reminders.tsx`, `app/audio.tsx`, `app/help.tsx`. Avoids the new folder but pollutes the root route namespace.
- **C.** Modal sheets (BottomSheet) instead of routes. Lighter-weight; fits the existing modal catalog. But picker → sheet → list is awkward to back-navigate.

Default if owner picks no option: **A**. The three screens are clearly grouped and `app/` already has `app/onboarding/` and `app/heritage/` as feature-folder precedents — `settings/` matches the pattern.

[NAVIGATION.md](../../docs/foundation/NAVIGATION.md) route table gets one new row per screen. Auth gate unchanged (settings screens are post-auth).

## 9. Tests

| Layer | Test |
|---|---|
| `lib/reminders.ts` | Schedules with correct trigger time; cancels by id; no duplicates when re-scheduled. Mock `expo-notifications`. |
| `services/api/users.ts` | `updateLearningMode` / `updateDailyReminderTime` / `updateTtsRate` / `updateAutoReplay` hit the right table+columns. Mock Supabase. |
| `app/(tabs)/profile.tsx` | Learning-goal toggle: optimistic update + revert on service failure. |
| `useFluencyMode` | `'spoken'` → `'spoken'`; `'written'` / `'both'` → `'fluency'`; `null` → `null`. |

Visual tests deferred per [CLAUDE.md](../../.claude/CLAUDE.md) Testing section ("Do not write tests that just snapshot entire screens").

## 10. PR breakdown

Three PRs against `settings-profile-changes`.

### PR1 — schema + service + learning-goal wire-up

- Migration: `daily_reminder_time`, `tts_rate`, `auto_replay` columns.
- [services/api/users.ts](../../services/api/users.ts): add 4 update fns + extend `UserRow`.
- [stores/useUserStore.ts](../../stores/useUserStore.ts): add 3 fields + setters + extend `hydrateFromUserRow` / `reset` / `resetForUser`.
- `hooks/useFluencyMode.ts` extracted.
- [app/(tabs)/profile.tsx](../../app/(tabs)/profile.tsx): goal toggle now calls service with optimistic revert.
- `preferenceSaveFailed` toast added.
- [STATE.md](../../docs/foundation/STATE.md) updated.
- "Linguistic enthusiast" decision applied (default: remove).
- Settings row `onPress` handlers still no-op (rows greyed-out with a "Coming soon" caption to avoid the "tap → nothing" UX during the rollout).

**Out:** notifications, audio screen, help screen.

### PR2 — Reminders

- `expo-notifications` dep + `app.json` config (owner-approved).
- `lib/reminders.ts`.
- `app/settings/reminders.tsx`.
- Profile row wires up to `router.push('/settings/reminders')`.
- Boot path in `app/_layout.tsx` re-arms the schedule on sign-in if `daily_reminder_time` is non-null and permission is granted.

### PR3 — Audio + Help

- `app/settings/audio.tsx` + auto-replay wiring across lesson card call sites (survey first, lock the list of sites in PR3 description).
- `app/settings/help.tsx`.
- Profile rows wire up.
- "Coming soon" placeholder removed.

## 11. Cross-spec impact

| Spec | Update |
|---|---|
| [STATE.md](../../docs/foundation/STATE.md) §useUserStore | Add 3 new fields + 3 actions to the table. Resolve the inline `useFluencyMode` TODO. |
| [NAVIGATION.md](../../docs/foundation/NAVIGATION.md) | Add `/settings/reminders`, `/settings/audio`, `/settings/help` rows. |
| [MODALS.md](MODALS.md) §6.10 | Add `preference.saveFailed` row to the toast table. |
| [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) | Close the implicit settings-rows gap (no entry exists today; do not retroactively log one — open one only if PR1 lands with the "Coming soon" intermediate state visible to real users for >1 release). |

No conflicts with [CONTRADICTIONS](../../docs/foundation/CONTRADICTIONS.md) C3 (rowdy/classic removal) — this spec does not touch `mode`. C7 (`fill_blank`) is unrelated.

## 12. Open questions (owner sign-off needed before PR1)

1. "Linguistic enthusiast" subtitle — §2 A/B/C.
2. `app/settings/` folder — §8 A/B/C.
3. Speed control shape — §4 A/B/C.
4. `auto_replay` call-site list — §4 (verify before PR3).
5. `expo-notifications` dep + `app.json` permission strings — §3 owner sign-off.
6. Support email address — §5 row "Contact us".
7. Privacy / Terms URLs — §5 About section.

All other decisions in §Decision summary are `[LOCKED]` and may proceed once the above are resolved.
