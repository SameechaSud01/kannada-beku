---
doc: spec_quick_quiz_runner
status: proposed
owner: samee
last-reviewed: 2026-06-02
related:
  - spec_db_wiring_games_and_overall_progress.md
  - CONTENT.md
  - STATE.md
---

# Quick Quiz — mixed, timed MCQ runner

> **Decision layer.** `[LOCKED]` = decided. `[OPEN]` = undecided. `[PROPOSED]` = pending owner sign-off.

Builds the `quiz` game (currently a `ComingSoon` stub). Owner-approved mechanic (2026-06-02): rapid multiple-choice from learned vocab, alternating Kannada→English and English→Kannada meaning questions, with a per-question countdown timer.

---

## 1. Scope

`[PROPOSED]`

New game runner + its own per-item table/RPC/progress. **Explicitly excluded from `user_overall_progress`** (that formula is `[LOCKED]` to opposites/dictation/image_match). Quick Quiz records per-item history for its own future surfaces only — **no trigger** on `recompute_overall_progress`, and its mutation hook does **not** invalidate `['overall-progress', userId]`.

---

## 2. Mechanic

`[PROPOSED]`

- Round of 8–10 questions drawn from the lesson's vocab, directions alternating kn→en / en→kn.
- Each question: 1 correct answer + 3 distractors (sampled in the answer's language), shuffled.
- A per-question countdown timer runs; **timeout = wrong answer + auto-reveal**.
- On any answer (or timeout): reveal the correct option, freeze the timer, require **Next** to advance (consistent with Opposites/Image Match).
- Score = count of correct, first-try answers. Result screen reuses the opposites-style screen.

### Data source (resolved)
`[PROPOSED]` New table **`quick_quiz_items`** seeded from `lessons.content_json.reference.words` (L1–L6), 8–10 words/lesson. Rejected: reusing `image_match_items` (concrete-nouns only, too sparse) and raw `content_json` (no stable per-item id for progress). This keeps the DB-source-of-truth + per-item-progress pattern uniform with the other games.

---

## 3. DB plan

`[PROPOSED]` New migration `services/api/migrations/2026-06-02_quick_quiz.sql` (+ companion seed), idempotent, mirroring `2026-05-27_db_wiring_games_and_overall.sql`:
- `quick_quiz_items(id, lesson_id fk lessons, sort_order, kannada, transliteration, meaning)`, unique `(lesson_id, sort_order)`.
- `quick_quiz_progress(user_id, item_id, is_correct, attempts, last_played)`, pk `(user_id, item_id)`.
- RLS: items `select` for authenticated; progress `select/insert/update` own, no delete.
- RPC `record_quick_quiz_attempt(p_item_id, p_is_correct)` — SECURITY INVOKER, OR-merge personal-best (verbatim copy of `record_opposites_attempt`).
- **NO trigger on `recompute_overall_progress`** — SQL comment states the intentional exclusion.
- Seed: deterministic `uuid_generate_v5` from `(quick_quiz, lesson_no, sort_order)`.

---

## 4. App plan

`[PROPOSED]`
- `services/api/games/quickQuiz.ts` (copy `opposites.ts` shape).
- `hooks/games/quickQuiz.ts` (`useQuickQuizItems` 1h stale; `useRecordQuickQuizAttempt` — no overall-progress invalidation).
- `src/games/quickquiz/`: `QuickQuizGame.tsx` (loader+inner, neighbor-lesson distractor fetch), `hooks/useQuickQuiz.ts` (timer + alternating direction), `utils/roundBuilder.ts`, `components/{QuizPrompt,TimerBar,QuizOptionGrid,QuizOptionButton}.tsx`, `types.ts`, `index.ts`.
- Wire `app/(games)/[game]/[n].tsx`: `case 'quiz': return <QuickQuizGame lessonNo={lessonNo} />;`.

---

## 5. Acceptance criteria

`[PROPOSED]`
- Questions alternate kn→en / en→kn; 4 options each.
- Timer counts down; a timeout auto-reveals as wrong; a wrong pick reveals the correct answer.
- Result screen shows score/total. Attempt round-trips to `quick_quiz_progress`.
- `user_overall_progress.recomputed_at` is **unchanged** after playing Quick Quiz.
- Migration runs cleanly twice; RLS denies cross-user progress reads.

---

## 6. Verification

On-device per CLAUDE.md. Play a lesson; let one question time out, answer one wrong, finish. Screenshot a question (timer visible) + a reveal state + result. Confirm `quick_quiz_progress` row and unchanged `user_overall_progress`.
