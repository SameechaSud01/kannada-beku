---
doc: CONTENT
status: reviewed
owner: samee
last-reviewed: 2026-06-01
related:
  - SCOPE.md
  - DESIGN.md
  - INTERACTIONS.md
---

# Content

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Owns: curriculum structure, vocabulary schema, audio / asset conventions, **and** all user-facing copy strings.

## Curriculum overview

`[LOCKED]` — format and slot count.

**Format:** scenario-based lessons. Each lesson grounds Kannada in a real Bengaluru situation rather than teaching abstract vocab.

**Volume:** 8-slot curriculum defined in [plannedLessons.ts](../../constants/lessons/plannedLessons.ts). 2 lessons implemented; 6 to write.

**Reference primer outside the curriculum:** "Lesson 0 — Basics" is a non-scenario reference surface (Kannada vowels, consonants, pronunciation rules) shown once during onboarding and re-enterable from `/(tabs)/learn`. It lives in `public.lessons` (`lesson_no = 0`, `slug = 'basics'`) for content storage but is **not** a curriculum slot: no `situation`, no drills, no scoring, excluded from `completedLessons` / streak / XP / `user_overall_progress`. See [spec_beginners_guide](../../spec_docs/Sameecha/spec_beginners_guide.md).

### Lesson slots

`[LOCKED]` — slot titles, subtitles, and char placeholders match [plannedLessons.ts](../../constants/lessons/plannedLessons.ts). Slot 0 is the reference primer (separate row above; not a curriculum slot).

| Slot | Title | Subtitle | Char | Status |
|---|---|---|---|---|
| 0 | Kannada basics | Vowels, consonants, how to read it | — | TODO — see [spec_beginners_guide](../../spec_docs/Sameecha/spec_beginners_guide.md) |
| 1 | Greetings | Hello and how are you | ನ | ✅ Implemented |
| 2 | Names | I, you, my name is | ಹ | ✅ Implemented |
| 3 | Wanting | I want, I don't want | ಬೇ | TODO |
| 4 | Pointing | This, that, here, there | ಇ | TODO |
| 5 | Easy verbs | Come, eat, laugh | ಬ | TODO |
| 6 | Questions | Who, what, where | ಯಾ | TODO |
| 7 | Hard verbs | See, do, play | ನೋ | TODO |
| 8 | Putting it together | Combining what you've learned | ಸ | TODO |

## Lesson schema

`[LOCKED]` — types in [lessons/types.ts](../../constants/lessons/types.ts). Every lesson is a `Lesson`:

```ts
type Lesson = {
  id: LessonId;
  situation: {
    title: string;
    setup: string;             // 1–2 sentence framing
    imageKey: ImageKey;
    realWorldPrompt: string;   // e.g. "Try this in your next auto"
  };
  intake: Phrase[];            // 2–4 new phrases (STRICT MAX)
  drill: DrillItem[];          // 5–8 items
  output: {
    driverLine: Phrase;
    expectedResponse: Phrase;  // may contain [name] placeholder
  };
  resurfaces: PhraseId[];      // phrases from prior lessons to interleave
};
```

### Authoring rules (spec-leads-code — content must conform)

`[LOCKED]`

- **2–4 phrases per `intake`.** More than 4 = cognitive overload. Less than 2 = not enough material.
- **5–8 practice items per section.** Use the multiple-choice `AnswerOption` formats (listen-and-pick / translate-and-pick). The `fill_blank` drill type was never built and is **not** an authoring option — it was removed from the type union with the lesson-flow redesign (CONTRADICTIONS C7).
- **`output.expectedResponse` must be reachable** from `intake` — no surprise vocab.
- **`resurfaces`** carries phrases forward from earlier lessons to keep them alive (spaced-repetition seed).
- **`vocabAtoms`** flags sub-words considered "new" for i+1 sequencing.

## Phrase schema

`[LOCKED]` — matches [lessons/types.ts](../../constants/lessons/types.ts). Optional `note` / `gloss` fields are `[PROPOSED]` per [MODALS](../../spec_docs/Sameecha/MODALS.md) §6.4.

```ts
type Phrase = {
  id: PhraseId;              // namespaced: 'phrase.namaskara'
  kannada: string;           // 'ನಮಸ್ಕಾರ'
  transliteration: string;   // 'Namaskāra' — display in DM Sans bold (C15)
  english: string;           // hint, not shown by default
  audioKey?: AudioKey;       // future: recorded audio file ref
  imageKey?: ImageKey;       // future: illustration ref
  vocabAtoms: string[];      // sub-words flagged "new"
  note?: string;             // [PROPOSED] cultural/grammar callout in PhraseDetailSheet
  gloss?: Array<{            // [PROPOSED] atom-level glosses in PhraseDetailSheet
    atom: string;
    en: string;
    transliteration?: string;
  }>;
};
```

### Phrase ID convention

`[LOCKED]`

`phrase.<kebab-name>` — globally unique across all lessons. A phrase resurfaces by ID, not by re-definition.

## UI copy

All user-facing strings live in [copy.ts](../../constants/copy.ts). Accessed via `useCopy()` ([hooks/useCopy.ts](../../hooks/useCopy.ts)).

### Voice system

> **`[LOCKED: REMOVED]`** — the two-tone (`classic` / `rowdy`) voice system was removed 2026-06-28 (TODO T001, CONTRADICTIONS C3). Owner kept **classic**. All copy is single-voice; do not reintroduce per-voice variants. Cross-ref [STATE.md](STATE.md#useuserstore) and [INTERACTIONS.md](INTERACTIONS.md#named-moments).

#### Migration sequence — completed 2026-06-28

1. ✅ Owner picked the single surviving voice: **classic**.
2. ✅ [constants/copy.ts](../../constants/copy.ts) collapsed to single-voice strings; the `{ classic, rowdy }` objects and variant branching are gone.
3. ✅ [hooks/useCopy.ts](../../hooks/useCopy.ts) returns `COPY[key]` directly (no `mode` read).
4. ✅ `mode` removed from [stores/useUserStore.ts](../../stores/useUserStore.ts) (field, default, `setMode` action); persisted `user_prefs` bumped to **version 2** with a `migrate` that strips the stale `mode` key on rehydrate.

> **No UI step was required** — there was no tone-UI surface (the only `useUserStore.mode` consumer was `useCopy()` itself; the lone other `setMode` identifier is `OutputPhase`'s unrelated local `'type' | 'speak'` state).

#### Authoring rule going forward

`[LOCKED]` — all copy is single-voice. No `classic`/`rowdy` pairs.

> **TODO:** Coverage audit — does every screen render via `useCopy()`, or are some strings still inline? Run a grep.

## Emergency content

`[LOCKED]` — schema; content `[OPEN]` pending verification. **Source-of-truth divergence:** Supabase has an `emergency_phrases` table that no app code reads — see [CONTRADICTIONS.md](CONTRADICTIONS.md) C10 for the JSON-vs-DB decision still owed.

File: [data/emergency.json](../../data/emergency.json). Offline-first phrase guide, 3 groups (`auto`, `trouble`, `basics`), 3 items each.

Schema:
```json
{
  "groups": [{
    "id": "...",
    "label": "...",
    "items": [{ "kn": "...", "roman": "...", "en": "...", "audio": "..." }]
  }]
}
```

> **TODO:** `[Unverified]` flag — audit pending from a native Kannada speaker. Track who reviewed and when.

## Heritage content

`[OPEN]`

> **TODO:** Schema undefined. Routing exists ([app/heritage/[id].tsx](../../app/heritage/%5Bid%5D.tsx)) but no content shape yet.
> Decisions needed:
> - Long-form articles or short cards?
> - Anchored to lessons (per-lesson cultural note) or standalone topics?
> - Storage: JSON like emergency, MDX-style, or Supabase-backed?

## Game content

> **Content source (2026-06-02, [spec_content_integrity](../../spec_docs/Sameecha/spec_content_integrity.md) §3.7):** game content lives in **Supabase**, not local TS banks. The old local data files (`opposites/data/wordPairs.ts`, `imagematch/data/vocabBank.ts`, `dictation/data/wordBank.ts`) were deleted; games fetch per-lesson rows via the accessors in [services/api/games/](../../services/api/games/). Seed data is in the migrations under [services/api/migrations/](../../services/api/migrations/) (e.g. `2026-05-27_db_wiring_games_seed.sql`). See CONTRADICTIONS C12.

### Dictation — [src/games/dictation/](../../src/games/dictation/)

`[LOCKED]` — describes the live game.

Consumes phrases from completed lessons (DB-backed via `fetchDictationItemsByLessonNo` in [services/api/games/](../../services/api/games/)). User listens (TTS) and types what they hear. Score via fuzzy match ([fuzzyScore.ts](../../src/games/dictation/fuzzyScore.ts)).

### Opposites — [src/games/opposites/](../../src/games/opposites/)

`[LOCKED]` — describes the live game.

Multiple-choice opposite matching. Word-pair data is read from the `public.opposites_items` table via `fetchOppositesItemsByLessonNo` ([services/api/games/opposites.ts](../../services/api/games/opposites.ts)); seeded by [2026-05-27_db_wiring_games_seed.sql](../../services/api/migrations/2026-05-27_db_wiring_games_seed.sql).

### Quick quiz — [src/games/quickquiz/](../../src/games/quickquiz/)

`[LOCKED]` — describes the live game.

Multiple-choice quiz. Items live in the `public.quick_quiz_items` table (schema: [2026-06-02_quick_quiz.sql](../../services/api/migrations/2026-06-02_quick_quiz.sql)).

### Planned games (not yet implemented)

`[OPEN]`

- Image match (tables dropped — see CONTRADICTIONS / db notes)
- Conversations

## Asset conventions

### Audio

`[LOCKED]` — MVP path. Post-MVP `[OPEN]`.

- **MVP:** device TTS via [deviceTtsAudioService.ts](../../services/audio/deviceTtsAudioService.ts) (`Speech.speak`, `kn-IN`, rate 0.9).
- **Post-MVP:** recorded native-speaker audio referenced by `audioKey` in `Phrase`.
- **Audio key naming convention:** TODO — propose `audio/<lesson-id>/<phrase-id>.mp3`.

### Images

`[LOCKED]` — MVP path. Post-MVP `[OPEN]`.

- **MVP:** placeholder cards with `charPlaceholder` (a Kannada character) per slot.
- **Post-MVP:** illustrations per `Phrase.imageKey` and `Situation.imageKey`.
- **Image key naming convention:** TODO — propose `scene/<lesson-id>` and `phrase/<phrase-id>`.

## Open questions

`[OPEN]`

- Heritage content shape (see TODO above).
- When does a `phrase` get retired from `resurfaces` rotation — never, after N exposures, or via `SelfRating: "easy"` threshold?
