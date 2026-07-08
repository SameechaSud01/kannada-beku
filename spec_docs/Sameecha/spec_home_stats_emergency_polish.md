# Home, stats sheets & Emergency polish

Owner design audit, 2026-07-05, covering five surfaces: Home, the Words-learnt sheet, Emergency phrases, the Streak sheet, and the Ring-info sheet — plus three cross-screen system fixes. Every item below was verified against code before being written down; items the code disproves are listed in §8 so they don't get "fixed" into new bugs.

**Status:** signed off 2026-07-05 — all four §7 decisions resolved by owner (D1 drop weekly + no bar; D2 warm-tan `interactiveSecondary`; D3 keep icon-only, closed with no change; D4 light only current-streak days). Implementation phased per §Phases.

**Relation to foundation:** conforms to the locked colour semantics (`spec_lesson_flow_fixed.md` — *gold = reward/audio accent; red = single CTA per screen*) and extends them to non-lesson surfaces. One item (tab labels, §7 D3) would amend the locked icon-only floating pill (`spec_playful_redesign.md` Amendment B / DESIGN.md TabBar) and ships only with explicit sign-off.

## Scope

Visual/copy polish only. No navigation changes, no data-model changes except the small store additions explicitly listed (weekly word count *if* D1 option b is chosen). No behaviour change to streak advancement, ring recording, or audio playback.

Files touched: `app/(tabs)/index.tsx`, `components/ui/StreakPill.tsx`, `components/ui/TabBar.tsx` (clearance constant only), `components/modals/BottomSheet.tsx`, `components/modals/instances/WordsLearnedSheet.tsx`, `components/modals/instances/StreakDetailSheet.tsx`, `components/modals/instances/RingInfoSheet.tsx`, `app/emergency.tsx`, `components/lesson/SituationPhase.tsx` (left-accent sweep only), `constants/goals.ts` (only if D1-b).

---

## 1 · Home (`app/(tabs)/index.tsx`)

### 1.1 Words-learnt banner demoted from gold CTA to white card + gold count badge
*(Refined by owner 2026-07-06, per docs/brand/BRAND_IDENTITY.md: gold = reward, never a competing CTA.)*
- [x] The full-width gold `LinearGradient` block becomes a **white card with the standard treatment** (white face, 1px `hairline` border, `cardLip` bottom lip, `Radius.chunky`, ~16px padding).
- [x] **Left: gold squircle count badge** mirroring the "Stuck right now?" red icon square (`ChunkyLip` anatomy): min 52×52, radius 14, horizontal padding so 3–4-digit counts grow the badge; gold reward gradient `goldBright → secondaryContainer` (~160°); hard 4px `goldLip` lip, no blur; count in Baloo extrabold ~20 in deep gold-ink (`onSecondaryContainer`).
- [x] **Middle:** title "Words learnt" (Baloo extrabold, ink) only — caption dropped (owner, 2026-07-06). No metrics, targets, or percentages — archive entry point, not a goal.
- [x] **Right:** "See all ›" in DM Sans bold ~14, deep gold (`goldLip`), `Icons.forward` chevron, no wrap (`flexShrink: 0`). No second affordance.
- [x] Whole card is the single tap target; keeps existing navigation (opens the Words-learnt sheet).

### 1.2 Split the mixed metric — resolved per D1: weekly framing dropped entirely
- [x] Headline reads **"174 words learnt"** (all-time count, `useWordsLearned()`), full stop. No percentage, no weekly line, no progress bar — a clean stat card with a muted subtitle and the "See all" hint.
- [x] `WEEKLY_WORD_TARGET` and the `wordPct` computation removed (`constants/goals.ts` constant deleted — orphaned by this change).

**Why:** today `wordPct = all-time count ÷ WEEKLY_WORD_TARGET (35)` — pinned at 100% forever once a learner passes 35 words. The number and the bar measure different things on one card.

### 1.3 Daily-goal ring card compacted
- [ ] `MultiProgressRing` size drops from 158 to ~110–120; ring/legend row gap from 26 to ~16; card inner gap from 14 to ~10. Target: card ≤ ~28% of an iPhone SE viewport with no clipped legend text.
- [ ] Legend rows lose the outsized vertical gaps (tighten to `Spacing.sm`).

### 1.4 Practice ring gets a distinguishable identity — `[OPEN]` D2
- [ ] Whatever colour D2 picks is applied in **both** places at once: the Home ring/legend (`metrics` + ring `progress` entries) and the Ring-info sheet's Practice row — they must never diverge.

### 1.5 Streak pill labelled
- [ ] `StreakPill` renders **"1 day" / "N days"** (or "day streak" — final copy at implementation, but a noun must follow the number). Accessibility label already correct; this is the visible text.

### 1.6 Tab-bar clearance
- [ ] `TAB_BAR_CLEARANCE` (TabBar.tsx, currently `moderateScale(88)`) rises so the true gap between the last card and the pill's top edge is ≥ `Spacing.xl` at 1.0 font scale (measured: only ~16px today — the "Stuck right now?" card sits nearly against the pill). Verify at `maxFontSizeMultiplier` extremes on iPhone SE.

### 1.7 Tab labels — closed, no change (D3: owner kept the locked icon-only pill)

---

## 2 · Words-learnt sheet (`WordsLearnedSheet.tsx` + `BottomSheet.tsx`)

- [ ] **Sheet stops climbing into the status bar:** `BottomSheet.tsx` gets `topInset = insets.top + moderateScale(12)` (or `maxDynamicContentSize` equivalent) so a content-heavy sheet's handle + close button never crowd the clock. This is the shared primitive — fixes all sheets at once; verify the short sheets (RingInfo, StreakDetail) still size to content.
- [ ] **Left gold accent border removed** (`borderLeftWidth 3 / secondaryContainer`) — rows use the standard card treatment (white, `hairline` border, `Radius.tile`; no lip needed on a tappable row that isn't a button, but keep the pressed-opacity feedback).
- [ ] **Count chip demoted:** the gold `secondaryFixed` pill holding "13" becomes plain faint-ink text appended to the header — `GREETINGS · 13` in `textFaint`/`tertiary`. No pill.
- [ ] **Audio circle unified with the lesson-flow gold treatment:** the flat `secondaryFixed` circle becomes the canonical gold audio look — `secondaryFixed` face, `secondary` icon, `goldLip` lip (a `ChunkyCircle`, decorative — the row's `Pressable` stays the single touch target; do **not** nest a second pressable).
- [ ] Whole-row tap already plays audio (verified) — no functional change; the lip on the circle is what fixes the "only the speaker looks tappable" read.

---

## 3 · Emergency phrases (`app/emergency.tsx`)

Red inventory today: gradient header + active chip + per-card badges + transliteration text + audio orbs + card left-borders. Keep red where it means *urgency or action*; strip it from labels and reading text.

**Keeps red (intentional):** gradient header (+ `redLip`), audio orbs (`AudioOrb` defaults), active filter chip (selection state, matches the tab-bar pattern), translucent back button on red (deliberate inversion of the cream chip — confirmed OK).

- [ ] **Category badges → flat tint:** `primaryContainer` pills with a 2px `redLip` lip become **flat `errorContainerLow` (#f3dada) badges with `primary` text, no lip** — lips mean pressable; these are labels. Keep the uppercase/letter-spacing type.
- [ ] **Transliteration → ink:** the big red (`primary`) transliteration becomes `onSurface` bold DM Sans (the system rule: transliteration = bold ink, gloss = muted). The English `meaning` drops from bold-ink to `tertiary` muted so the say-it line leads.
- [ ] **"|" divider removed:** the wrapping-prone three-`Text` baseline row is restructured — transliteration on its own line, gloss below it (matching the Words-learnt row anatomy). No dangling pipe.
- [ ] **Left red accent borders removed** from phrase cards (5px) and the context bar (6px) — standard card treatment.
- [ ] **Redundant context card folded away:** the white card restating the selected chip's label + blurb is deleted; the one-line `GROUP_BLURB` renders as plain caption text (`tertiary`, `dmSans.medium`) directly under the chip row.
- [ ] **Footer disclaimer reworded:** `"Audio uses your device's voice · romanisation pending review."` → **"Audio uses your device's voice."** — internal review notes don't ship.
- [ ] The file's header comment (which documents the all-red + left-accent scheme as intentional) is updated to match this spec, so the comment doesn't re-entrench the old scheme.

---

## 4 · Streak sheet (`StreakDetailSheet.tsx`)

- [ ] **Subtitle no longer claims "Your best run yet" unconditionally** (today it shows for any streak ≥ 1; no best-streak is tracked). New copy: `streak === 1` → **"Day one — nice start."**; `streak ≥ 2` → a neutral encouragement ("Keep it going.") — no superlatives we can't back with data.
- [ ] **Week row disambiguation — `[OPEN]` D4** (lit days are per-day activity, not current-run membership; pick semantics before styling).
- [ ] **"Set a reminder" → white lip button:** swap `variant="secondary"` (white + tan `interactiveSecondary` border + tan lip) for the standard white treatment already mandated by `spec_lesson_flow_fixed.md` §5 — white face, `hairline` border, faint (`cardLip`) lip. If that means adjusting the shared `secondary` variant itself rather than per-call overrides, do it once in `LipButton.tsx` and re-check its other call-sites in the same pass.
- [ ] **Nudge banner icon:** the red (`primaryContainer`) lightning bolt on the gold `secondaryFixed` banner becomes **gold-dark (`onSecondaryContainer`)** — one colour family per banner.

---

## 5 · Ring-info sheet (`RingInfoSheet.tsx`)

- [ ] **Target numerals → ink:** the coloured "10/day" numbers (red for Listen/Practice, gold-dark for Speak) become `onSurface` ink; the coloured legend dot/disc alone carries each ring's identity. (`/day` suffix stays `textFaint`.) Note Speak's target is 8/day, not 10 — copy stays number-accurate.
- [ ] Practice row colour follows D2 (same token as the Home ring — see §1.4).
- [ ] No spelling change: "practise" appears only as a verb (4 sites, all correct UK usage); nouns are "practice" throughout. Consistent — leave as is.

---

## 6 · Cross-screen system fixes

- [ ] **Canonical gold audio treatment** = the lesson-flow recipe: `secondaryFixed` face / `secondary` icon / `goldLip` lip (as in `TeachWordsPhase`). Words-learnt sheet adopts it (§2). Emergency stays red (urgency context, uses `AudioOrb` defaults). No pale-gold-without-lip circles anywhere.
- [ ] **Left-border accent cards eliminated app-wide.** Verified inventory of decorative left accents: `WordsLearnedSheet.tsx:159`, `app/emergency.tsx:182` and `:238`, `components/lesson/SituationPhase.tsx:100` (goldLip register-note accent). All four move to standard card treatment. (`LipButton`/`ChunkyPressable` left borders are inset button borders, not accents — untouched.)
- [ ] **One back/close chip:** the Words-learnt sheet's inline close `Pressable` is replaced with the `ExitBackButton`/`PhaseBackButton` family look (white `ChunkyCircle`, `hairline` border, `cardLip` lip, `skipConfirm` behaviour) — extract or reuse rather than a third hand-rolled circle. Emergency's translucent-on-red variant is kept as the documented inversion for red headers.

---

## 7 · Decisions — resolved by owner, 2026-07-05

**D1 — Words-learnt card second line** → `[LOCKED]` **weekly framing dropped, no bar.** The card is a plain all-time stat ("N words learnt" + subtitle + "See all"). No new tracking; `WEEKLY_WORD_TARGET` deleted.

**D2 — Practice ring colour** → `[LOCKED]` **warm-neutral tan `interactiveSecondary` #b8956a** (existing palette token; stays inside the locked red/gold/warm-neutral family). Dot/ring = `interactiveSecondary`; value/goal text = `interactiveSecondaryLip` #7e6440 (contrast on white); Ring-info disc icon = `onSurface` ink (white fails 3:1 on tan). Applied simultaneously on Home and RingInfoSheet.

**D3 — Tab labels** → `[LOCKED]` **keep icon-only.** The locked floating-pill design stands; item closed with no change.

**D4 — Week-row semantics** → `[LOCKED]` **light only the current run's days** (computable from `streak` + today) — the row always agrees with the headline number. Ships in Phase 2.

---

## 8 · Audit claims the code disproves (no action)

Recorded so these don't get "fixed":
- **"Inner grey ring"** — there is no grey ring; each ring's track is its own colour at 25% alpha (`${color}40`). The faint innermost track is Practice's maroon. D2 + the compaction (§1.3) resolve the perception.
- **"Practice icon (sheet) vs ring (Home) disagree"** — both are `Colors.primary` #91001b today. The real defect is Listen-vs-Practice proximity (D2), not a sheet/Home mismatch.
- **"Only the speaker button is tappable"** on Words-learnt — the whole row is already the `Pressable`; affordance-only fix (§2).
- **"Audio buttons inconsistent vertical alignment"** on Words-learnt — all rows use `alignItems: 'center'`; any perceived drift is text-wrap variance. §2's unification is the only change.
- **"Red circle sticking out above the tab pill"** — the active circle sits inline within the pill (46px slot), not above it.
- **"Tab bar overlaps / clips the Survival card"** — no literal overlap at 1.0 font scale (~16px gap), but the gap is far too thin and collapses under large accessibility text; §1.6 is the fix.
- **practise/practice** — verb/noun split is correct UK usage; no change (§5).

## Acceptance criteria

1. Home: no gold-faced CTA blocks; gold appears only as the stat-bar fill, streak-pill accent, and reward moments. The single red CTA above the fold is "Continue".
2. Words-learnt sheet opens below the status bar on iPhone SE and a large iPhone; no element overlaps the clock.
3. Emergency: red appears only on the header, the active chip, and the audio orbs. Zero left-accent borders anywhere in the app (`grep borderLeftWidth` returns only `LipButton`/`ChunkyPressable` inset borders).
4. Streak sheet never shows "Your best run yet"; the week row's lit days agree with the chosen D4 semantics.
5. All copy/number pairs are internally consistent (no all-time count against a weekly denominator; "8/day" stays 8).
6. Screenshot check per workflow rules on iPhone SE + a large device for every touched surface; each phase handed to owner for manual test before the next begins.

## Phases

- **Phase 1 — Home** (§1, minus D2/D3 if still open).
- **Phase 2 — Sheets** (§2, §4, §5 + the shared `BottomSheet` topInset).
- **Phase 3 — Emergency + cross-screen sweep** (§3, §6).

Each phase: implement → screenshot both device sizes → owner manual test → next.

## `[LOCKED]` decisions (inherited)

- Gold = reward/audio accent; red = single CTA per screen (`spec_lesson_flow_fixed.md`).
- Additive palette only — no colours outside red/gold/deep-gold/warm-neutral (DESIGN.md).
- Icon-only floating tab pill stays locked unless D3 is signed off (`spec_playful_redesign.md` Amendment B).
