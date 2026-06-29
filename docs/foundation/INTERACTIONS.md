---
doc: INTERACTIONS
status: reviewed
owner: samee
last-reviewed: 2026-05-19
related:
  - DESIGN.md
  - CONTENT.md
  - NAVIGATION.md
---

# Interactions

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Owns: animation vocabulary, gestures, haptics, sound cues, and the canonical loading / error / empty / success state designs.

## Animation library

`[PROPOSED]` — decided in [spec_game_polish.md](../../spec_docs/Sameecha/spec_game_polish.md) §1, pending promotion to `[LOCKED]`.

Current and chosen: **React Native `Animated`** (built-in), plus **`PanResponder`** (built-in) for the gesture games (Image Match draw-a-thread, Dictation tile drag). `react-native-reanimated` v4 stays installed but unused. **Why:** every game already uses `Animated`; staying on it is the low-risk choice and `PanResponder` covers the drag interactions without adopting Reanimated.

## Animation vocabulary

Standard animations used across the app. **If you need a new motion, add it here first.**

### Screen entry — fade + slide-up

`[LOCKED]` — matches all four tab screens.

- Pattern: opacity 0→1 in 220 ms, `translateY` 4→0 in 220 ms, parallel.
- Used in all four tab screens ([home](../../app/%28tabs%29/index.tsx), [learn](../../app/%28tabs%29/learn.tsx), [practice](../../app/%28tabs%29/practice.tsx), [profile](../../app/%28tabs%29/profile.tsx)).
- **Why:** subtle "settle in" cue; doesn't compete with content.

### Phrase advance — fade in

`[LOCKED]`

- Pattern: opacity 0→1 in 240 ms.
- Used in [IntakePhase.tsx](../../components/lesson/IntakePhase.tsx) when phrase index changes.

### Wrong answer — shake

`[LOCKED]`

- Pattern: `translateX` sequence `6 → -6 → 4 → 0`, each step 50 ms (total 200 ms).
- Used in [ListenPickItem.tsx](../../components/lesson/drill/ListenPickItem.tsx).
- **Why:** corporeal "no" — clearer than red flash; doesn't pre-empt the user reading their mistake.

### Pressed state — scale

`[LOCKED]`

- Pattern: `scale: 0.97` on press, returns to `1.0` on release.
- Used in [OptionCard.tsx](../../components/onboarding/OptionCard.tsx).

> **TODO:** Page transitions between routes — currently Expo Router defaults. Onboarding uses `slide_from_right`. Document whether lesson runner uses modal-style up-slide or push.

## Gestures

`[LOCKED]` — current state. Future drill drag is `[OPEN]`.

- Swipe-to-go-back: Expo Router default (iOS).
- No custom `PanGesture` / `TapGesture` (Reanimated / GH) usage.

> **Game drag** `[PROPOSED]` — [spec_game_polish.md](../../spec_docs/Sameecha/spec_game_polish.md) §1 permits `PanResponder` (RN built-in) for drag interactions: Image Match draw-a-thread ([spec_imagematch_board_redesign.md](../../spec_docs/Sameecha/spec_imagematch_board_redesign.md) §6) and Dictation tile drag ([spec_dictation_syllable_builder.md](../../spec_docs/Sameecha/spec_dictation_syllable_builder.md) §2). Not Reanimated/GH.

## Haptics

`[PROPOSED]` — shipped in the games per [spec_game_polish.md](../../spec_docs/Sameecha/spec_game_polish.md) §3, pending promotion to `[LOCKED]`. `expo-haptics` added as a dependency; a guarded wrapper lives at `src/games/shared/haptics.ts`.

| Moment | Haptic | Why |
|---|---|---|
| Correct answer / match | `selectionAsync` (light) | confirms input registered |
| Wrong answer / mismatch / timeout | `notificationAsync(Error)` | corporeal "no" pairs with shake |
| Round complete (result) | `notificationAsync(Success)` | satisfying capstone |

> **TODO (still open):** lesson-complete + streak-milestone + CTA-press haptics outside the games are not yet wired — extend the wrapper when those moments adopt haptics.

## Sound cues

`[LOCKED]` — current content-audio usage. UI SFX `[OPEN]`.

Current usage is **content audio only** — TTS playback of Kannada phrases via [deviceTtsAudioService.ts](../../services/audio/deviceTtsAudioService.ts). No UI sound effects (correct/wrong dings, button taps, etc.).

| Where | What plays |
|---|---|
| Lesson intake | Auto-play TTS on phrase mount; "Replay" button |
| Lesson drill (`listen_pick`) | Auto-play TTS on item mount; "Replay" button |
| Emergency phrase | TTS on tap |
| Dictation game | TTS on round start |

> **TODO:** Decide whether to ship UI SFX in MVP.
> Risk: cliché edu-app feel ("ding!"). Reward: warmth, instant feedback. Proposal: skip UI SFX in v1; revisit post-MVP if user research signals it.

## UI states — canonical designs

Every screen renders four possible states. The defaults below are the contract.

### Loading

`[LOCKED]` — current pattern.

- **Default:** disable interactive controls; opacity 0.7; replace primary CTA label with status text ("Please wait...", "Saving...").
- **Used in:** [login.tsx](../../app/%28auth%29/login.tsx) submission flow.
- **TODO:** Spinner inside CTA (per [.claude/CLAUDE.md](../.claude/CLAUDE.md) rules) is mandated but not consistently implemented. Audit.

### Error

`[LOCKED]` — current pattern. Toast/snackbar pattern `[PROPOSED]` per [MODALS](../../spec_docs/Sameecha/MODALS.md) §4.4 + §6.10 — shipped, pending promotion to `[LOCKED]`.

- **Toasts (shipped):** non-blocking error feedback via the `Toast` system. Catalog: [components/modals/instances/toastCatalog.ts](../../components/modals/instances/toastCatalog.ts). Wired today on login wrong-password (`Toasts.signInFailed`) and audio playback failure (`Toasts.audioFailed`). Bottom-anchored, sticky, lifts above keyboard.
- **Alert.alert fallbacks (legacy):** still used for missing-field validation on login + sign-up confirmation prompt. Migrate to toast over time.
- **Console-only:** background TTS auto-play failures in intake (intentional — not user-initiated).

> **TODO:** Replace remaining `Alert.alert` call sites with the toast system. Add `Toasts.networkOffline()` wiring when Supabase calls go online (not active today).

### Empty

`[LOCKED]` — matches current screens.

| Screen | Empty state |
|---|---|
| `/practice/[id]` | Card: "No lessons completed yet." |
| `/(tabs)/learn` | All future lessons rendered locked; "Finish a lesson to unlock the next one." |
| `/(tabs)/practice` | Game cards dimmed (opacity 0.5); banner: "Finish Lesson 1 to load content." |

### Success

`[OPEN]`

> **TODO:** No standardised success state today. `DoneCard` is the current lesson-complete moment but isn't reused.

**Shipped (modal scope):** success toasts via the catalog (`Toasts.signedOut`, `Toasts.reminderSet`, `Toasts.lessonSavedOffline`, `Toasts.modeUpdated`). Top-anchored pill, 3s auto-dismiss. See [MODALS](../../spec_docs/Sameecha/MODALS.md) §4.4.

## Named moments

Catalogued moments — each has its full animation + audio + haptic + copy spec.

### M1: Lesson complete (`DoneCard`)

`[LOCKED]` — copy hook. Visual/audio/haptic `[OPEN]`.

- **Visual:** TODO spec (currently a card with score breakdown).
- **Audio:** none (TODO consider).
- **Haptic:** none (TODO: `notification.success` if haptics ship).
- **Copy:** `useCopy('lessonComplete')`.

### M2: Wrong answer (drill)

`[LOCKED]` — shake animation + copy hook. Haptic `[OPEN]`.

- **Visual:** shake 200 ms ([ListenPickItem.tsx](../../components/lesson/drill/ListenPickItem.tsx)).
- **Audio:** none.
- **Haptic:** none (TODO: `notification.error`).
- **Copy:** `useCopy('wrongAnswer')`.

### M3: Correct answer (drill / game)

`[PROPOSED]` — specced in [spec_game_polish.md](../../spec_docs/Sameecha/spec_game_polish.md) §2, pending promotion to `[LOCKED]`.

- **Visual:** spring lift (`translateY -7px`, `scale 1.04`) + fade-in `Icons.correct` checkmark + shadow elevation 2→6; feedback banner "Correct!" / "On a roll!" at streak ≥3. (Source: `src/games/opposites/components/OptionButton.tsx`, generalized into `src/games/shared/`.)
- **Haptic:** `selectionAsync` (light) — see Haptics above.
- **Audio:** none (UI SFX still skipped).
- Applies to the games today; the lesson drill (`ListenPickItem`) may adopt it later.

### M4: Streak milestone (3, 7, 12, 30, 60, 100, 365 days)

`[PROPOSED]` — implemented per [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.6. Pending promotion to `[LOCKED]`.

- **Visual:** `StreakMilestoneTakeover` — full-screen slide-up (350ms), 220pt radial-gradient medallion with the streak number, per-milestone body copy in DM Sans bold (Lora retired, C15), static confetti.
- **Trigger:** `useProgressStore.streak` crosses into a milestone value during `completeLesson` + `updateStreak`. Detected in [components/lesson/DoneCard.tsx](../../components/lesson/DoneCard.tsx) by snapshotting `streak` before/after.
- **Milestones:** `3, 7, 12, 30, 60, 100, 365`. (Note: spec narrowed from the earlier `1, 3, 7, 30, 100` proposal.)
- **Audio / haptic:** none yet.
- **Copy:** per-milestone in `StreakMilestoneTakeover` source. **TODO:** migrate to `constants/copy.ts` as `streakMilestone.{n}` per MODALS spec.

### M5: First lesson unlock

`[OPEN]`

> **TODO:** Not implemented. Spec when added.

### M7: Daily-goal complete

`[PROPOSED]` — implemented per [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.7. Pending promotion to `[LOCKED]`.

- **Visual:** `GoalCompleteDialog` — centered dialog with 96pt SVG progress ring, "Today's {N} minutes" eyebrow, streak-strip chip, "I'm done" / "One more" actions.
- **Trigger:** first time per calendar day that `useProgressStore.todayMinutes` crosses `useUserStore.dailyGoalMinutes`. Detected in [components/lesson/DoneCard.tsx](../../components/lesson/DoneCard.tsx). Idempotent via `lastGoalCelebrationDate`.
- **Suppressed when** a streak milestone fires the same lesson — milestone wins.

### M6: Mode change (rowdy ↔ classic)

> **`[LOCKED: REMOVED]`** — no mode-change moment exists to spec. The two-tone (`classic` / `rowdy`) voice system itself is scheduled for deletion. Do not spec, prototype, or build a tone-shift cue. Cross-ref [CONTENT.md](CONTENT.md#voice-system) and [CONTRADICTIONS.md](CONTRADICTIONS.md) C3.

## Open questions

`[OPEN]`

- Reanimated or `Animated`? (Decision blocks game work.)
- Haptics in MVP — yes or no?
- UI SFX in MVP — yes or no?
- Toast / inline error pattern needed before MVP ships?
