---
doc: spec_lesson_runner_ux
status: reviewed
owner: samee
last-reviewed: 2026-06-02
related:
  - INTERACTIONS.md
  - DESIGN.md
  - spec_lesson_redesign.md
  - spec_profile_settings_wiring.md
---

# Lesson-runner UX

> **Decision layer.** `[LOCKED]` means decided — do not reopen or build the opposite. `[OPEN]` means genuinely undecided. `[PROPOSED]` is in this doc only — pending owner sign-off; once approved, promote to `[LOCKED]`.

Owns: four in-lesson interaction fixes — the double-tap "I said it" button, backward navigation between phases, clearer correct/wrong feedback, and an in-lesson playback-speed control. These are behavior changes, so per CLAUDE.md they require this spec before code. Animation feel and loading rules follow [INTERACTIONS.md](../../docs/foundation/INTERACTIONS.md); tokens follow [DESIGN.md](../../docs/foundation/DESIGN.md).

---

> **Implemented 2026-06-02** (owner sign-off via implement request; all sections promoted `[PROPOSED]` → `[LOCKED]`). Two placement details that the spec left open were resolved during build:
> - **D2 control placement:** the in-phase back control is rendered as a floating button in [app/lesson/[id].tsx](../../app/lesson/%5Bid%5D.tsx) ([components/lesson/PhaseBackButton.tsx](../../components/lesson/PhaseBackButton.tsx)), top-left just right of the exit chip, shown only when `runner.canGoPrevious`. It uses a distinct curved "undo" glyph (`Icons.stepBack` = `IconArrowBackUp`) vs the exit chip's straight back arrow, satisfying "distinct from the exit-lesson chip." Floating (rather than per-phase headers) keeps it uniform across the varied phase layouts.
> - **D4 canonical set:** `RATE_OPTIONS` + `rateLabel()` moved to [constants/audio.ts](../../constants/audio.ts); both Settings → Audio and the new in-lesson [SpeedControl](../../components/lesson/SpeedControl.tsx) consume it, and both persist through the shared [useTtsRate](../../hooks/useTtsRate.ts) hook (same `ttsRate`, AsyncStorage + Supabase) so they can't drift.

## 1. Scope

`[LOCKED]`

Triage issues #2, #7, #8, #9. All live in the lesson runner ([hooks/useLessonRunner.ts](../../hooks/useLessonRunner.ts), [app/lesson/[id].tsx](../../app/lesson/%5Bid%5D.tsx), `components/lesson/*`). Out of scope: game screens (`src/games/*`), content correctness (see `spec_content_integrity.md`).

---

## 2. Changes

### 2.1 Double-press on "I said it" (#2)
`[LOCKED]`

**Today:** The "Say it" step renders an "I said it" button that is disabled for `SAY_READY_DELAY_MS` (1.8 s) while shown at 0.5 opacity — [PracticeWordsPhase.tsx:65-68, 298-307](../../components/lesson/PracticeWordsPhase.tsx#L298-L307) and the identical block in [PracticePhrasesPhase.tsx:65-66, 305-314](../../components/lesson/PracticePhrasesPhase.tsx#L305-L314). It looks tappable, so the first tap is swallowed and the user taps twice.

**Decision (D1):** Remove the artificial readiness delay — enable the button immediately on entering the "say" step. Drop the `canSayIt` state, the `SAY_READY_DELAY_MS` timer, and the `opacity`/`disabled` gating tied to it, in both phases.

> Alternative if the delay is a deliberate "listen-first" beat: keep it but make it unmistakably non-tappable (no button shown until ready, or a countdown affordance). **Default is removal** unless owner says the beat matters.

### 2.2 Back between phases (#7)
`[LOCKED]`

**Today:** [useLessonRunner.ts](../../hooks/useLessonRunner.ts) is a forward-only state machine (`advance()`, lines 34-106). The only back control is `ExitBackButton`, which exits the whole lesson.

**Decision (D2):** Add a `goPrevious()` transition mirroring `advance()` — step back through the same phase/step/index sequence (e.g. say→listen, word N→word N-1, practice→teach, teach_phrases→practice_words, etc.). Expose it from the hook and render an in-phase **back affordance** (distinct from the exit-lesson chip) in the phase header. At the first phase, `goPrevious()` is a no-op (hide/disable the control).

- Reuse `ExitBackButton` only for *exit*; the new control is a separate small header button (44×44pt min, `Pressable`).
- No backward step from the `done` phase (it has its own close).

### 2.3 Clearer correct/wrong (#8)
`[LOCKED]`

**Today:** Feedback is background-color only — gold (`secondaryContainer`) for correct, pale red (`errorContainerLow`) for wrong — with no icon or label ([PracticeWordsPhase.tsx:159-167](../../components/lesson/PracticeWordsPhase.tsx#L159-L167); same in `PracticePhrasesPhase`).

**Decision (D3):** On reveal, add to the chosen option:
- a ✓ icon + "Correct" label when right;
- a ✗ icon + "Try again" label when wrong, **and** highlight the correct option (reuse the games' `reveal` pattern — the correct row gets the gold/✓ treatment even when the user picked wrong).

Colors/icons from [DESIGN.md](../../docs/foundation/DESIGN.md) + `constants/icons.ts`; respect `maxFontSizeMultiplier`. Keep the existing advance delays.

### 2.4 In-lesson speed control (#9)
`[LOCKED]`

**Today:** Speed exists only in Settings → Audio (`RATE_OPTIONS` 0.75/1.0/1.25 → `ttsRate` in `useUserStore` → `deviceTtsAudioService.resolveRate`). Lesson playback already respects `ttsRate` globally.

**Decision (D4):** Surface a compact speed control on the listen/say screens (the screens with the replay button). It writes the **same** `ttsRate` via the existing `useUserStore` setter — no new audio plumbing, no new persisted key. Placement: near the replay button; cycles or toggles among the existing `RATE_OPTIONS` values (keep the canonical set in one place so Settings and in-lesson stay in sync). Changing it re-plays at the new rate.

---

## 3. Acceptance criteria

`[LOCKED]`

- A single tap on "I said it" advances immediately (no dead first tap), in both word and phrase practice.
- A back control steps to the previous phase/step; it is hidden/disabled on the first phase and never appears on `done`.
- A wrong answer shows ✗ + "Try again" and visibly reveals the correct option; a right answer shows ✓ + "Correct".
- The in-lesson speed control changes playback rate and the value persists (same `ttsRate` as Settings; the two stay consistent).
- No raw pixels (all `moderateScale`/percent/flex); touch targets ≥ 44pt; `tsc`+lint clean.

---

## 4. Verification

`[LOCKED]`

Run on iOS sim; screenshot listen + say + a practice-reveal state on iPhone SE and a larger device. Manually: tap "I said it" once → advances; step back across each phase boundary; pick a wrong then right answer and confirm icon+label+reveal; change in-lesson speed and confirm both the audio rate and the Settings value updated.
