---
doc: spec_dictation_syllable_builder
status: proposed
owner: samee
last-reviewed: 2026-06-02
related:
  - spec_game_polish.md
  - ../../docs/foundation/CONTENT.md
  - ../../docs/foundation/STATE.md
---

# Dictation — syllable-tile builder redesign

> **Decision layer.** `[LOCKED]` = decided. `[OPEN]` = undecided. `[PROPOSED]` = pending owner sign-off.

Replaces the free-text keyboard input in the Dictation game with a **tap/drag akshara-tile
builder**: the learner hears the word, then assembles it from scrambled Kannada syllable tiles.
Owner-approved (2026-06-02). More tactile than typing, and it teaches the script directly instead
of romanized spelling.

---

## 1. Scope

`[PROPOSED]`

Front-end-only change to the Dictation runner. **No DB changes** — the data path
(`dictation_items` / `useDictationItems` / `recordDictationAttempt` / `dictation_progress`) and the
`[LOCKED]` `user_overall_progress` formula are untouched. Dictation remains one of the 3 games in
that formula; the 80%-cleared threshold continues to read `dictation_progress.is_correct`.

Out of scope: schema, RPC, recompute trigger, other games.

---

## 2. Mechanic

`[PROPOSED]`

- Word queue: the existing shuffled bank (unchanged construction). One word at a time.
- On each word: auto-play TTS (existing) with a replay button. Below it, an **answer row** (empty
  slots) and a **tray** of scrambled tiles = the word's aksharas **plus 1–2 distractor tiles**
  (drawn from other words' aksharas).
- Learner taps a tray tile → it flies to the next open answer slot; tapping a placed tile returns it
  to the tray. (v1 = tap; v2 may add drag via the shared `PanResponder` drag layer.)
- **Check** is enabled when the answer row is full. Correct order → `correct`; any mismatch →
  `wrong` (shake the row, reveal the correct order). Require **Next** to advance (consistent with the
  other games).
- Soft streak (`useStreak`) for a gentle sense of pace — no hard timer.

### Scoring & recording
- Scoring becomes **exact-order** (replaces the fuzzy 40%/100% `submitAnswer` path). A word is
  `correct` iff the assembled aksharas equal the target sequence; else `wrong`. (No partial.)
- An attempt records against the word `item.id`, `isCorrect` = exact match — same shape
  `recordDictationAttempt` already expects. OR-merge preserves the locked 80%-threshold math.
- Result screen shows **correct / total** (clearer than the old partial-inflated average) + rangoli.

---

## 3. Akshara splitting (the hard part)

`[PROPOSED]` New `utils/kannadaAkshara.ts` + test. A Kannada akshara = a base consonant/vowel plus
any trailing **dependent vowel signs, virama (್), anusvara/visarga, and consonant clusters joined by
virama** — these must stay in one tile, never split.

- **Primary:** `Intl.Segmenter(undefined, { granularity: 'grapheme' })` if available in the runtime
  (Hermes on the target Expo SDK). Grapheme segmentation already keeps combining marks attached.
- **Fallback:** a small Kannada-aware splitter that greedily attaches combining marks
  (U+0C3E–U+0C56 vowel signs, U+0C4D virama + following consonant, U+0C82/U+0C83) to the preceding base.
- **Guard:** validate every seed word splits into ≥2 sane tiles at game build; any word that fails
  validation falls back to **plain typed input** for that word only (keep a minimal text path as a
  safety net rather than shipping a broken tile set).

---

## 4. File plan

`[PROPOSED]`
**New:** `src/games/dictation/components/{SyllableTray,AnswerRow,AksharaTile}.tsx`,
`utils/kannadaAkshara.ts`, `__tests__/dictation/kannadaAkshara.test.ts`.
**Modify:** `DictationGame.tsx` (swap inner runner; keep loader/error/empty/result),
`hooks/useDictationGame.ts` (tile state + exact-order check + streak), `types.ts`.
**Remove if unreferenced:** `components/AnswerInput.tsx`, `utils/fuzzyScore.ts` (keep only if the
plain-text fallback path in §3 still imports them).

---

## 5. Acceptance criteria

`[PROPOSED]`
- Hearing a word, the learner assembles it from scrambled tiles; full row enables Check.
- Correct order locks `correct`; wrong order shakes + reveals the right order; Next advances.
- Every seeded L1–L6 word splits into sane aksharas (test-verified); any failure degrades to typed input.
- An attempt round-trips to `dictation_progress`; `user_overall_progress` updates exactly as before.
- Result shows correct/total + rangoli.

## 6. Verification

On-device per CLAUDE.md (iPhone SE + larger). Play a lesson; assemble a word correctly, get one
wrong to see the reveal, finish. Screenshot the tray/answer-row, a wrong reveal, and the result.
Confirm a `dictation_progress` row and unchanged `user_overall_progress`. Drag (if v2) is a
physical-device check.
