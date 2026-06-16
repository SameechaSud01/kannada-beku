# Spec — Issue 4: Home ↔ Profile progress sync

**Issue 4 of the app-wide flow audit (2026-06-16).** Fixed in isolation; do not bundle
with the onboarding, lesson, or games fixes.

## Symptom (from owner screenshots, 2026-06-16)

Same account, same moment — **and lesson part 1a has been completed**:

| | Home | Profile |
|---|---|---|
| Daily rings | Listen **12/10**, Speak **4/8**, Practice **11/10** | — |
| Streak | **0** | **0** |
| Words learnt | **0** | **0** |
| Lessons done | (Continue card → "Lesson 1 · Greetings") | **0** |
| Overall progress | — | **0%** |

The learner has clearly done ~27 in-app actions today (the rings prove it) **and
finished lesson part 1a**, yet **streak, words, and overall % all read 0** on both
screens. Two separate gaps cause this: (1) activity is counted only in the Home daily
rings and feeds nothing else; (2) completing a lesson *part* credits no progress at
all.

> Note: **Lessons done = 0 is correct** — 1a is one of Lesson 1's three parts; a whole
> lesson isn't complete until 1a+1b+1c. The wrong-looking values are **Streak** and
> **Words learnt**, which should both reflect the work done on 1a.

## Root cause

There are two parallel, disconnected tracks in the progress store:

1. **Daily-activity counters** → the Home rings. `recordListen` / `recordSpeak` /
   `recordPractice` each only bump `dailyActivity` via `bumpDaily`
   (`stores/progressStore.ts:214-216`). Fired all over the app — lesson practice
   phases (`components/lesson/PracticeWordsPhase.tsx:108`,
   `PracticePhrasesPhase.tsx:106`) and every game
   (`src/games/opposites/hooks/useGameState.ts:94`,
   `src/games/dictation/hooks/useDictationGame.ts:141`,
   `src/games/dictation/utils/audioPlayer.ts:10`,
   `src/games/conversations/hooks/useConversation.ts:54`).

2. **Streak + weekly-activity** → the streak pill (both screens' TopBar) and the
   StreakDetail week-dots. `updateStreak()` and `recordActivity()` are called in
   **exactly one place**: `hooks/useCompleteLessonMutation.ts:51-52`, i.e. only on
   **full lesson completion**.

Because the two tracks never meet, doing activity without completing a whole lesson
fills the rings but leaves `streak`, `weeklyActivity`, `totalPhrasesLearned`,
`completedLessons`, and the DB overall % all at 0. The owner hadn't finished Lesson 1
(Continue card still points at it), so every completion-gated metric is 0 while the
rings are full — which reads as "Home and Profile disagree."

### Second gap — completing a lesson *part* credits no progress

`completePart` only appends the unlock key; it touches nothing else
(`stores/progressStore.ts:156-161`). Words are credited **all at once on whole-lesson
completion**: `DoneCard` passes `phrasesLearned = lesson.words.length +
lesson.phrases.length` to `completeLesson` (`components/lesson/DoneCard.tsx:45-68`),
and `DoneCard` only mounts on the **last** part (`app/lesson/[id].tsx:161-174`). So
finishing 1a (or 1b) adds **0** words and never marks the day active.

### Why each 0 happens

- **Streak 0** — `completePart` doesn't call `updateStreak()`, and the owner wants the
  streak to count *learning* days, so it must fire on part completion. **Core bug.**
- **Words 0** — `completePart` credits no words; the whole-lesson credit hasn't fired
  because 1b/1c aren't done yet. Should credit 1a's words now.
- **Lessons done 0** — **correct**: a whole lesson isn't complete after one part.
- **Overall 0%** — DB formula is whole-lesson/`record_*_attempt`-gated and ignores
  client per-part state. Replaced by a client-side part-aware % that climbs from 1a.

## Fix

### Primary — streak counts lesson-learning days only

**Owner decision (2026-06-16): the streak counts a day only if a lesson is *learnt*
that day — i.e. a lesson part (or whole lesson) is completed.** Games, dictation,
listening, and practice reps do **not** advance the streak (they still fill the daily
rings, which stay a separate "today's activity" surface).

So the streak/week-dot trigger lives on **lesson-part completion**, not on
`recordListen/Speak/Practice`. `markActiveToday` is added as a store helper and called
from the lesson-part completion path (next subsection):

```ts
// stores/progressStore.ts — shared "a lesson was learnt today" step.
markActiveToday: () => {
  get().updateStreak();     // streak: 0 → 1 on the day's first learnt part
  get().recordActivity();   // weeklyActivity[today] = true → week-dot fills
},
```

`updateStreak()` is idempotent per day (early-returns when `lastActiveDate === today`,
`progressStore.ts:193`), so multiple parts in one day count once. `completeLesson`
keeps its existing `updateStreak()`/`recordActivity()` calls (redundant-but-harmless
for multi-section lessons whose parts already marked the day; the real trigger for
single-section lessons).

> **Do NOT** route `recordListen/Speak/Practice` through `markActiveToday` — that would
> make games advance the streak, which the owner explicitly does not want.

### Primary — part completion credits its words (and marks the day learnt)

`completePart` should credit the words/phrases the learner just finished, idempotently.
The existing `completedParts.includes(key)` early-return makes this naturally
once-only. Pass the section's item count from the lesson screen (which already has
`runner.section`) so the store stays content-agnostic:

```ts
// stores/progressStore.ts — completePart gains an itemsLearned arg
completePart: (slug, partKey, itemsLearned = 0) =>
  set((state) => {
    const key = `${slug}:${partKey}`;
    if (state.completedParts.includes(key)) return state;   // idempotent
    return {
      completedParts: [...state.completedParts, key],
      totalPhrasesLearned: state.totalPhrasesLearned + itemsLearned,
    };
  }),
```

```ts
// app/lesson/[id].tsx — pass the part's word+phrase count, and mark the day active
useEffect(() => {
  if (runner.phase === 'done' && isPartRun && lesson && part) {
    const items = sectionWords.length + sectionPhrases.length;   // already in scope (lines 86-87)
    completePart(lesson.slug, part, items);
    useProgressStore.getState().markActiveToday();               // streak + week-dot
  }
}, [runner.phase, isPartRun, lesson, part, completePart, sectionWords, sectionPhrases]);
```

**Avoid double-counting at whole-lesson completion.** For a multi-section lesson, each
part already credited its slice (their sum equals the whole lesson, since
`flattenSections` concatenates sections). So `DoneCard` must not re-credit. Single-
section lessons have no parts and keep the whole-lesson credit:

```ts
// components/lesson/DoneCard.tsx — runSave()
phrasesLearned: lesson.sections.length > 1 ? 0 : itemsLearned,
```

Effect: finishing 1a immediately bumps "Words learnt" by 1a's item count on both
screens, and finishing the whole lesson totals to the same number as before — no
double count, no regression for single-section lessons.

### Primary — client-side, part-aware overall % (single source of truth)

**Owner decision (2026-06-16): overall % is computed on the client from granular
progress so it climbs from the first completed part**, instead of the DB
`recompute_overall_progress` value (which stays 0% through all of Lesson 1's parts and
demotivates). The DB row is kept as a backend/analytics figure but is **no longer the
number shown** — removing the staleness/focus-refetch problem entirely (one client
value, instant, identical on Home and Profile).

New shared hook, the single source both screens read:

```ts
// hooks/useLocalProgress.ts
import { useProgressStore } from '../stores/progressStore';
import { TS_LESSONS } from '../constants/lessons/lessonContent';

// Static curriculum size: every section of every lesson is one "lesson unit".
// (22 today: 7 lessons × 3 parts + Lesson 4 × 1.)
const TOTAL_LESSON_UNITS = TS_LESSONS.reduce((n, l) => n + l.sections.length, 0);
const MULTI_SECTION_SLUGS = new Set(TS_LESSONS.filter((l) => l.sections.length > 1).map((l) => l.slug));

/** 0–100 overall progress, lesson-parts as the backbone + a bounded games-practice term. */
export function useOverallProgressPct(): number {
  const completedParts = useProgressStore((s) => s.completedParts);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedGameParts = useProgressStore((s) => s.completedGameParts);

  // Single-section lessons never record a completedPart — count each as one unit.
  const singleSectionDone = completedLessons.filter((slug) => !MULTI_SECTION_SLUGS.has(slug)).length;
  const lessonUnitsDone = Math.min(TOTAL_LESSON_UNITS, completedParts.length + singleSectionDone);

  const lessonsFrac = lessonUnitsDone / TOTAL_LESSON_UNITS;                 // the backbone
  // Games reinforce learnt parts; bound by parts learnt so the denominator
  // needs no content fetch and the term can't exceed 1.
  const gamesFrac = lessonUnitsDone > 0
    ? Math.min(1, completedGameParts.length / lessonUnitsDone)
    : 0;

  return Math.round(100 * (0.7 * lessonsFrac + 0.3 * gamesFrac));          // weights tunable
}
```

- **Profile** (`profile.tsx:35-36`): replace `useOverallProgress()` with
  `useOverallProgressPct()`; drop the `overall.isLoading` "—" branch (it's synchronous
  now).
- **Home**: optionally surface the same value as a small "Overall progress" bar so the
  home screen isn't only rings — directly addresses "all other stats feel empty." Reuse
  the exact same hook so the two screens can never disagree.
- `useOverallProgress` (the DB query) is **retained** for analytics/back-compat but no
  longer drives UI; its misleading "Refetched on focus" comment should be corrected or
  the hook left unused.

> Weights (`0.7` lessons / `0.3` games) and whether to include the games term at all
> are tunable — if the owner wants a pure lesson-mastery bar, set games weight to 0 and
> relabel "Lessons + games combined" → "Lessons". Reaching 100% requires all
> `TOTAL_LESSON_UNITS` parts done (and, with the games term, each learnt part practised
> at least once across the games).

### Secondary — lessons-done count parity

Profile reads `useCompletedLessons().length` raw (`profile.tsx:34`); Home clamps to
`TOTAL_LESSON_SLOTS` (`index.tsx:79`). They agree today (only 8 real slugs ever land in
`completedLessons`) but diverge if a 9th slug appears. Clamp Profile too:

```ts
const lessonsDone = Math.min(useCompletedLessons().length, TOTAL_LESSON_SLOTS);
```

## Out of scope (flag for a separate decision)

- **DB overall-progress formula.** The server `recompute_overall_progress` value
  (still the 2-game image-match-era formula) is left as-is for analytics; it just stops
  driving the UI. Re-aligning it to the new client model (or the 4-game
  `spec_game_subsection_split.md §6` formula) is a separate owner-run DB task.
- **Lessons done** stays a whole-lesson count (1a alone does not increment it) — this
  is intended, not a bug.

## Acceptance criteria

1. **Streak counts learning only.** Completing a lesson part (or whole lesson) sets the
   streak to ≥1 and fills today's StreakDetail week-dot, on both Home and Profile.
   Playing games / practice / listening alone does **not** advance the streak (rings
   move, streak does not).
2. Finishing lesson part 1a bumps "Words learnt" by 1a's item count on both screens,
   and sets the streak ≥1.
3. Finishing all of Lesson 1 totals "Words learnt" to the full lesson's item count
   (same as before the change) — no double-count.
4. Single-section lessons (e.g. Lesson 4) still credit their words on completion.
5. **Overall % climbs from the first part**, is computed client-side, and is identical
   on Home and Profile (no stale lag); it is no longer 0% after 1a.
6. Profile and Home report the same lessons-done count.

## Manual test (owner)

- [ ] Fresh day, streak 0, words 0, overall 0%. Play a game / practice only (no
      lesson) → rings move but streak stays 0 and overall stays 0% (games don't count
      toward streak/learning).
- [ ] Complete lesson part 1a → "Words learnt" goes from 0 to 1a's item count on Home
      **and** Profile; streak → 1 on both; StreakDetail today-dot filled; overall %
      ticks up (no longer 0%).
- [ ] Finish 1b and 1c → words total to the whole-lesson count (no double count);
      "Lessons done" becomes 1; streak unchanged (already counted today); overall %
      climbs further.
- [ ] Home and Profile show the **same** overall % at every step.
- [ ] A single-section lesson still credits its words and advances the streak on
      completion.
