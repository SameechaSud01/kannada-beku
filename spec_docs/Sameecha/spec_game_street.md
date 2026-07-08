# Spec — Game Street (Games tab + game lesson picker redesign)

**Status:** approved — owner decisions recorded 2026-07-06 (see Decisions)
**Owner:** samee
**Branch:** fix/lesson-flow-polish
**Created:** 2026-07-06
**Design source:** claude.ai/design project "Kannada Beku" → `Game Street - Final.html`
(source: `lesson-flow-fixed/game-street.jsx`, option F — "final direction")

## Decisions (owner, 2026-07-06)

- **Opposites lock:** keep current unlock behaviour — all four games unlock
  together with the first completed lesson part (spec_fix_games_flow). The
  mock's "OPENS WITH LESSON 3" lock was illustrative; the locked-sign style
  is specified but dormant.
- **Play-all:** skipped for now. No `/quiz/all` mode, no play-all button.
  May return in a later spec.
- **Best scores:** not implemented. No score recording, no ★ score chips, no
  "BEST 7/8" meta. Played/new state derives from existing
  `completedGameParts` only.
- **Branch:** continue on `fix/lesson-flow-polish`.

## Scope

Visual/structural redesign of two surfaces. **No data-model changes, no
unlock-logic changes, no new routes.**

1. **Games tab** — `app/(tabs)/practice.tsx`: replace the featured-quiz +
   2-up grid + wide-card layout with four full-width tilted "signboard" rows
   (Game Street).
2. **Game lesson picker** — `components/lesson/LessonSelector.tsx` (shared by
   all four games via `app/(games)/[game]/index.tsx`): state-rich lesson rows
   (New / played / locked).

Brand rules apply: all values from `constants/` tokens (translucent white/ink
rgba overlays follow the existing inline precedent in `practice.tsx`); lip
shadows only on pressables (locked sign is a flagged, currently-dormant
exception); `moderateScale()` for all sizes.

**Out of scope:** game runners, the part chooser (`GamePartChooser`), unlock
logic, the tab bar, the `GamesLockedEmpty` zero-state, play-all, best scores.

---

## 1 · Games tab — "Game Street" (`app/(tabs)/practice.tsx`)

### Page header
- Title **"Games"** (unchanged style).
- Subtitle replaced with: **"Four shops open on Game Street. Every one plays
  phrases you've learned."**
- TopBar + streak chip unchanged. `GamesLockedEmpty` zero-state unchanged.

### Signboards — four full-width rows, in street order
1. **Quick quiz** — glyph ಪ, Kannada name **ವೇಗ**, desc "Test your speed.",
   tilt **−1.2°**. Gold: bg `Colors.secondaryContainer`, lip `Colors.goldLip`,
   ink `Colors.onSecondaryContainer`, glyph tile `rgba(255,255,255,.45)`.
2. **Dictation** — glyph ಕ, Kannada **ಕೇಳಿ**, desc "Hear it. Type it.",
   tilt **+1°**. Red: bg `Colors.primaryContainer`, lip `Colors.redLip`,
   ink `Colors.onPrimary`, tile `rgba(255,255,255,.18)`.
3. **Conversations** — glyph ಮ, Kannada **ಮಾತು**, desc "Roleplay real
   scenes.", tilt **−0.8°**. Deep red: bg `Colors.primary`, lip
   `Colors.redLipDeep`, ink `Colors.onPrimary`, tile `rgba(255,255,255,.16)`.
4. **Opposites** — glyph ವ, Kannada **ವಿರುದ್ಧ**, desc "Match contrasts.",
   tilt **+1.1°**. Pale gold: bg `Colors.secondaryFixed`, lip `Colors.goldLip`,
   ink `Colors.onSecondaryContainer`, tile `rgba(255,255,255,.6)`.

No featured game — the street is flat; the quiz leads because it's first.

### Sign anatomy (one row)
- Full-width card, radius `Radius.chunky`, **5px hard lip** in the sign's lip
  colour, padding ~15×16, `transform: rotate(tilt)` on the whole sign
  (lip included).
- **Painted inner outline**: 1px `rgba(255,255,255,.35)` inset ~6px from the
  card edge (RN: absolute-fill inner `View` with border + margin,
  `pointerEvents="none"`).
- Left: **54×54 glyph tile**, radius ~12, tile colour above, Kannada glyph
  (`Fonts.notoSansKannada.bold`, ~27px) in the sign's ink.
- Middle: title (`Fonts.baloo.extrabold` ~21px, ink) with the **Kannada shop
  name beside it on the baseline** (`Fonts.notoSansKannada`, ~13px, ink @ 75%
  opacity); desc line (DM Sans 600 ~12.5px, ink @ 82%); **meta line** (DM Sans
  800 ~11.5px, uppercase, letter-spaced, ink @ 65%).
- Right: forward chevron in the sign's ink (lock icon if ever locked).

### Meta line — real state, computed
- All four games: **`{n} LESSON{S} READY`** — n = count of unlocked lessons
  from `useLessons()` (singular "1 LESSON READY").
- Locked sign (dormant): `OPENS WITH LESSON {k}`.

### Locked sign state (specified, dormant)
A locked shop **keeps its full-colour board** (no dim), shows a **lock icon**
instead of the chevron and its opening condition in the meta line, and is not
tappable (flat, `accessibilityState={{ disabled: true }}`). Intentional
divergence from the tonal-dim locked recipe — the signboard IS the shop front.
Not reachable today (decisions above); keep the current tab-level zero-state.

### Interaction
- Tapping a sign routes to `/{gameId}` (unchanged).
- Press affordance: existing `ChunkyPressable` lip-press behaviour.
- Footer caption under the street: keep
  "Each game draws only from phrases you've already learned."

---

## 2 · Game lesson picker (`components/lesson/LessonSelector.tsx`)

Shared by all four games; header behaviour and copy identical per game.

### Header
- Round white back button (existing, `Icons.back`), sized up to ~46pt to match
  the design, label "Back to Games". Returns to `/practice` (unchanged).
- Game title, `Fonts.baloo.extrabold` ~34px (up from 28).
- Subtitle: **"Pick a lesson to play with."** (unchanged copy — the mock's
  "Play everything, or drill one lesson." belonged to play-all, which is
  skipped).

### Lesson rows — three states
Row shell: white card, radius `Radius.chunky`, hairline border, 4px
`Colors.cardLip` lip (pressable rows only); left **46×46 glyph tile** radius
~13; middle: eyebrow **`LESSON {n}`** (DM Sans 800 ~11px, uppercase, tracked,
faint ink) over the theme title (`Fonts.baloo.bold` ~18px). Entry animation
(stagger fade/rise) kept from the current `LessonPill`.

- **New** (unlocked, never played): red-outline pill on the right — 1.5px
  `Colors.primaryContainer` border, "New" in `Colors.primaryContainer` 800
  ~12px — plus muted chevron. Tappable.
- **Played** (unlocked, any `completedGameParts` entry with prefix
  `{gameKey}:{slug}:` for that lesson): no pill, muted chevron only. Tappable.
- **Locked:** row at **60% opacity**, glyph tile goes cream
  (`Colors.surfaceCreamLow` + hairline border, `Colors.textFaint` glyph),
  lock icon on the right, **no lip, not tappable** (current locked recipe,
  restyled to the new shell).
- Unlocked glyph tile: `Colors.secondaryFixed` bg,
  `Colors.onSecondaryContainer` glyph (existing).

`LessonSelector` needs the played-lesson set; derive it in `useLessons()` (add
a `played` flag per item, computed per game key passed in) or via a small prop
from the screen — implementer's choice, keep it minimal.

### Footer caption
**"Locked games open as you finish lessons."** (replaces "Finish a lesson on
the Learn tab to unlock it here.")

---

## Phases & test gates

Owner manually tests after each phase before the next begins.

- **Phase 1 — Game Street tab.** §1 complete. Verify: typecheck + iPhone SE
  and larger-device screenshots; tilted signs not clipped; street clears the
  floating tab bar; all four signs route correctly.
- **Phase 2 — Picker redesign.** §2 complete. Verify: all four games'
  pickers; New/played/locked states; back nav; entry animation intact.

## Acceptance criteria

1. Games tab shows exactly four tilted signboards (no featured card, no
   grid), colours/typography per §1, on iPhone SE without clipping/overlap.
2. Each sign's meta line shows the real unlocked-lesson count; no hardcoded
   mock strings (no fake "BEST 7/8", no fake "OPENS WITH LESSON 3").
3. Picker rows show New pill / plain played row / locked lock per real
   progress state, for all four games.
4. All existing navigation and unlock behaviour unchanged.
5. `npx tsc --noEmit` clean; sizes via `moderateScale`; colours from tokens
   (translucent rgba overlays per existing precedent).
