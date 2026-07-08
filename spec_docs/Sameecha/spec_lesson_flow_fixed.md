# Spec — Lesson Flow "Fixed" polish pass

**Source of truth:** Claude Design project `205d5893-034e-40d2-acc1-4f0c8f8b602f`, canvas `Lesson Flow - Fixed.html` (+ `lesson-flow-fixed/screens.jsx`), including the five per-screen annotation cards.

**Status:** draft — awaiting owner sign-off
**Owner:** samee
**Created:** 2026-07-04

## Scope

A visual/interaction correction pass over the existing lesson-runner screens. No new phases, no data-model changes, no navigation changes. The phase sequence locked in `spec_lesson_redesign.md` is untouched; the four UX fixes locked in `spec_lesson_runner_ux.md` (phase-back, speed control, answer feedback, no double-tap) all remain — only their presentation changes.

Applies to both the **word** and **phrase** variants of each step (the design canvas shows words; the notes say the treatment is flow-wide).

Out of scope: Lesson 0 basics flow (own spec), games, final lesson DoneCard beyond the shared button treatment.

## Changes by screen

### 1 · Learn (`TeachWordsPhase`, `TeachPhrasesPhase`)

- [ ] Content starts near the top of the screen — remove the dead space above the phrase card (no vertical centering); CTA stays pinned to the bottom.
- [ ] Audio orb sits directly under the card with a "Tap to hear it" caption grouped with it.
- [ ] Audio orb uses the **gold** treatment (gold face, gold lip, gold-ink icon) — red is reserved for the single CTA. Applies flow-wide: every audio replay control in the lesson runner is gold.
- [ ] CTA label "Got it" → **"Continue"** ("Got it" now only ever means the self-rating chip). Last-item labels ("Start practising words" etc.) unchanged.
- [ ] Step label gains a step suffix: `… · Word 1 of 3 — Learn`, matching the existing `— Listen` / `— Say it` suffixes.

### 2 · Listen quiz (`PracticeWordsPhase` step="listen", `PracticePhrasesPhase` equivalent)

- [ ] After answering, options that are neither the picked one nor the correct one are **muted** (~50% opacity) so they no longer look tappable.
- [ ] Explanation card (`WhyBanner`) must always be fully visible — after answering, scroll it into view / ensure nothing is clipped behind the Next button on an iPhone SE-height screen.
- [ ] Speed control (`1.0x`) restyled from gold reward pill to a **quiet white chip** (white face, hairline border, faint lip). Gold = reward only.
- [ ] Close (exit) and phase-back buttons share one visual style (matching white round icon buttons).

### 3 · Say it (`PracticeWordsPhase` step="say", `PracticePhrasesPhase` equivalent)

- [ ] The two stacked instruction lines ("Listen, then say it out loud" + "Said it? How did it feel?") merge into one line: **"Listen, then say it out loud — how did it feel?"**
- [ ] Rating chips (Tricky / Got it / Easy) are **text-only** — drop the face icons.
- [ ] Layout: card raised toward the top (no vertical centering); instruction + rating chips anchored to the bottom of the screen.
- [ ] Audio orb keeps the gold treatment (already gold here — unchanged).

### 4 · What you learned (`SummaryPhase`)

- [ ] Section headers render only when their list is non-empty (no empty "PHRASES" header).
- [ ] Meanings sit **left-aligned in their own column** next to a fixed-width translit/kannada column — no right-aligned awkward wraps.
- [ ] A small gold **"N new words" chip** (sparkle icon) next to the "What you learned" title — the one reward beat on this screen.
- [ ] Per-row audio buttons use the same gold treatment and are at least 44pt touch targets (current 34 is under the accessibility floor).

### 5 · Part complete (`PartDoneCard`, shared bits in `LessonTrail`)

- [ ] Redundant copy trimmed to one subline: eyebrow `Part 1A · Saying hello`, headline `That's one of three.`, subline `**How are you / I'm fine** is next.` — drop the duplicate "— N parts to go" phrasing.
- [ ] Up-next card has **one** affordance: the play orb. Trailing chevron removed.
- [ ] Bottom buttons ("Back to parts" / "Home") use the standard white lip button (white face, hairline border), not tan outlines. Same treatment on `DoneCard` for consistency.
- [ ] Casing unified as `Part 1A` everywhere on this screen.

## Acceptance criteria

1. All five screens visually match the design canvas on iPhone SE and a large iPhone (screenshot check per workflow rules).
2. Gold appears only on: audio controls, reward chips ("N new words", selected rating), syllable chips. The only red element on any step is the single CTA (and error feedback states).
3. No behavior change: phase order, progress recording (`recordSpeak` etc.), answer-reveal logic, and speed-control function are identical.
4. `npx tsc --noEmit` clean; existing lesson component tests pass.

## Delivery phases (owner manually tests after each)

- **Phase 1:** Screens 1–3 (Learn / Listen / Say it, word + phrase variants).
- **Phase 2:** Screens 4–5 (Summary / Part complete) — includes the shared white-lip-button and chevron changes.

## `[LOCKED]` decisions

- Gold = reward/audio accent; red = single CTA per screen. (From the design's annotation notes.)
- "Got it" is reserved for the self-rating; the teach CTA is "Continue".
