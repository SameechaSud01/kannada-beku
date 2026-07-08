# Spec — Onboarding Flow: Audit Fixes

**Source:** `design_handoff_onboarding_audit/` (owner-provided design handoff, 2026-07-07).
This spec formalizes that handoff for implementation. The handoff README + JSX
mocks are the pixel reference; this doc records scope, behavior, acceptance
criteria, and the deltas where the mocks diverge from the live codebase.

## Scope

UX-audit-driven redesign of the onboarding flow:
Welcome → intake (Name, Why, Time) → **new** post-intake greeting → Kannada
basics primer (Lesson 0, 7 steps). Nine audit findings, 9 screens touched
(8 fixed + 1 new). High fidelity — recreate the mocks 1:1 using existing
`constants/` tokens and `components/` primitives.

## Audit findings → fixes

1. **One progress system.** Kill `ProgressDots` + "Step x of 4" eyebrows on
   intake. Replace with a single segmented gold bar (`#FDC003` filled,
   ink@10% rest; height 6, radius 3, gap 6) under the status bar.
2. **Top-anchor all intake steps** (no vertical centering; nothing jumps when
   the keyboard opens).
3. **Neutral name input** — hairline border + card lip at rest; red only for
   caret and focus ring.
4. **Skip affordance** (DM Sans 700 13.5, ink-faint) top-right on steps 2–3.
5. **Why step: all 6 options visible** — compact icon rows + checkbox;
   "n of 3 picked" counter appears only after the first pick; max 3.
6. **Time step: no (i) icons** — detail inline in subtitles; 10 min
   preselected with a gold "MOST POPULAR" badge; Continue never disabled.
7. **Palette discipline** — "You're ready" per-row checks become gold (green
   is scoped to answer feedback only); quiz chips are white chunky, never
   flat grey.
8. **Vowel grid feedback** — speaker glyph per tile, gold "heard" state,
   "n of 8 heard" counter; transliteration labels ink (not red).
9. **Welcome value cards** — ±0.8° tilt with safe spacing (no overlap/clip).

## Screens (see handoff README §Screens for exact values)

- **Welcome** — red gradient, ಬೇ glyph 64, wordmark 33, 3 value cards
  (tilt −0.8/+0.8/−0.8, lip `0 5px 0 rgba(74,0,14,0.45)`, 44px gold-fixed icon
  tile), white bottom sheet ("Let's get you talking" 25px, caption, red
  Get Started). No progress indicator.
- **Step 1 · Name** — title "What should we call you?", sub "So lessons can
  greet you properly — Namaskāra!", white input (Baloo 700 19 value, red
  caret), helper "Just a first name is perfect.", autofocus, top-anchored.
- **Step 2 · Why** — 6 compact rows (icon tile 36/checkbox 22): moodHappy,
  chat, globe, bolt, sparkle, home. Selected = pale-red fill + red border,
  no lip. Counter after first pick. Skip.
- **Step 3 · Time** — 3 radio cards (24px radio, white dot), subtitles carry
  the detail, 10 min preselected + MOST POPULAR badge. Skip.
- **Greeting (NEW)** — centered 96px red-gradient app mark (gold ಕ),
  "Namaskāra, {firstName}!", plan chips echoing actual picks
  (clock/goal + short motivation labels), red "Start Kannada basics" CTA.
- **Basics chrome** — 40px back chip gains a card lip; progress bar 8px,
  track ink@8%; counter DM Sans 700 14.
- **Basics 2/7** — mouth-position row card (tongue-a image 76×106 beside
  caption); vowel tiles: speaker icon (unheard) → gold-soft heard state with
  check; roman labels ink; "n of 8 heard" counter.
- **Basics 3/7** — listen-card glyphs ink (not red); gold play orbs
  (`#FDC003` face, goldLip lip); quiz chips white chunky idle / sanctioned
  green correct; wrong = shake + "Not quite. Let's try again!" + retry;
  correct = "Correct! Well done."
- **Basics 6/7** — beat chips idle cream-low + ink, beating chip gold with
  lip; play highlights chips in sequence; "Hear the beat" is a **white pill**
  (200px, gold 26px orb inside), never a gold button.
- **Basics 7/7** — 92px gold-gradient celebration circle; 4 rows with **30px
  gold** check circles (not green); CTA "Start Lesson 1 · Greetings".

## Behavior / state

- Intake store (existing `useUserStore`): `displayName`, `motivations`
  (max 3), `dailyGoalMinutes 5|10|20` (default 10). Skip on Why saves `[]`;
  Skip/Continue on Time persists the selection (default 10). Continue is
  never rendered disabled on steps 2–3.
- Basics finish no longer bounces back to the motivation step when
  `motivations` is empty (personalization is skippable now).
- Vowel `heard` set and quiz `answerState` are step-local state.
- Lip press physics on all pressables (~80ms, lip never blurred);
  reduced motion respected; no infinite decorative loops.

## Deltas vs the mocks (deliberate)

- **3 progress segments, not 4.** The mock assumed a 4-step intake; the
  learning-focus step was removed from the app, so intake is Name/Why/Time.
  A 4th segment could never fill.
- **Card-lip alpha:** mocks use `rgba(27,29,14,0.10)`; the codebase token
  `Colors.cardLip` is 0.18 ("reads on cream"). The token wins.
- **"Other" motivation option and the 3 extra presets are dropped** — the
  handoff fixes the below-the-fold problem by listing exactly 6 options.
- Tokens missing from `constants/colors.ts` are added there (`redSoft`,
  `goldSoft`, `hairlineStrong`, `inkFaint`) rather than inlined.

## Acceptance criteria

- Exactly one progress indicator exists across intake; none on Welcome or
  Greeting.
- Name screen layout does not shift when the keyboard opens; input reads
  neutral at rest.
- All 6 Why options visible without scrolling on iPhone 15-class devices;
  counter hidden until first pick.
- Time step arrives with 10 min selected; Continue enabled from arrival on
  steps 2–3; Skip jumps forward.
- Greeting shows the real name and real picks (falls back gracefully when
  name/motivations were skipped).
- No green anywhere except quiz answer feedback; quiz chips never flat grey.
- Vowel tiles show heard state + counter; all labels ink.
- Typecheck passes; screens verified on simulator (SE-class + large).
