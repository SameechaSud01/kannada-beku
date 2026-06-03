---
doc: spec_game_polish
status: proposed
owner: samee
last-reviewed: 2026-06-02
related:
  - ../../docs/foundation/INTERACTIONS.md
  - ../../docs/foundation/DESIGN.md
  - spec_imagematch_board_redesign.md
  - spec_conversations_runner.md
  - spec_dictation_syllable_builder.md
  - spec_quick_quiz_runner.md
---

# Game polish — shared feedback vocabulary, haptics, and reward

> **Decision layer.** `[LOCKED]` = decided, do not reopen. `[OPEN]` = undecided. `[PROPOSED]` = in
> this doc, pending owner sign-off; promote to `[LOCKED]` on approval.

Cross-cutting polish for all five games (`opposites`, `dictation`, `imagematch`, `conversations`,
`quickquiz`). Owner-approved (2026-06-02). Establishes a single shared feedback vocabulary so the
games stop feeling like a worksheet, adds haptics, and adds a generative reward on result screens.
The per-game **mechanic** redesigns live in their own specs (Image Match, Conversations, Dictation);
this doc owns the shared layer.

---

## 1. Scope

`[PROPOSED]`

Front-end only. No DB/schema/RPC/recording changes; the `[LOCKED]` `user_overall_progress` formula
is untouched. Adds one runtime dependency: **`expo-haptics`**.

Closes these `docs/foundation/INTERACTIONS.md` `[OPEN]` items (reflect there after sign-off):
- **Animation library** → **`Animated`** (RN built-in). Reanimated stays unused. `PanResponder`
  (RN built-in) is permitted for the gesture games. This is the conservative choice — every game
  already uses `Animated`.
- **M3 (correct answer)** → small celebration: spring lift + fade-in checkmark (see §2).
- **Haptics** → ship the map in §3.
- **Gestures** (drill drag) → permitted via `PanResponder` for Image Match / Dictation per their specs.
- **UI SFX** → **still skipped** (no sound), per the existing v1 proposal.

---

## 2. Shared feedback vocabulary

`[PROPOSED]` Implemented once in `src/games/shared/` and reused by every game.

| Element | Spec | Source of truth |
|---|---|---|
| **Correct/reveal lift** | spring `translateY -7px` + `scale 1.04`, damping 15 / stiffness 180; fade-in `Icons.correct` checkmark (scale 0.6→1, 180ms); shadow elevation 2→6. | extracted verbatim from `src/games/opposites/components/OptionButton.tsx` |
| **Wrong shake** | `[LOCKED]` 4-step `translateX 6/-6/4/0`, 50ms each. | `useShake` hook |
| **Feedback banner** | pill, icon + "Correct!" / "Correct! On a roll!" (streak ≥3) / "Wrong!". `streak`/`hintUsed` optional. | generalized from `opposites/components/FeedbackBanner.tsx` |
| **Advance fade-in** | opacity 0→1 in 240ms on question/turn change. | matches `[LOCKED]` phrase-advance fade |
| **Result entrance** | mount: scale 0.9→1 + fade-in spring. | shared result wrapper |
| **Streak** | consecutive-correct counter + best-streak; resets on wrong. | `useStreak` hook (mirrors `opposites/hooks/useGameState.ts`) |

All sizes via `moderateScale`; all colors from `Colors`; all symbols from `constants/icons.ts`
(no emoji, no new icons). Icons used: `correct`, `wrong`, `streak`, `sparkle`, `clock`,
`gameConversations`.

---

## 3. Haptics map

`[PROPOSED]` Thin guarded wrapper `src/games/shared/haptics.ts` over `expo-haptics`
(safe no-op if the module/platform is unavailable). Single choke point; one-line calls at sites.

| Moment | Haptic |
|---|---|
| Correct answer / correct match | `selectionAsync` (light) |
| Wrong answer / mismatch / timeout | `notificationAsync(Error)` |
| Round complete (result mount) | `notificationAsync(Success)` |

---

## 4. Reward — self-drawing rangoli

`[PROPOSED]` `src/games/shared/Rangoli.tsx` — a **generative** kolam/mandala drawn with
`react-native-svg` (already installed, `15.12.1`), strokes animated in via `Animated`
`strokeDashoffset`. Ring/petal count scales with `score / total`. Fill colors from the
mandala tokens (`Colors.secondary` / `Colors.secondaryFixed`). **No image assets** — purely
generated. Embedded in every game's `ResultScreen`. Not an icon (illustration), so outside the
icon-map rule per DESIGN §Icons rule 4.

---

## 5. Per-game application

`[PROPOSED]`
- **All:** correct lift+checkmark, shared `FeedbackBanner`, advance fade-in, result entrance +
  Rangoli, haptics at correct/wrong/complete.
- **Quick Quiz:** add `useStreak` (banner "On a roll!", best-streak on result). Timer unchanged.
- **Opposites:** refactor `OptionButton.tsx` onto the shared `useShake`/`useCorrectLift` hooks
  (no behavior change) + haptics. Mechanics unchanged — Opposites is the reference.

---

## 6. Acceptance criteria

`[PROPOSED]`
- Every game: correct answer lifts with a fade-in checkmark; wrong shakes; a feedback banner shows
  the verdict; the next question/turn fades in; the result screen animates in with a rangoli.
- Haptics fire at the three moments on a physical device (no-op safely in the simulator).
- `expo-haptics` installs and the app builds.
- No change to scoring data, recording, or `user_overall_progress` (Opposites scoring identical).

## 7. Verification

Per CLAUDE.md visual workflow. `npx expo install expo-haptics`; build. Play each game; screenshot
correct / wrong / result(+rangoli) on iPhone SE (375×667) and a larger device. Haptics + gesture
feel are **physical-device-only** manual checks.
