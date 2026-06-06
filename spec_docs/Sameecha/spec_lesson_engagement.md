# Spec: lesson engagement — make lessons fun, clear, and retention-strong

**Status:** `[PROPOSED]` — draft for owner review (2026-06-04). No item is `[LOCKED]` until sign-off.
**Owner:** samee
**Scope:** Additive enrichment of the existing lesson runner — in-lesson rewards, retention loops,
and interaction variety — *within* the locked phase flow.
**Out of scope:** Reordering or adding/removing lesson phases; the games feature; the progress
store's XP/streak formulas; TTS service internals; any new runtime dependency (except the optional
Pillar D stretch, called out explicitly).
**Amends (pending sign-off):** [spec_lesson_redesign.md](spec_lesson_redesign.md) (locked phase flow
+ listen/say mechanics + transliteration-primary rule). See §7 "Amendments to locked specs" for the
exact, item-by-item list the owner is signing off.

---

## 1. Motivation

The lesson runner works, but **every practice item is the same two shapes**, repeated every lesson:

1. **listen** → hear TTS → *"What does this mean?"* → pick 1 of 3 English options
2. **say** → see the target → *"Say it out loud"* → tap **"I said it"** (honor system)

This is the "school-worksheet MCQ feel" we have explicitly decided to move away from. Concretely:

| Area | Today | Gap this spec closes |
|---|---|---|
| Interaction | listen = MCQ(3 English), say = honor-system tap | Same 2 shapes every item → monotonous, passive |
| Feedback | wrong → 800–1000 ms delay → advance | No retry, no second chance to learn |
| Reward | XP/streak fire only at `done` | Nothing inside the lesson; no momentum; haptics installed but unused |
| Retention | none after completion; `resurfaces` data unused | Words decay; no spaced review |
| Production | "Say it" can't be verified (no STT installed) | Unverifiable; easy to skip mentally |

### Design principles (what each change is grounded in)
- **Active recall / testing effect** — produce, don't just recognize (the tile builder, match round).
- **Spaced repetition & interleaving** — keep prior vocab alive (resurfaced distractors); bring
  missed items back (retry queue). Anki / Duolingo lineage.
- **Immediate, informative feedback + mastery retry** — a wrong answer earns a second attempt, not
  a silent skip.
- **Variable reward / "juice"** — haptics, micro-celebration, and momentum make correctness *feel*
  good (mobile-game engagement), without changing what's being taught.

### Non-negotiable locked constraints this spec respects
- The **phase sequence** stays exactly as locked:
  `idle → situation → teach_words → practice_words → teach_phrases → practice_phrases → summary →
  real_world → done`. No phase is added, removed, or reordered.
- The **listen→say two-step** per item stays. We enrich the *renderer* of each step, not the contract.
- **Transliteration is the primary interaction target; Kannada script is reference-only and is never
  tappable** (spec_lesson_redesign §1). All new tap targets use transliteration, not script.
- **Animation = React Native `Animated` only** (Reanimated stays installed-but-unused per
  INTERACTIONS.md). No new animation/gesture lib.
- **Tokens only** — `constants/colors.ts`, `spacing.ts`, `fonts.ts`, `icons.ts`, `audio.ts`. No hex
  literals, no `StyleSheet.create`, no raw layout pixels (use `moderateScale`).

---

## 2. The improvements (each tagged; each maps to a reused primitive)

### Pillar A — Interaction variety (kills the MCQ monotony)

#### A1 — Syllable-tile word builder for the `say` step `[PROPOSED]` *(headline; amends locked say-step — §7)*
On the **say** step, in addition to (or alternating with) "I said it", the learner reconstructs the
target from **scrambled transliteration syllable tiles**, tapping them into the correct order.

- **Why:** active production with zero STT. Forces the learner to recall *form*, not just meaning.
- **Tiles:** derived by splitting the word/phrase `transliteration` (per the locked
  transliteration-primary rule — **never** Kannada-script tiles). For phrases, tile by word; for
  single words, tile by syllable using a simple, deterministic split (rule TBD in §6 open question).
- **Feedback:** correct order → reveal + audio replay (shadowing) → advance, same timing contract as
  today. Wrong order → tile bounces back, retry in place (no penalty; this is production practice).
- **Reuse:** the tappable-chip visual already in
  [TeachPhrasesPhase.tsx](../../components/lesson/TeachPhrasesPhase.tsx); reveal styling from
  [FeedbackTag.tsx](../../components/lesson/FeedbackTag.tsx).
- **Acceptance:** on a phrase item, tiles render scrambled; assembling correct order advances; an
  incorrect tap is recoverable without advancing or marking the item wrong; audio still plays once
  on success; "I said it" remains available as the fallback for learners who prefer speaking.

#### A2 — Tap-to-match summary round `[PROPOSED]`
Replace/augment the passive scroll list in
[SummaryPhase.tsx](../../components/lesson/SummaryPhase.tsx) with a quick **match-the-pairs** round:
tap a transliteration tile, then its English tile, to clear the pair.

- **Why:** turns end-of-lesson review from passive reading into one active recall pass.
- **Reuse:** games' `reveal` correct/wrong pattern; tokens for the cleared/active/wrong states.
- **Acceptance:** all word+phrase items appear as pairs; matching clears them with a correct cue;
  a mismatch shows a brief wrong cue and resets the selection; clearing all pairs advances to
  `real_world`. The plain list remains the fallback if the set is too small to make a board.

#### A3 — Listen-step variety `[PROPOSED]` *(amends locked listen-step — §7)*
Keep the listen step as a 3-option recognition task, but vary it so it isn't visually identical
every time:
- **Better distractors** — prefer semantically/phonetically near options over random (see C8).
- **Occasional reverse prompt** — sometimes show the **English** and ask the learner to tap **which
  of 3 audio clips** matches (audio-recognition instead of meaning-recognition).
- **Acceptance:** across a practice phase the learner sees at least two distinct listen variants;
  the reverse variant plays 3 distinct clips and reveals correct/wrong identically to the forward
  variant.

### Pillar B — Juice & rewards (additive, lowest risk, zero flow change)

#### B4 — Haptics on every answer `[PROPOSED]`
Wire the existing guarded wrapper [src/games/shared/haptics.ts](../../src/games/shared/haptics.ts)
into the lesson: `selectionAsync` on correct, `notificationAsync(Error)` on wrong,
`notificationAsync(Success)` on phase/lesson complete. (Already a noted TODO in INTERACTIONS.md.)
- **Acceptance:** a correct pick, a wrong pick, and reaching `done` each fire the documented
  haptic; the wrapper's existing platform guard means no crash where haptics are unavailable.

#### B5 — Micro-celebration on correct `[PROPOSED]`
A brief checkmark scale-pop (RN `Animated`, ~200 ms) layered on the existing gold reveal.
- **Acceptance:** a correct answer shows the pop; honors the locked 800 ms correct-advance delay;
  uses tokens only; no Reanimated.

#### B6 — In-lesson combo meter `[PROPOSED]`
Derived state counting consecutive correct answers ("3 in a row!"), resets on wrong. Purely visual
momentum; does not affect scoring or XP.
- **Acceptance:** the counter increments on consecutive correct picks, resets to 0 on a wrong pick,
  and renders unobtrusively near the progress bar; it persists across listen→say within an item but
  is lesson-local (not saved to the store).

### Pillar C — Retention / SRS (additive *within* a phase — no flow change)

#### C7 — Error-driven retry queue `[PROPOSED]`
A wrong **listen** answer requeues that item once more at the **end of the same practice phase**.
- **Why:** mastery learning — a missed item gets a second exposure in the same session.
- **Where:** index management in [useLessonRunner.ts](../../hooks/useLessonRunner.ts) (a per-phase
  "requeue" list). **No new phase, no change to the phase sequence.**
- **Acceptance:** missing word *N* causes word *N* to reappear once after the last fresh item of
  that phase; getting it right the second time does not requeue again; the phase still terminates;
  scoring/XP are unchanged (completion score stays fixed per the locked progress contract).

#### C8 — Resurface prior vocab as distractors `[PROPOSED]`
Use prior-lesson words (the `resurfaces` seed idea) as MCQ distractors so earlier vocab stays alive
**without adding a phase**.
- **Acceptance:** when prior-lesson vocab is available, at least one distractor in a listen item is
  drawn from it; with no prior vocab (Lesson 1), behavior is unchanged.
- **Note:** a front-loaded **"warm-up recall" phase** would be the stronger SRS move but it *adds a
  phase* → out of additive-only scope. Logged as `[PROPOSED, flow-change]` in §6 for a future spec.

### Pillar D — Pronunciation (light, optional stretch)

#### D9 — Record & compare on the say step `[PROPOSED, stretch]`
Optional: record the learner via **`expo-av`** (already installed), play it back against the TTS
reference for self-assessment. **No STT, no new dependency.**
- **Acceptance (if built):** record + playback works on iOS and Android; mic permission is
  requested with an in-app explanation and the denied state is handled gracefully; the feature is
  skippable and never blocks lesson completion.
- **Explicitly deferred** unless the owner opts in — it touches mic permissions and adds surface
  area beyond the additive core.

---

## 3. Suggested ship sequence (phasing)

| Phase | Items | Risk | Rationale |
|---|---|---|---|
| 1 | B4, B5, B6 | Lowest — no flow/contract change | Immediate "feel" win; pure additions |
| 2 | C7, C8 | Low — index/distractor logic only | Retention win without touching the flow |
| 3 | A1, A2, A3 | Medium — amends listen/say renderers | The real anti-MCQ payload (needs §7 sign-off) |
| 4 | D9 | Higher — permissions, new surface | Stretch; owner opt-in only |

Each phase ships and is visually verified (CLAUDE.md workflow: run app, screenshot iPhone SE + a
larger device) before the next begins.

---

## 4. Reuse map (keeps implementation small)

| Need | Reuse |
|---|---|
| Tappable chips / tiles | [TeachPhrasesPhase.tsx](../../components/lesson/TeachPhrasesPhase.tsx) |
| Correct/wrong reveal | [FeedbackTag.tsx](../../components/lesson/FeedbackTag.tsx) + games' reveal pattern |
| Haptics | [src/games/shared/haptics.ts](../../src/games/shared/haptics.ts) |
| Audio + speed | [deviceTtsAudioService.ts](../../services/audio/deviceTtsAudioService.ts), [constants/audio.ts](../../constants/audio.ts) |
| Phase/index state (retry queue) | [useLessonRunner.ts](../../hooks/useLessonRunner.ts) |
| Celebration reference | `components/modals/instances/StreakMilestoneTakeover`, `GoalCompleteDialog` |
| Tokens | `constants/colors.ts`, `spacing.ts`, `fonts.ts`, `icons.ts` |

---

## 5. Acceptance criteria (rollup)

A phase is "done" when, in the running app on iPhone SE and a larger device:
1. The locked phase sequence is unchanged and a full lesson still completes to `done`.
2. The phase's items behave per their §2 acceptance bullets.
3. No hex literals, no `StyleSheet.create`, no raw layout pixels, no Reanimated, no new dep
   (except D9 if explicitly approved).
4. Scoring/XP/streak behavior is byte-for-byte unchanged (these improvements are engagement-only).
5. Kannada script is never an interaction target; all new tap targets are transliteration/English.

---

## 6. Open questions

- **Syllable split for A1** — single-word transliterations need a deterministic syllable-split rule.
  Options: (a) split by word only and reserve tile-builder for multi-word phrases; (b) a simple
  vowel-boundary heuristic; (c) author syllable groups in `content_json`. Recommend **(a)** for
  Phase 3 v1 (lowest risk), revisit later.
- **Combo meter prominence (B6)** — subtle counter vs. a celebratory burst at milestones (3/5/all).
  Recommend subtle for v1.
- **Warm-up recall phase** — `[PROPOSED, flow-change]`, out of scope here; needs its own spec since
  it amends the locked phase sequence.
- **A1 default vs. fallback** — does the tile builder *replace* "I said it" or *alternate* with it?
  Recommend: tile builder for phrases, "I said it" stays for single words, both always skippable.

---

## 7. Amendments to locked specs (the explicit sign-off list)

This spec is additive, but three items **touch decisions locked in
[spec_lesson_redesign.md](spec_lesson_redesign.md)**. None changes the phase *sequence*; each
changes a step's *renderer/behavior*. The owner signs off these individually:

| # | Locked decision today | Proposed amendment | Item |
|---|---|---|---|
| 1 | `say` step = show target + "I said it" (honor system) | Add a transliteration tile-builder as an alternate/primary production task on the same step | A1 |
| 2 | `listen` step = pick correct English from 3 options | Allow a reverse variant (pick correct audio of 3) and prior-vocab distractors | A3, C8 |
| 3 | `summary` = passive review list | Allow an interactive match-pairs round (list stays as fallback) | A2 |

Everything else (B4–B6, C7, D9) is purely additive and does **not** amend a locked decision — it
fills gaps the locked specs leave open (in-lesson reward, retry-within-phase, optional recording).

---

## 8. Decision log

- 2026-06-04 — Draft created. Direction = "good mix" across all four pillars; scope = additive only
  (locked phase sequence and listen→say contract preserved); deliverable = this spec for review.
  Pending: owner sign-off on §7 amendments before any Phase 3 work; Phases 1–2 are non-amending and
  can proceed first once the spec is accepted.
