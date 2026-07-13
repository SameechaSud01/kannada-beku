# spec_onboarding_reminder_step

**Status:** APPROVED 2026-07-09 — owner signed off on the J1 amendment (§7); implemented on `feature/notification-system`
**Amended 2026-07-13 (owner-directed):** the screen body changed from preset time chips to a 3-column spin wheel (hour · minute · AM/PM, quarter-hour minutes) with copy "What time suits you?" / "Remind me" / "Not now". See §4. The opt-in flow, storage, and wiring (§4 flow, §5–§7) are unchanged.
**Owner:** samee
**Created:** 2026-07-09
**Related:** [spec_profile_settings_wiring.md](spec_profile_settings_wiring.md) §3 · [spec_onboarding_audit_fixes.md](spec_onboarding_audit_fixes.md) · [NAVIGATION.md](../../docs/foundation/NAVIGATION.md) (J1, route table) · [STATE.md](../../docs/foundation/STATE.md)

---

## 1. Problem

The daily-reminder feature is fully built but lives **only** in Profile → Reminders, and reminders are **off by default**. There is no mention of reminders anywhere in onboarding or auth (verified: zero `notification`/`reminder` references in `app/onboarding/` or `app/(auth)/`). Result: most users never discover it, so they never set a nudge, so retention suffers.

**Goal:** ask the user to set a daily reminder **once, during onboarding**, at the natural moment right after they commit to a daily-minutes goal — reusing the existing, already-`[LOCKED]` reminder mechanism. Skippable, never blocking.

## 2. What this is NOT (re-used, not re-decided)

This spec adds **one onboarding screen** and its wiring. It does **not** re-open any of the following, all already `[LOCKED]` in [spec_profile_settings_wiring.md](spec_profile_settings_wiring.md) §3 and shipped:

- Reminder model = single daily local notification (`expo-notifications`). `[LOCKED]`
- `public.users.daily_reminder_time` (`'HH:MM'` 24h, nullable). `[LOCKED]`
- Permission UX = in-app `PermissionDialog` **before** the OS prompt; on deny, record `permissionDenials.notifications` and re-ask ≤ once/week. `[LOCKED]` (MODALS §6.8)
- Scheduling helper [lib/reminders.ts](../../lib/reminders.ts) (`scheduleDailyReminder` / `cancelDailyReminder` / permission helpers).
- Boot/sign-in re-arm in [app/_layout.tsx](../../app/_layout.tsx) (re-schedules if `daily_reminder_time` set + permission granted).
- Server-first write via `updateDailyReminderTime()` in [services/api/users.ts](../../services/api/users.ts).

**No new dependency, no new store field, no `app.json` change** — `expo-notifications` is already installed and configured. This spec is purely an additional entry point.

## 3. Placement in the flow

**Decision (owner-confirmed 2026-07-09): after Commitment, before the Greeting/Basics wrap-up.** The reminder becomes intake **step 4/4**.

Actual current onboarding order (code, not the stale NAVIGATION table — see §7 note):

```
welcome → name (1/3) → motivation (2/3) → commitment (3/3) → greeting → basics → /(tabs)
```

New order:

```
welcome → name (1/4) → motivation (2/4) → commitment (3/4) → reminder (4/4) → greeting → basics → /(tabs)
                                                              ^^^^^^^^^^^^^^ new
```

**Why here, not after Basics:** the ask reads naturally off the just-made commitment ("you want 10 min/day — want a nudge?"), and it keeps `basics` as the `[LOCKED]` final step where `setOnboarding()` fires (STATE.md). The `greeting` screen (which echoes the user's plan chips) stays the celebratory beat and can optionally add a "nudge at 7:00 PM" chip when a reminder was set.

## 4. The screen — `app/onboarding/reminder.tsx`

**Ask style (owner-confirmed): soft in-app screen first.** No OS prompt until the user opts in.

Reuse [IntakeStepShell](../../components/onboarding/IntakeStepShell.tsx) exactly like Commitment does, so the chrome (segmented progress bar, Back/Continue footer, Skip affordance) is identical and free:

| Shell prop | Value | Behavior |
|---|---|---|
| `step` | `4` | Requires bumping `INTAKE_STEP_COUNT` 3 → 4 (see §5). |
| `title` | "What time suits you?" | Baloo, per shell. *(Amended 2026-07-13.)* |
| `subtitle` | "Set a time to practice. One short nudge a day, and you can change it or turn it off whenever." | *(Amended 2026-07-13.)* |
| `onSkip` | `proceed()` — **"Not now"** | No permission ask, no schedule. Advances to `greeting`. |
| `onContinue` | `handleSetReminder()` — **"Remind me"** | Runs the opt-in flow below, then advances. |
| `onBack` | `router.back()` | Returns to Commitment; nothing committed yet. |

**Body (amended 2026-07-13, owner-directed — replaces the preset chips):** a custom 3-column spin wheel — hour `1–12`, minute `00/15/30/45`, `AM/PM` — built from snap-scrolling `ScrollView` columns (no native `DateTimePicker`, no new dependency). The selected row sits in a gold highlight band; a "Spin to set your time" caption sits below. Default `'19:00'` (7 · 00 · PM); if a persisted `dailyReminderTime` exists it seeds the wheel, with the minute snapped to the nearest quarter-hour. Local `useState` holds the selection; it is converted back to `'HH:MM'` 24h on commit, so storage and the opt-in flow are untouched. *(Second amendment, same day: the wheel was extracted to `components/ui/TimeWheelPicker.tsx` and applied app-wide — Profile → Reminders now uses it too, replacing the native `DateTimePicker` + quick-pick chips there; see spec_profile_settings_wiring.md §Architecture rules 5.)*

**`handleSetReminder()` — the opt-in flow (mirrors `RemindersSheet.applyTime()`):**

1. If `hasNotificationPermission()` already granted → `updateDailyReminderTime(userId, time)` (server-first) → mirror to store → `scheduleDailyReminder(time)` → `Toasts.reminderSet(time)` → `proceed()`.
2. Else show `PermissionDialog` (`kind: 'notifications'`):
   - **Allow** → `requestNotificationPermission()`:
     - granted → same as (1).
     - denied → `recordPermissionDenial('notifications')` → `Toasts.notificationsDenied()` → `proceed()` **(still advance — never trap the user in onboarding)**.
   - **Not now** → `recordPermissionDenial('notifications')` → `proceed()`.
3. Any server-write failure → `Toasts.preferenceSaveFailed()`, roll back the optimistic store write, but **still `proceed()`** (reminder is a nice-to-have; do not block onboarding on a network hiccup).

`proceed()` = `router.push('/onboarding/greeting')`.

**Reuse note:** the opt-in logic in `RemindersSheet.applyTime()`/`persistTime()` should be extracted into a small shared helper (e.g. `lib/reminders.ts` gains `enableDailyReminder(userId, time)` returning a result) so onboarding and the sheet don't duplicate the permission→persist→schedule sequence. Surgical: only extract, don't change the sheet's behavior.

## 5. Wiring changes (exhaustive)

| File | Change |
|---|---|
| `app/onboarding/reminder.tsx` | **New** screen (§4). |
| [app/onboarding/commitment.tsx](../../app/onboarding/commitment.tsx) | `proceed()` pushes `/onboarding/reminder` instead of `/onboarding/greeting`. |
| [app/onboarding/_layout.tsx](../../app/onboarding/_layout.tsx) | Register `reminder` in the onboarding stack (same `slide_from_right`, `headerShown:false`). |
| [components/onboarding/IntakeStepShell.tsx](../../components/onboarding/IntakeStepShell.tsx) | `INTAKE_STEP_COUNT` 3 → 4 (progress bar segments). Verify Name/Motivation/Commitment still read correctly as 1–3 of 4. |
| [lib/reminders.ts](../../lib/reminders.ts) | Add extracted `enableDailyReminder(userId, time)` helper (§4 reuse note). |
| [app/onboarding/greeting.tsx](../../app/onboarding/greeting.tsx) | *(Optional)* add a reminder chip to the plan chips when `dailyReminderTime` is set. |

No changes to: stores (fields already exist), `services/api/users.ts` (function exists), `app.json`, `package.json`, DB schema, boot re-arm.

## 6. Acceptance criteria

1. Fresh sign-up reaches a **Reminder step as 4/4** between Commitment and Greeting; progress bar shows 4 segments.
2. **"Maybe later" (Skip)** advances to Greeting with **no** OS prompt, **no** schedule, `daily_reminder_time` stays null.
3. **"Set reminder" with permission not-yet-granted** shows the in-app `PermissionDialog` before the OS prompt.
4. **Allow → grant:** `daily_reminder_time` is written to Supabase and mirrored to the store, a daily notification is scheduled at the chosen time, `Toasts.reminderSet` fires, flow advances.
5. **Allow → deny** (or **Not now**): `permissionDenials.notifications` is recorded, flow still advances, no schedule.
6. **Back** from the reminder step returns to Commitment with nothing committed.
7. A user who set a reminder in onboarding, on reinstall/new device, has it re-armed by the existing boot path — **no regression** to `app/_layout.tsx` behavior.
8. Profile → Reminders still works unchanged and reflects the onboarding choice.
9. `INTAKE_STEP_COUNT` change does not visually break Name/Motivation/Commitment on iPhone SE (screenshot each per CLAUDE.md workflow).

## 7. `[LOCKED]` amendments — REQUIRE OWNER SIGN-OFF

This spec cannot be implemented until the owner signs off on amending these locked items:

- **NAVIGATION.md → J1 (First-time sign-up)** `[LOCKED]`: insert the reminder step into the enumerated sequence. *(J1 currently reads `Welcome → Name → Goal → Motivation → Commitment → Basics`; the live code differs — see doc-drift note below — which should be reconciled in the same edit.)*
- **NAVIGATION.md → Route table** `[LOCKED]`: add a `/onboarding/reminder` row.
- **STATE.md**: no store-shape change, but the onboarding-completion narrative should note the reminder step; `dailyReminderTime` / `permissionDenials` fields are unchanged.

**Doc-drift observed (flag, not silently fixing):** NAVIGATION.md's route table and J1 list `goal.tsx` (step 2/4) and omit `greeting.tsx`, but the live onboarding is `welcome → name → motivation → commitment → greeting → basics` with a 3-segment bar. This predates this spec. Recommend logging it in [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) and reconciling when J1 is amended, rather than editing a `[LOCKED]` section as a side effect here.

## 8. Out of scope / flagged

- **Foreground presentation + tap-to-navigate on the delivered notification.** There is currently **no** `Notifications.setNotificationHandler` and no response listener anywhere in the app, so when the reminder fires in-foreground or is tapped, behavior is OS-default (no deep-link into today's lesson). Driving more users to enable reminders makes this matter more, but it's a **pre-existing gap** — flagged for a separate spec, not fixed here (keeps this change surgical).
- ~~Custom (non-preset) time inside onboarding — presets only; full picker stays in Profile.~~ *(Superseded 2026-07-13: the shared TimeWheelPicker allows any quarter-hour time, everywhere. Arbitrary-minute times are no longer settable anywhere in the UI; an existing odd-minute `daily_reminder_time` keeps working but snaps to the nearest quarter the next time it's edited.)*
- Multiple reminder times, server push — already `[LOCKED]` out in spec_profile_settings_wiring.md.

## 9. Manual test (after implementation)

Per CLAUDE.md, reminders can't be fully verified in-sim (real device needed for the notification to fire). Verify on device: complete onboarding, set a reminder for ~2 min out, background the app, confirm it fires. Also verify the Skip path and the deny path in-sim via screenshots.
