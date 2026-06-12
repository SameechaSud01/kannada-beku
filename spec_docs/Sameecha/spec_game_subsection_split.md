---
doc: spec_game_subsection_split
status: proposed
owner: samee
last-reviewed: 2026-06-12
related:
  - spec_lesson_content_source.md
  - spec_db_wiring_games_and_overall_progress.md
  - spec_quick_quiz_runner.md
  - spec_conversations_runner.md
  - STATE.md
  - CONTRADICTIONS.md
---

# Games — sub-section split with 1-to-1 lesson linking

> **Decision layer.** `[LOCKED]` = decided. `[OPEN]` = undecided. `[PROPOSED]` = pending owner sign-off.

Extends the lesson sub-part split (commit `524f2b0`, 2026-06-10) to the games.
Each game is broken into the **same** sub-sections as its lesson (1a / 1b / 1c …),
with a per-game chooser, sequential unlock, and per-part progress — exactly
mirroring the lesson runner. A game's part 1a covers the **same** words/phrases
as lesson part 1a.

This spec also **removes the Image Match game** from the codebase (owner
decision, 2026-06-12), continuing the direction of
[2026-06-10_c13_drop_image_match_from_overall.sql](../../services/api/migrations/2026-06-10_c13_drop_image_match_from_overall.sql).

---

## 1. Scope

`[PROPOSED]`

**In scope**
- Remove Image Match entirely (game runner, route, hooks, API, constants, tests, practice card).
- Add a `section` linking key to every remaining game's item table.
- Make each game's fetch/hook section-aware.
- A `GamePartChooser` + `part` route param, mirroring the lesson sub-part chooser.
- Per-part game-completion progress + sequential unlock.

**Games covered (4, after Image Match removal)**
opposites · dictation · quiz · conversations.

**Also in scope**
- Rewrite the overall-progress formula to **4 games**: remove Image Match, add quiz + conversations (see §6). Both already have seeded items, `*_progress` tables, and `record_*_attempt` RPCs — they are only missing the recompute trigger and a formula term.

**Out of scope**
- No change to the lesson runner or lesson content.
- Authoring/verifying *additional* game content to fill empty sections is a **separate owner task** (see §7); this spec builds the machinery and degrades gracefully where content is missing.

---

## 2. The linking model

`[LOCKED — pending sign-off]`

**Single source of truth for "what is in 1a" stays the lesson.** Lesson sections
live in [constants/lessons/lessonContent.ts](../../constants/lessons/lessonContent.ts)
as `LessonSection { key, label, words, phrases }`
([types.ts](../../constants/lessons/types.ts)). Section keys (`"1a"`, `"1b"`, …)
are the canonical taxonomy. Games do **not** redefine sections — they tag their
items with the lesson's existing section keys.

**The link is a `section text` column** on each game item table. Value = a lesson
section key (`"1a"`), or the lesson's sole section key for single-section lessons
(those run whole, no chooser — same rule as lessons, which only show the chooser
when `sections.length > 1`).

Why a column and not text-matching at runtime: matching a game item's Kannada to a
section's word list is fragile (transliteration drift, opposites using non-lesson
vocab). The column is authored once, then the link is data, not a heuristic.

```sql
-- Phase 1 migration (owner-run; DDL via dashboard, anon key cannot run DDL)
ALTER TABLE public.opposites_items     ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.dictation_items     ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.quick_quiz_items    ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.conversation_scenarios ADD COLUMN IF NOT EXISTS section text;  -- section on scenario, not turn
```

Backfill for existing seeded rows is a generated migration of `UPDATE … SET
section = …` statements, computed offline by matching each item's Kannada against
the lesson's section word lists. **Opposites assignments need owner review** —
its pairs draw on non-lesson vocab, so some rows have no clean section home and
are assigned by the section where the concept is taught.

---

## 3. Empty / missing sections

`[PROPOSED — defaulted to Hide]`

After Image Match removal the remaining games are still uneven (dictation may not
cover every section; quiz/conversations are unseeded). Policy:

**Hide empty game-parts.** A game's chooser lists only sections that have ≥1 item
*for that game*. A game may therefore show fewer parts than its lesson until
content is seeded. If a lesson resolves to a single populated section for a game,
that game runs whole (no chooser), exactly like a single-section lesson. No dead
ends, no inert "coming soon" tiles.

> Owner answered the empty-part question with "remove image match" — which removes
> the worst offender but not the general case. Defaulting the residual policy to
> **Hide** (the recommended option). Flag here if you'd rather show greyed
> "coming soon" tiles instead.

---

## 4. Code changes (mirrors the lesson split)

`[PROPOSED]`

### 4.1 API / hooks — section-aware
Each game's fetch fn + hook gains an optional `section`:
- `services/api/games/{opposites,dictation,quickQuiz,conversations}.ts` — add
  `.eq('section', section)` when `section` is provided; omit for whole-lesson (back-compat).
- `hooks/games/*` — `useXItems(lessonNo, section?)`, section folded into the query key.
- New shared helper `lessonSectionsByNo(lessonNo): { key, label }[]` sourced from
  `lessonContent.ts`, reused by the chooser.

### 4.2 Progress + unlock logic
- [stores/progressStore.ts](../../stores/progressStore.ts): add `completedGameParts: string[]`
  keyed `"<gameKey>:<slug>:<sectionKey>"`, an idempotent
  `completeGamePart(gameKey, slug, sectionKey)`, and clear it in `reset`. Client-only,
  same rationale as `completedParts`.
- Generalize [computePartStates](../../constants/lessons/parts.ts) into a shared
  `computeSectionStates(sections, doneSet, itemCounts?)` reused by lessons **and**
  games. Games pass per-section item counts so empty sections are excluded (§3).
- New `useGameParts(gameKey, lessonNo)` hook → `PartState[]`.

### 4.3 Chooser UI + routing
- New `components/games/GamePartChooser.tsx`, a near-copy of
  [LessonPartChooser.tsx](../../components/lesson/LessonPartChooser.tsx) (section grid,
  sequential unlock, lock/play/check, "X of Y parts done"); title = lesson theme + game title.
- [app/(games)/[game]/[n].tsx](../../app/(games)/[game]/[n].tsx): add an optional
  `part` param. >1 populated section + no `part` → render `GamePartChooser`; else
  pass `section` to the runner. Single-section lessons run whole.
- Each game runner accepts an optional `section` prop, threads it to its items hook,
  calls `completeGamePart` when its run finishes, and shows an intermediate
  "continue to next part" handoff vs. final celebration (mirroring
  [PartDoneCard](../../components/lesson/PartDoneCard.tsx)).

---

## 5. Image Match removal

`[PROPOSED]`

Delete from the codebase:
- `src/games/imagematch/` (whole dir: runner, board, hooks)
- `services/api/games/imageMatch.ts`, `hooks/games/imageMatch.ts`
- `__tests__/imagematch/useImageMatchBoard.test.ts`
- `image-match` case in [app/(games)/[game]/[n].tsx](../../app/(games)/[game]/[n].tsx)
- `'image-match'` from `GameKey` + the `GAMES` entry in
  [constants/games.ts](../../constants/games.ts)
- The Image Match card in [app/(tabs)/practice.tsx](../../app/(tabs)/practice.tsx)
- Its icon in [constants/icons.ts](../../constants/icons.ts) if otherwise unused
- Image-match references in [services/api/overall.ts](../../services/api/overall.ts)

**Past migrations are history — not deleted.** Dropping the `image_match_items`
table is an *optional* owner-run cleanup (the table is harmless if left); the
overall-progress formula is already updated by the existing `c13` migration.

---

## 6. Overall-progress formula — move to 4 games

`[PROPOSED — needs owner confirmation]`

History of this `[LOCKED]` formula: 3 games (opposites/dictation/image_match,
2026-05-27) → 2 games (`c13` dropped image_match, 2026-06-10). This spec moves it
to **4 games**: remove image_match for good, **add quiz + conversations**. quiz and
conversations were `[LOCKED]`-excluded by
[spec_quick_quiz_runner.md](spec_quick_quiz_runner.md) and
[spec_conversations_runner.md](spec_conversations_runner.md) ("NO trigger on
recompute_overall_progress") — this spec **reverses** those exclusions now that both
are seeded and live.

**Proposed formula** (lessons 50% + 4 games × 12.5%):

```
progress_pct = 50 * (lessons_done       / 8)
             + 12.5 * (opposites_done    / 8)
             + 12.5 * (dictation_done    / 8)
             + 12.5 * (quiz_done         / 8)
             + 12.5 * (conversations_done / 8)
```

Subgame-cleared rule unchanged: ≥80% of that lesson's items `is_correct`
(personal-best), capped at 8 subgames. Roll-ups:
- opposites / dictation / quiz: items carry `lesson_id` directly.
- **conversations**: `conversation_items` has no `lesson_id` — join
  `conversation_items → conversation_scenarios` on `scenario_id` to reach
  `lesson_id`, then apply the same ≥80% rule.

Required DB work (owner-run migration, pairs with §5):
- Rewrite `recompute_overall_progress` with the 4-game formula above.
- Drop the image_match term + its trigger (already done by `c13`; the new migration
  supersedes `c13`).
- **Add** `trg_qq_recompute_overall` on `quick_quiz_progress` and
  `trg_conv_recompute_overall` on `conversation_progress` (neither exists today).
- Backfill: recompute every user with progress.

Record the formula change (2 → 4 games) and the reversed quiz/conversations
exclusions in [CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md).

**Decision still needed:** does part-level completion change the formula? Proposed:
**no** — overall progress stays lesson-level (a subgame = a whole lesson's items at
≥80%). Per-part state is a client-side progression/UX concern only.

---

## 7. Content dependency (owner)

`[OPEN]`

True 1-to-1 coverage — every lesson section populated in every covered game — is
seed/curation work requiring native-speaker verification (existing seed carries
`verified: false`). All 4 games are seeded today, but unevenly across sections;
the `section` backfill (§2) tags what exists and the chooser hides gaps (§3).
Filling thin sections is tracked separately. Highest-value first: dictation
(already aligned), then opposites curation (non-lesson vocab), then topping up
quiz + conversations per section.

---

## 8. Phases (manual-test gate after each)

1. **DB** — two owner-run migrations: (a) `section` column + backfill on the 4 game tables / scenarios (you review opposites); (b) 4-game formula rewrite + quiz/conversations triggers (§6). Gate: no item has null `section`; overall progress can reach 100%.
2. **API/hooks** — section-aware fetch + `lessonSectionsByNo`.
3. **Progress + part-state** — `completedGameParts`, `computeSectionStates`, `useGameParts`.
4. **Chooser + routing + runners** — `GamePartChooser`, `part` param, per-runner threading.
5. **Image Match removal + docs** — delete footprint (§5), update STATE.md / CONTRADICTIONS.md.

---

## 9. Acceptance criteria

`[PROPOSED]`

1. Opening a multi-section game-lesson shows a part chooser matching the lesson's section keys/labels.
2. Game part `Nx` plays exactly the items linked (`section = 'Nx'`) to lesson part `Nx`.
3. Parts unlock sequentially; finishing the last part celebrates and records completion.
4. Empty game-parts are hidden; a single-populated-section lesson runs whole.
5. Image Match is absent from the app, routes, constants, and tests; the suite passes.
6. Overall progress counts lessons + opposites + dictation + quiz + conversations (image_match gone), and can reach 100%.
