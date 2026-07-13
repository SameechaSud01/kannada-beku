---
doc: SPEC_LESSON0_REDESIGN
status: reviewed
owner: samee
last-reviewed: 2026-06-30
supersedes:
  - spec_beginners_guide.md (content-shape + layout + "no audio" rows — see §Superseded decisions)
related:
  - ./spec_beginners_guide.md
  - ../../docs/foundation/CONTENT.md
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/NAVIGATION.md
  - ../../docs/foundation/STATE.md
source-artifacts:
  - ../../kannada reference/Kannada_Beku_Lesson_0_Redesign.docx
  - claude.ai/design project 204331d6-d170-4f0a-b3b3-e9b5338825d1 (Lesson 0 - Interactive.dc.html)
---

# Lesson 0 redesign — interactive, listen-first Kannada basics

Owner-signed redesign of the Lesson 0 / Kannada-basics primer (2026-06-30). Replaces
the reference-chart primer described in [spec_beginners_guide.md](spec_beginners_guide.md)
with a paced, **listen-first** 7-step flow whose goal is *pronunciation confidence*, not
alphabet coverage.

> **Goal (from the source docx):** give learners enough pronunciation confidence to start
> speaking Kannada in under 10 minutes. This lesson is **not** about memorising the
> alphabet — it is about understanding how Kannada *sounds*.

This is the same surface as before — one component rendered at two routes
(`/onboarding/basics` forced step, `/guide` voluntary re-entry). Navigation, state flags
(`hasSeenBasicsGuide` / `hasSeenBasicsHomeNudge`), the Learn-tab `<BasicsCard />`, the
one-time home toast, and the **exclusion from progress / streak / XP / overall %** are all
unchanged and still governed by [spec_beginners_guide.md](spec_beginners_guide.md).

## Superseded decisions

These `[LOCKED]` rows in [spec_beginners_guide.md](spec_beginners_guide.md) are superseded
**with owner sign-off (2026-06-30)**:

| Old locked decision | New decision | Lock |
|---|---|---|
| Content shape = 4 sections: vowels (13), consonant-rules, **full 34-consonant chart**, **pronunciation-key**. | Content shape = **7 paced steps** (below). The full 34-consonant chart and the standalone pronunciation-key section are **dropped** (per the docx "What to Remove"). The 34-glyph chart was already not rendered in the live flow (3-step simplification, 2026-06-22) — this makes the removal explicit. | `[LOCKED]` |
| Layout = horizontal 4-page pager, one section per page. | Layout = the shared `GuideStepShell` paced flow (back chip + "Kannada basics" + `n/7` + gold progress bar + scrolling body + single bottom CTA). | `[LOCKED]` |
| Decision #6 "No audio in v1. Reading-only." | **Listen-first is the core mechanic.** Every concept leads with audio (device TTS via `deviceTtsAudioService`). This was already overtaken by the live flow's audio demos; now it's intentional. | `[LOCKED]` |
| Vowel inventory = 13 vowels, macron transliteration. | Lesson 0 introduces only the **8 common vowel sounds** (a, aa, i, ee, u, oo, e, o) with the doubled-vowel notation shown in the design. (Full 13-vowel macron inventory still lives in the curriculum / later lessons.) | `[LOCKED]` |

Everything else in [spec_beginners_guide.md](spec_beginners_guide.md) — placement, forced-once
behavior, the `content_json.reference` DB-source contract, the exclusion from progress, the
re-entry surfaces, the `<GlyphCard>` Kannada-first text-hierarchy exception — **remains in
force**.

## Out of scope (explicit)

- **No "record yourself → AI pronunciation feedback."** The app has no speech recognition
  or pronunciation scoring, and the recording plumbing in `deviceTtsAudioService` is dormant
  (zero call sites). The interactive prototype mocks this with canned "92% match" strings;
  we do **not** ship faked feedback. Each step is **Listen → say it yourself** (self-check).
  A real record/score feature is a separate future spec.
- ~~**No retroflex mouth illustration in v1.**~~ **Shipped (2026-06-30, owner sign-off).**
  Bundled tongue-position diagrams (`assets/tongue-diagrams/*.png`) now hero the
  position-relevant steps: the open vowel (`a`) on Step 2 and a curled-vs-teeth contrast
  (`na`/`ta`) on Step 4, via the `MouthDiagram` component. Assets are bundled in-app (UI
  chrome, RN `Image` + `require`), **not** DB-sourced — the DB-source contract governs the
  text/linguistic payload only, and the first-run primer must not depend on a network fetch
  for its illustrations.
- **DB content authoring is Phase 2** (owner-sequenced: "implement the new UI in basics and
  then we will move to DB content change"). See §Implementation phases.

## The 7 steps

`[LOCKED]` — step order, titles, and per-step CTA labels.

| # | Title | Body | Audio | CTA |
|---|---|---|---|---|
| 1 | Welcome to Kannada | 3 numbered reassurance points (spoken-as-written · every vowel pronounced · even stress) + a listen-first callout. | — | "Let's listen" |
| 2 | The vowel sounds | 8 common vowels (ಅ a, ಆ aa, ಇ i, ಈ ee, ಉ u, ಊ oo, ಎ e, ಒ o) in a 4-column grid; tap a tile to hear it. | per-tile TTS | "Next" |
| 3 | Short vs. long | ಬಲ *bala* (strength) vs ಬಾಲ *baala* (tail) compare tiles + a "Which did you hear?" listening mini-quiz (play → pick → feedback). | compare + quiz TTS | "Next" |
| 4 | Curl your tongue back | Retroflex explainer (a Capital letter = curl the tongue up & back) + Ta/ta · Da/da audio comparison rows. | per-row TTS | "Next" |
| 5 | Doubled letters linger | appa · amma · haLLi list; tap to hear the held double consonant. | per-row TTS | "Next" |
| 6 | The rhythm | The sentence ನನಗೆ ಕನ್ನಡ ಬೇಕು ("I want Kannada") with per-syllable beat chips; tap to hear it. | sentence TTS | "Next" |
| 7 | You're ready! | Success check + 4 recap takeaways. | — | "Start Lesson 1 · Greetings" |

> **Amendment 2026-07-13 (owner-directed):** the original step-3 pair used ಕಾಲಿ *kaali*
> glossed "empty", which is not a Kannada word (empty is ಖಾಲಿ *khaali*, a different
> consonant — not a vowel-length pair with ಕಲಿ). Replaced with the true minimal pair
> ಬಲ *bala* (strength) vs ಬಾಲ *baala* (tail).

> **Amendment 2026-07-13 (owner-directed), English-first ordering + size hierarchy:**
> everywhere a step shows a Kannada glyph with its romanization, the English/roman text
> comes FIRST and the Kannada glyph sits below/after it (vowel tiles, short-vs-long
> compare tiles, retroflex tiles, doubles rows, rhythm sentence card). The roman text is
> also the LARGE hero size and the Kannada glyph the smaller secondary size (the two
> sizes swapped from the original design). Matches the app-wide English-first direction
> approved in the playful redesign.

The step-3 quiz is **not** scored toward progress — it's an in-step self-check (correct =
green, wrong = red, per the owner-approved green/red answer-feedback exception). It does not
gate the CTA; the user can always advance.

## Content (Phase 1: fallback constants; Phase 2: DB)

`[LOCKED]` — the content payload. Same DB-source contract as
[spec_beginners_guide.md §Content source](spec_beginners_guide.md) (2026-06-15 amendment):
the **DB is the source of truth**, `constants/guide.ts` is the **offline fallback**. In
Phase 1 the live DB row still carries the *old* guide shape, so the loader's structural
validation rejects it and falls back to the new constants — the new content renders from the
fallback until Phase 2 updates the DB payload. Step headings + instruction sentences stay in
the components as fixed chrome; the linguistic data lives in the content payload.

```ts
// services/api/guide.ts — reshaped GuideContent
interface GuideContent {
  welcomePoints: { n: number; text: string }[];      // step 1
  vowels: { kannada: string; transliteration: string }[]; // step 2 (8 items)
  shortLong: {                                         // step 3
    short: { kannada: string; transliteration: string; english: string }; // bala / strength
    long:  { kannada: string; transliteration: string; english: string }; // baala / tail
  };
  retroflexRows: {                                     // step 4
    curled: { kannada: string; transliteration: string };
    dental: { kannada: string; transliteration: string };
  }[];
  doubles: { kannada: string; transliteration: string; english: string }[]; // step 5
  rhythm: {                                            // step 6
    kannada: string; syllables: string[]; transliteration: string; english: string;
  };
  recap: string[];                                     // step 7
}
```

## Components

`[LOCKED]` — under `components/guide/`, one component per file, tokens only.

| Component | Role |
|---|---|
| `GuideFlow` | Owns 1-based step state (1..7), per-step CTA labels, DB fetch + fallback, renders `GuideStepShell` + the active step. Public props unchanged (`onExit`, `onFinish`, `finishing`). |
| `GuideStepShell` | Unchanged shared chrome; auto-adapts to `GUIDE_STEP_COUNT = 7`. |
| `StepWelcome` | Step 1. |
| `StepVowelSounds` | Step 2. |
| `StepShortLong` | Step 3 (compare tiles + listening quiz). |
| `StepRetroflex` | Step 4. |
| `StepDoubles` | Step 5. |
| `StepRhythm` | Step 6. |
| `StepRecap` | Step 7. |

The old `StepThings` / `StepVowels` / `StepReading` are removed (replaced 1:1 by the steps
above). `GuideLoading`, `GuidePhonemeButton`, `AudioOrb`, `BasicsCard` are retained.

## Implementation phases

1. **Phase 1 — UI (this spec, now):** the 7-step flow, new fallback content in
   `constants/guide.ts`, reshaped `GuideContent` + parser in `services/api/guide.ts`,
   `GUIDE_STEP_COUNT = 7`. Renders from the fallback (DB still old-shape).
2. **Phase 2 — DB content (next, owner-sequenced):** a seed migration updating
   `content_json.reference.guide` to the new shape so the loader reads it from the DB; the
   fallback stays in sync. The full-chart / pronunciation-key data already in the DB row is
   left in place (harmless; not read by the new loader).

## Acceptance criteria

- [ ] `/onboarding/basics` renders the 7-step flow; CTA labels match the table; back chip
      returns to `/onboarding/commitment` from step 1; final CTA finishes onboarding.
- [ ] `/guide` renders the identical 7-step flow; back + final CTA both `router.back()`.
- [ ] Every audio tile/row plays via `deviceTtsAudioService`; no record/feedback UI anywhere.
- [ ] Step-3 quiz gives green/red feedback and never blocks the CTA.
- [ ] No record/AI-feedback strings, no mocked scores. Mouth-position diagrams are bundled
      in-app from `assets/tongue-diagrams/` (no remote/DB image fetch in the primer).
- [ ] All sizing via `moderateScale`/tokens; every colour from `Colors`; no hex literals,
      no raw pixels.
- [ ] Type-check passes; existing tests pass.
- [ ] Verified rendering on iPhone SE (375×667) and a larger device.
