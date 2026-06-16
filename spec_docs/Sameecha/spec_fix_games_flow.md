# Spec — Issue 3: games flow (per-part unlock + stuck games)

**Issue 3 of the app-wide flow audit (2026-06-16).** Two independent sub-fixes in
the games/practice flow, each with its own manual-test gate. They can ship and be
tested separately — do not bundle into one commit.

- **Phase A — per-part 1:1 unlock** (owner decided 2026-06-16): finishing lesson
  part `Nx` unlocks that game's part `Nx`.
- **Phase B — stuck game**: Image Match is permanently un-completable and must be
  made unreachable.

Related: [spec_game_subsection_split.md](spec_game_subsection_split.md) (the split
machinery this builds on), [spec_fix_lesson_unlock.md](spec_fix_lesson_unlock.md)
(Issue 2).

---

## Symptoms

1. Completed lesson part 1a, but **no games unlocked** for it.
2. Games unlock via the post-lesson "keep practising" buttons but **not in the
   Games (Practice) tab**.
3. Certain games **get stuck mid-game and never finish**.

---

## Phase A — Per-part 1:1 unlock

### Root cause

Three gates disagree, and none of them ties a game part to its lesson part:

| Gate | Current rule | File |
|---|---|---|
| Practice tab tiles | locked until a **whole** lesson done (`completedLessons.length > 0`) | `app/(tabs)/practice.tsx:88-89,138,155,163,179` |
| Games lesson picker | Lesson 1 **always** unlocked; lesson N needs N-1 whole lessons (`idx === 0 ? true : completed.length >= idx`) | `hooks/useLessons.ts:24-29` |
| Game sub-part chooser | game part `Nx` unlocks when the **game's own** previous part is done (`completedGameParts`), not when the lesson part is done | `src/games/shared/parts.ts:49-70,88-121` |

So after finishing only lesson part 1a: `completedLessons.length` is still 0 → the
Practice tab keeps every game locked (symptom 1 & 2), and even if reached, the game
chooser's unlock has nothing to do with lesson 1a being done.

### Target model (per-part 1:1)

The canonical section taxonomy (`1a`/`1b`/`1c`) is shared by lessons and games
(`lessonSectionsByNo`, game items carry a `section` column). Re-key all three gates
onto completed **lesson** parts:

- A game sub-part `Nx` is **unlocked** ⟺ the learner completed lesson part `Nx`
  (`completedParts` contains `${lessonSlug}:Nx`) **OR** the whole lesson is complete
  (`completedLessons` contains `lessonSlug` — covers single-section lessons, whose
  sole part is recorded as a whole-lesson completion, not a `completedPart`).
- A game sub-part `Nx` is **done** ⟺ `completedGameParts` contains `${gameKey}:Nx`
  (unchanged — "you cleared this game part").
- **Drop the game's own sequential prerequisite.** Lesson parts already complete in
  order (lesson chooser enforces it), so gating on lesson parts gives correct
  sequencing; once a whole lesson is done, all its game parts are freely playable.
- A lesson is **selectable in a game** ⟺ at least one of its parts is complete (or
  the whole lesson is). Lesson 1 is no longer "always unlocked".
- The **Practice tab** unlocks once the learner has completed any lesson part (or any
  whole lesson).

Overall-progress formula is untouched (stays lesson-level per
spec_game_subsection_split §6 — per-part state is a UX concern only).

### Changes

#### A1. `constants/lessons/lessonContent.ts` — add a slug-by-number helper

After `lessonSectionsByNo` (line 575):

```ts
/** Lesson slug for a lesson number, or null if unknown. */
export function lessonSlugByNo(lessonNo: number): string | null {
  return TS_LESSONS.find((l) => l.lessonNo === lessonNo)?.slug ?? null;
}
```

#### A2. `src/games/shared/parts.ts` — unlock from lesson parts, not game parts

`computePartStates` takes both "played" (done) and "lesson-done" (unlock) sets:

```ts
function computePartStates(
  sections: { key: string; label: string; count: number }[],
  playedKeys: ReadonlySet<string>,   // completedGameParts → `done`
  unlockedKeys: ReadonlySet<string>, // lesson parts done → `unlocked`
): GamePartState[] {
  let activeAssigned = false;
  return sections.map((s, i, arr) => {
    const done = playedKeys.has(s.key);
    const unlocked = unlockedKeys.has(s.key);          // 1:1 with lesson part
    const active = unlocked && !done && !activeAssigned;
    if (active) activeAssigned = true;
    return { key: s.key, label: s.label, count: s.count, index: i, done, unlocked, active, isLast: i === arr.length - 1 };
  });
}
```

`useGameSplit` reads lesson progress and builds `unlockedKeys`:

```ts
import { lessonSectionsByNo, lessonSlugByNo } from '@/constants/lessons/lessonContent';
// ...
export function useGameSplit<T extends Sectioned>(gameKey, lessonNo, items, section) {
  const completedGameParts = useProgressStore((s) => s.completedGameParts);
  const completedParts = useProgressStore((s) => s.completedParts);
  const completedLessons = useProgressStore((s) => s.completedLessons);

  const sections = useMemo(
    () => availableSections(lessonNo, (items ?? []).map((i) => i.section)),
    [lessonNo, items],
  );

  const parts = useMemo(() => {
    const slug = lessonSlugByNo(lessonNo);
    const lessonComplete = !!slug && completedLessons.includes(slug);
    const gamePrefix = `${gameKey}:`;
    const played = new Set(
      completedGameParts.filter((k) => k.startsWith(gamePrefix)).map((k) => k.slice(gamePrefix.length)),
    );
    // A whole-lesson completion backfills every section as unlocked; otherwise a
    // section is unlocked once its lesson part is complete.
    const unlocked = new Set(
      lessonComplete
        ? sections.map((s) => s.key)
        : slug
          ? completedParts
              .filter((k) => k.startsWith(`${slug}:`))
              .map((k) => k.slice(slug.length + 1))
          : [],
    );
    return computePartStates(sections, played, unlocked);
  }, [sections, completedGameParts, completedParts, completedLessons, gameKey, lessonNo]);

  // showChooser / playItems / activeSection unchanged.
}
```

> Single-section lessons (e.g. Lesson 4 `pointing`) run whole with no chooser; their
> game is reachable once that lesson is completed (whole-lesson completion path).
> `playItems`/`activeSection` logic is unchanged — only the part-state unlock source
> changes.

#### A3. `hooks/useLessons.ts` — lesson selectable once any of its parts is done

```ts
import { lessonSlugByNo } from '../constants/lessons/lessonContent';

export function useLessons(): LessonSelectorItem[] {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedParts = useProgressStore((s) => s.completedParts);
  return PLANNED_LESSON_SLOTS.map((slot) => {
    const slug = lessonSlugByNo(slot.slot);
    const unlocked =
      !!slug &&
      (completedLessons.includes(slug) ||
        completedParts.some((k) => k.startsWith(`${slug}:`)));
    return { n: slot.slot, glyph: slot.charPlaceholder, theme: slot.title, unlocked };
  });
}
```

(Removes the `idx === 0 ? true` always-unlock; Lesson 1 games now require lesson 1a.)

#### A4. `app/(tabs)/practice.tsx` — tab unlocks on first lesson part

```ts
const completedLessons = useCompletedLessons();
const completedParts = useProgressStore((s) => s.completedParts);  // new import
const hasUnlocked = completedParts.length > 0 || completedLessons.length > 0;
```

Update the empty-state copy (line 179) from "Finish Lesson 1 on the Learn tab to
unlock your games." to e.g. **"Finish a lesson part on the Learn tab to unlock your
games."**

### Phase A acceptance criteria

1. Brand-new account, finish lesson part 1a only → Practice tab tiles unlock; opening
   a game shows Lesson 1 selectable; its chooser shows **1a unlocked (play), 1b/1c
   locked**.
2. Finish lesson 1b → game part 1b becomes unlocked; 1c still locked.
3. Finish the whole of Lesson 1 → all of that lesson's game parts are playable in any
   order; Lesson 2 not selectable until at least Lesson 2 part 2a is done.
4. Single-section lesson (Lesson 4) → its game is reachable after that lesson is
   completed and runs whole (no chooser).
5. Post-lesson "keep practising" buttons and the Practice tab now reach the same,
   consistent unlock state.

### Phase A manual test (owner) — gate before Phase B

- [ ] Fresh account: before any lesson, Practice tab shows all games locked with the
      new copy.
- [ ] Finish lesson 1a → Practice unlocks; game → Lesson 1 → chooser shows 1a playable,
      1b/1c locked.
- [ ] Finish 1b, then 1c; confirm parts unlock one-for-one with lesson parts.
- [ ] Lesson 2 stays locked in the game picker until lesson 2a is done.

---

## Phase B — Stuck games

Two distinct stuck-game bugs. **B1 (Conversations) is the primary one the owner hit**
("the game wouldn't let me complete it — only after pressing the button repeatedly
does it continue, not immediately"). B2 (Image Match) is a separate dead game.

### B1 — Conversation game: advance button taps eaten by auto-scroll (PRIMARY)

#### Root cause

The current turn's NPC line types in **character-by-character**: `useTypewriter`
calls `setShown(...)` every `CHAR_MS = 35ms` until the line is fully revealed
(`src/games/conversations/hooks/useTypewriter.ts:28-35`). Each character grows the
chat transcript, changing the `ScrollView`'s content size, which fires
`onContentSizeChange → scrollRef.current?.scrollToEnd({ animated: true })`
(`src/games/conversations/ConversationGame.tsx:149`). So for the **entire ~1–3s
reveal of every turn**, the ScrollView issues a continuous stream of *animated*
scroll commands.

The action button (`Next ▸` / `See results`) is rendered **inside that same
ScrollView** (`ConversationGame.tsx:198-204`, inside the `<ScrollView>` opened at
147 and closed at 205). While an animated scroll is in flight, the ScrollView's
gesture responder intercepts/cancels touches on its children, so taps on the action
button **do not register** until the typewriter finishes and the scroll settles —
producing the "press repeatedly before it continues" symptom. It is **not** a DB
bug: the attempt write is fire-and-forget (`ConversationGame.tsx:125-130`,
`onError` only `console.warn`s) and never gates advancing.

(The option buttons can be eaten the same way mid-reveal, but they're disabled after
the first registered tap so the effect is most visible on the advance button.)

#### Fix

Take the action button **out of the scrollable area** so its taps are never subject
to the scroll responder, and stop the per-keystroke animated scroll from stealing
touches:

1. Move the `{answered && <LipButton … onPress={handleNext} />}` block out of the
   `ScrollView` into a fixed footer `View` beneath it (mirrors the footer pattern in
   `PartDoneCard` / `LessonPartChooser`). The transcript + options stay scrollable;
   the progress button is always a direct, interceptable target.
2. On the `ScrollView`, add `keyboardShouldPersistTaps="handled"` and change the
   auto-scroll to non-animated — `onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}` — so the rapid typewriter-driven scrolls don't run touch-stealing animations.

Either change alone reduces the symptom; doing both removes it (the footer move is
the decisive one). No change to `useConversation`/`useTypewriter` logic.

#### B1 acceptance criteria

1. Answering a turn and tapping `Next ▸` advances on the **first** tap, even while the
   next NPC line is still typing.
2. Tapping `See results` on the last turn opens the result screen first-tap;
   `Next conversation ▸` advances to the next scenario; finishing the last scenario
   shows "All caught up" and records `completeGamePart('conversations', section)`.

### B2 — Image Match: queries a dropped table (secondary)

#### Root cause

Image Match queries `image_match_items` — a table dropped from the DB
(`services/api/games/imageMatch.ts:62-67`). Every fetch throws → the runner sticks on
its error/loading state and can never complete. It's still wired in the runner switch
(`app/(games)/[game]/[n].tsx:11,37-38`) and reachable from the lesson-done screen,
where `DEFAULT_GAMES = Object.values(GAMES)` includes `image-match`
(`components/lesson/DoneCard.tsx:28,37`, rows at ~327). The Practice tab already
excludes it (`practice.tsx:35`).

`spec_game_subsection_split.md §5` calls for full Image Match removal; this does the
**minimal reachability fix now** and leaves the full code-delete to that spec.

#### Fix

- `components/lesson/DoneCard.tsx:28` — exclude image-match from the offered games:
  ```ts
  const DEFAULT_GAMES: Game[] = Object.values(GAMES).filter((g) => g.key !== 'image-match');
  ```
- (Optional cleanup) drop the `image-match` case + import in
  `app/(games)/[game]/[n].tsx:11,37-38`.

### Phase B manual test (owner)

- [ ] **Conversations**: play a scenario; tapping `Next ▸` advances first-tap while
      the next line types; finish all scenarios in a part → "All caught up" and the
      part shows a check in the chooser.
- [ ] Play quiz, dictation, opposites each to the end for a populated part → each
      reaches its finish screen and is marked done.
- [ ] Finish a lesson → on the done screen, no Image Match option appears.

---

## Notes / open

- Uneven content: if a game has no items for a completed lesson part, that part is
  hidden by `availableSections` (spec_game_subsection_split §3). A lesson whose only
  completed parts have no items in a given game will show an empty/all-locked chooser
  for that game — acceptable per the existing "hide empty parts" policy; flag if the
  owner wants a "coming soon" state instead.
- Overall-progress formula is **not** changed here (still lesson-level).
