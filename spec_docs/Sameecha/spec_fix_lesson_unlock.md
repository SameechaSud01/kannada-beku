# Spec — Issue 2: lesson-to-lesson unlock ("one part unlocks Lesson 2")

**Issue 2 of the app-wide flow audit (2026-06-16).** Verdict: **no code change** — the reported bug does not reproduce against the committed code. This doc records the investigation so the question is closed.

## Reported symptom

"Lessons are split into 3 sub-sections (1a/1b/1c). Lesson 2 should only unlock after finishing Lesson 1 a, b, and c — but finishing only one part of Lesson 1 unlocks Lesson 2."

## Investigation

Traced the full lesson-unlock chain on branch `final_UI_UX` (sub-part machinery landed in commit `524f2b0`):

1. **Lesson 1 (`greetings`) genuinely has 3 sections** — 1a/1b/1c — `constants/lessons/lessonContent.ts:68-105`. (All lessons have 3 sections except Lesson 4 `pointing`, which has 1.)
2. **Opening a multi-section lesson always shows the chooser** — `app/lesson/[id].tsx:67`. The chooser **disables locked parts**: `onPress={() => part.unlocked && onSelectPart(...)}`, locked rows rendered `disabled` — `components/lesson/LessonPartChooser.tsx:83,196-211`.
3. **Parts unlock strictly sequentially** — `computePartStates`: part *i* unlocks only once part *i-1* is done — `constants/lessons/parts.ts:34`.
4. **Whole-lesson completion fires only on the last part** — the `DoneCard` (the only caller of `completeLesson`) renders only when the part run is the last part; intermediate parts get the presentational `PartDoneCard`, which records nothing — `app/lesson/[id].tsx:161-174`.
5. **Next-lesson unlock reads `completedLessons.length`** — `app/(tabs)/learn.tsx:69-79` — and `completedLessons` is written **only** by full-lesson completion (`completeLesson`, `hydrateFromServerCompletions`), never by `completePart` — `stores/progressStore.ts:156-187`.

### Conclusion

To reach part 1c you must finish 1a then 1b (chooser enforces it), and only finishing 1c marks Lesson 1 complete. A single part can never push Lesson 1's slug into `completedLessons`. **The literal "one part unlocks Lesson 2" cannot happen in this code.** The original audit's "jump straight to part c" theory was wrong — it assumed the chooser allowed selecting locked parts; it does not.

The owner's one-time sighting was most likely stale client state from a build predating the sub-part chooser, or carried-over server progress on a reused account. Confirmed during audit that the concern the owner actually cares about is **games not unlocking after a lesson part** — tracked in [spec_fix_games_flow.md](spec_fix_games_flow.md) (Issue 3), not here.

## Decision

- **No change to lesson unlock logic.** Rewriting working sequential-unlock code would only risk regressions.
- If the symptom recurs, capture: exact account, which screen showed Lesson 2 unlocked (Learn tab vs. games picker — different code paths), and `completedLessons` / `completedParts` store contents at that moment.

## Out of scope

The games' lesson picker (`hooks/useLessons.ts`) uses a *different* unlock rule and is the real source of the owner's "1a done, nothing unlocked" report — addressed in the Issue 3 spec.
