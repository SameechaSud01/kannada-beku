---
doc: spec_nav_and_games_fixes
status: proposed
owner: samee
last-reviewed: 2026-06-02
related:
  - NAVIGATION.md
  - spec_db_wiring_games_and_overall_progress.md
  - spec_lesson_content_source.md
  - spec_home_fun_fact.md
---

# Navigation & games fixes

> **Decision layer.** `[LOCKED]` means decided — do not reopen or build the opposite. `[OPEN]` means genuinely undecided. `[PROPOSED]` is in this doc only — pending owner sign-off; once approved, promote to `[LOCKED]`.

Owns: two defects — the Home progress card opening a wrong/blank lesson, and verifying each game reveals the correct answer on a wrong response. Route tree and gating follow [NAVIGATION.md](../../docs/foundation/NAVIGATION.md).

---

## 1. Scope

`[PROPOSED]`

Triage issues #3 and #11. Out of scope: lesson-runner interactions (`spec_lesson_runner_ux.md`) and content correctness (`spec_content_integrity.md`).

---

## 2. Changes

### 2.1 Home lesson link opens wrong/blank lesson (#3)
`[PROPOSED]`

**Flow:** Home progress card → `router.push('/lesson/${nextLessonSlot.slug}')` ([index.tsx:107-108](../../app/(tabs)/index.tsx#L107-L108)) → [app/lesson/[id].tsx](../../app/lesson/%5Bid%5D.tsx) → `useDbLesson(slug)` → `fetchLessonBySlug`. The slug round-trips correctly and completion slugs share the DB slug format, so routing itself is sound.

**Hypotheses (confirm by reproduction):**
1. **Blank lesson** — the chosen "next" `lessons` row has an empty/under-seeded `content_json`, so `lesson.words`/`lesson.phrases` are empty and phases render nothing.
2. **Wrong lesson** — a stale/mismatched completion slug makes `dbLessons.find(l => !completedSlugSet.has(l.slug))` pick an unexpected row.

**Decision (D1):** Reproduce on device first (capture the slug + the rendered screen). Then:
- If (1): fix/complete the seed `content_json` (coordinate with `spec_content_integrity.md`) **and** guard Home so `nextLessonSlot` only selects lessons whose content is non-empty (don't offer a blank lesson).
- If (2): correct the completion-slug source so "next" is computed from matching slugs.

This item is **not declared done without an on-device check** (CLAUDE.md).

### 2.2 Games show the correct answer (#11)
`[PROPOSED]`

**Today:** Reveal logic already exists in all three games — Opposites/ImageMatch mark the correct option with a `reveal` state, Dictation's `FeedbackCard` prints the correct Kannada word. So this may already be satisfied.

**Decision (D2):** Verify each game on device. If a specific game fails to reveal the correct answer on a wrong response, fix only that game to match the established `reveal` pattern. If all three already reveal correctly, close this item as verified (no code change) and note it.

> **TODO (needs owner input):** which game looked like it wasn't showing the correct answer? Without this, §2.2 is a verification-only pass.

---

## 3. Acceptance criteria

`[PROPOSED]`

- Tapping the Home progress card opens the **correct** next lesson, fully rendered (non-empty phases); a blank lesson is never offered.
- On a wrong answer, each of Opposites, ImageMatch, and Dictation visibly reveals the correct answer.

---

## 4. Verification

`[PROPOSED]`

Run on iOS sim. Tap the Home card from a fresh and a partially-completed progress state → confirm the right, fully-rendered lesson opens. In each game, answer one question wrong → confirm the correct answer is highlighted/printed. Screenshot Home + one wrong-answer state per game.
