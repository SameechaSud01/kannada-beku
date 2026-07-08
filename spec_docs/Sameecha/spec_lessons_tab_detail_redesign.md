# Spec — Lessons tab + lesson detail (parts) redesign

**Status:** owner-directed (spec dictated verbatim by owner, 2026-07-06) — implement as written
**Owner:** samee
**Branch:** fix/lesson-flow-polish
**Created:** 2026-07-06

## Scope

Visual/structural redesign of two surfaces:

1. `/(tabs)/learn` — the Lessons tab (main list), including `BasicsCard`.
2. The lesson detail (parts) page — `LessonPartChooser`, shown when a split lesson (e.g. Greetings) is opened without a part.

Brand rules from [docs/brand/BRAND_IDENTITY.md](../../docs/brand/BRAND_IDENTITY.md) apply: one red action moment per surface; gold = earned reward only; lip shadows only on pressable things; all values from `constants/` tokens — no raw hex in components where a token exists.

**Out of scope:** lesson content, navigation structure, the tab bar itself, the lesson runner phases.

## 1 · Lessons tab (`app/(tabs)/learn.tsx`)

### Progress header
- Next to the "Lessons" title, right-aligned: **"{n} of 8 done"** in DM Sans 700 (`Fonts.dmSans.bold`), deep gold (`Colors.secondary`).
- Below it, a thin **10px gold progress bar** (fill `Colors.secondaryContainer`, track `Colors.surfaceCreamLow`) showing lessons-done / 8.
- Computed from real lesson state (`useCompletedLessons`, capped at `TOTAL_LESSON_SLOTS`).
- The "8 steps to speaking." subtitle is **replaced** by an UPPERCASE tracked eyebrow **"8 STEPS TO SPEAKING"** above the lesson list.

### Kannada basics card (`components/guide/BasicsCard.tsx`)
- Standard white chunky card: 16px radius (`Radius.chunky`), hairline border, hard lip (`Colors.cardLip`).
- Left: **46×46 red squircle icon block** — radius 13, red gradient fill (`Colors.primaryContainer → Colors.primary`), 3px `Colors.redLip` lip, white book icon (`Icons.book`).
- Title "Kannada basics", subtitle "Vowels, consonants, how to read it", muted forward chevron.

### Lesson rows — three explicit states
Every row: white card (16px radius, hairline, hard `cardLip` lip when pressable); flat **46×46 cream squircle number badge** (radius 13, `Colors.surfaceCreamLow`, 1px hairline border, **no lip** — not pressable), ink numeral in display font; title in display 700 ~18px; one-line description (planned-slot subtitle) in muted DM Sans 13px, single line, ellipsis. The (i) info buttons are **removed entirely** — the description replaces them.

- **Done:** flat **38px solid-gold circle** (`Colors.secondaryContainer`) with a dark gold-ink check (`Colors.onSecondaryContainer`) — no lip (status, not a button). Row tappable (reopens lesson).
- **Up next** (first incomplete): **2px red border** (`Colors.primaryContainer`) on the card + **46px red round play button** (with lip) on the right. The card's lip is red too (3px, `primaryContainer`) — the lip doubles as the bottom border edge, so the red border wraps all four sides (owner fix, 2026-07-06). This is the page's single red action moment. Row or play opens the lesson.
- **Locked / not built:** row at **65% opacity**, numeral in faint ink (`Colors.textFaint`), right side shows text **"Soon"** (DM Sans 700, 12px, faint ink). **Not tappable** (the previous locked-tap dialog is removed on this surface).

### Scroll clearance
Bottom content padding ≥ ~110px (tab-bar height + margin) so the floating tab bar never clips the last card. `TAB_BAR_CLEARANCE` (104) + `insets.bottom` satisfies this; verify visually.

## 2 · Lesson detail page (`components/lesson/LessonPartChooser.tsx`)

### Header
- The floating ✕ close chip is replaced with a **← back button** (white, 44px, round) — this is a pushed page, not a modal. Wiring: `router.back()` when the stack can pop, else fall back to `router.replace('/(tabs)/learn')` (deep links land here with an empty stack).
- Below it: UPPERCASE eyebrow **"LESSON {lessonNo}"**, then the title (display 800, ~36px) with a **progress chip right-aligned** on the same line:
  - all parts done → **gold selected chip** (`Colors.secondaryFixed`) with check icon, "3 of 3 done"
  - otherwise → plain white chip (hairline border), "{n} of {total} done"
- Scenario description paragraph unchanged.

### Part cards (1a/1b/1c) — three states
All cards: 16px radius; part id ("1a") in display 800 ~20px as a **plain text label** (the small squircle/underline element beneath it is deleted entirely); title + meta ("3 words", "4 words · 3 phrases").

- **Done:** sun-drenched gold gradient face **`#FFE9A8 → #FFDE7A` at 160°** (new tokens `Colors.goldSunHi` / `Colors.goldSunLo`) with gold lip (`Colors.goldLip`); id + meta in dark gold-ink (`Colors.onSecondaryContainer`); right side a **flat 40px gold check circle** with an 11px **"Review"** microlabel under it. Tapping replays/reviews the part.
- **Up next:** white face, 2px red border with a red 3px lip as the bottom edge (border wraps all four sides — owner fix, 2026-07-06), **48px red round play button (with lip)** on the right.
- **Not started:** white face at **85% opacity**, 40px cream circle (`Colors.surfaceCreamLow`) with a small lock icon on the right, faint-ink id. Not tappable.

### Bottom of page
- **Mid-progress:** full-width red `LipButton` **"Continue · {next part title}"** with play icon → starts the active part.
- **All done:**
  - Centered text link **"Review words from this lesson"** (book icon + DM Sans 700, deep gold `Colors.secondary`) → opens the Words Learnt sheet scoped to this lesson's words + phrases.
  - Below it, full-width red `LipButton` **"Next: Lesson {n+1} · {title} →"** that opens the next lesson. If the next lesson isn't built (no DB content), the button renders **disabled** with **"More lessons coming soon"**.

### Red-moment note (owner-directed)
Mid-progress the surface shows the red play orb on the up-next card *and* the red Continue button — both are the same action (start the next part), dictated explicitly by the owner as one action expressed twice.

## Acceptance criteria
1. Lessons tab shows the gold progress header ("N of 8 done" + 10px bar) computed from real completions; eyebrow replaces the subtitle; no (i) buttons anywhere.
2. Row states render as specced (done / up-next / Soon) on iPhone SE and a large device; last card fully visible above the floating tab bar.
3. BasicsCard is a white chunky card with the red-gradient book squircle.
4. Detail page: back arrow (not ✕), eyebrow + 36px title + progress chip; part cards match the three states; done cards replay on tap.
5. Bottom CTA: Continue (mid-progress) / Review-words link + Next-lesson button (all done), disabled "More lessons coming soon" when next lesson has no content.
6. No lip on non-pressable elements (number badges, done check circles, lock circles); gold only on earned/reward elements; single red action per surface (owner-noted exception above).
7. `npx tsc --noEmit` clean; no lesson content, navigation-structure, or tab-bar changes.
