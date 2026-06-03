---
doc: spec_imagematch_board_redesign
status: proposed
owner: samee
last-reviewed: 2026-06-02
related:
  - spec_db_wiring_games_and_overall_progress.md
  - CONTENT.md
  - STATE.md
---

# Image Match — tap-to-connect board redesign

> **Decision layer.** `[LOCKED]` = decided, do not reopen. `[OPEN]` = undecided. `[PROPOSED]` = in this doc, pending owner sign-off; promote to `[LOCKED]` on approval.

Replaces the current one-question-at-a-time MCQ (word→emoji / emoji→word) with a **tap-to-connect board**. Owner-approved mechanic (2026-06-02).

---

## 1. Scope

`[PROPOSED]`

Front-end-only change to the Image Match runner. **No DB changes.** The data path (`image_match_items`, `useImageMatchItems`, `recordImageMatchAttempt`, `image_match_progress`) and the `[LOCKED]` `user_overall_progress` formula are **untouched** — Image Match remains one of the 3 games in that formula, and the 80%-of-items "cleared" threshold continues to read `image_match_progress.is_correct`.

Out of scope: any change to the schema, the RPC, the recompute trigger, or the other games.

---

## 2. Mechanic

`[PROPOSED]`

- One screen shows **two columns**: Kannada words (left) and images/emoji (right), each column independently shuffled.
- Board size = `min(available pair count, 6)`, minimum 4 where possible. The lesson's own items are the pairs; when a lesson has < 4 items (e.g. L1 = 1), the existing neighbor-lesson union fallback fills the board.
- User taps a **word**, then taps an **image**:
  - **Correct pair** → both tiles lock with the "matched" treatment (gold, per the project's `correct` convention) and become non-interactive.
  - **Wrong pair** → both tiles flash the "mismatch" treatment (error red) briefly (~500 ms), then deselect; nothing locks.
- Tapping an already-matched tile is ignored. Tapping an image before a word is selected is ignored.
- Round completes when **all pairs are matched** → result screen (reuse existing `ResultScreen`).

### Scoring & recording
- Score increments by 1 per correctly matched pair.
- An attempt is recorded **once per pairing action** against the **word item id** (the prompt), `isCorrect` = whether the tapped image matched. This mirrors the existing "record against the prompt" rule in `useImageMatch`. The eventual correct match OR-merges `is_correct = true`, preserving the locked 80%-threshold math.

---

## 3. File plan

`[PROPOSED]`

**New:** `hooks/useImageMatchBoard.ts`, `components/MatchBoard.tsx`, `components/WordTile.tsx`, `components/ImageTile.tsx`.
**Modify:** `ImageMatchGame.tsx` (keep loader/error/empty/result; swap inner runner), `types.ts` (keep `VocabItem`; add `TileState`), `components/ProgressBar.tsx` (repurpose to pairs-matched / total).
**Delete:** `hooks/useImageMatch.ts`, `utils/roundBuilder.ts`, `components/{QuestionCard,PictureOptionGrid,PictureOptionButton,WordOptionList,WordOptionButton,FeedbackBanner,HintButton}.tsx`, and tests `__tests__/imagematch/{roundBuilder,useImageMatch}.test.ts`.
**Add test:** `__tests__/imagematch/useImageMatchBoard.test.ts`.

---

## 4. Acceptance criteria

`[PROPOSED]`

- Tapping a word then its correct image locks the pair (gold) and it stops responding; both columns stay aligned.
- Tapping a word then a wrong image flashes red on both, then deselects without locking.
- Board completes only when every pair is matched; result screen shows score/total.
- An attempt round-trips to `image_match_progress` (row with `attempts >= 1`).
- `user_overall_progress` still updates after Image Match exactly as before (no schema/formula change).
- `useImageMatchBoard.test.ts` passes; old imagematch tests removed.

---

## 5. Verification

On-device (iPhone SE + a larger device), per CLAUDE.md. Play L1 and a richer lesson (L5). Match all pairs; deliberately mispair once to see the red flash. Screenshot the board mid-play and a mismatch state. Confirm a `image_match_progress` row and unchanged `user_overall_progress` formula behavior.

---

## 6. Amendment — board polish + min-4 (2026-06-02)

`[PROPOSED]` Owner-approved (2026-06-02). **Mechanic stays tap-to-connect** (tap a word, then tap
its picture); adds match/mismatch polish and a board-size floor. **Front-end only** — the data path,
recording rule (§2.5 record against the word item id), and the `[LOCKED]` `user_overall_progress`
scope (§1) are unchanged.

### Interaction (reliable tap-to-connect)
- Tap a **word** → it selects (highlight). Tap its **picture** → match/mismatch.
  - **Correct** → both tiles lock with the `matched` treatment, a spring "pop", and a fade-in
    `Icons.correct` badge; non-interactive thereafter; light haptic.
  - **Wrong** → both tiles flash the `mismatch` treatment (error red + `useShake`) for ~550ms,
    then deselect; nothing locks; error haptic.
- Round completes when all pairs are matched → shared `ResultScreen` + rangoli
  ([spec_game_polish.md](spec_game_polish.md)).

> **Draw-a-thread `[DEFERRED]`.** A drag-to-connect SVG thread was prototyped but pulled: reliable
> finger-drag inside a `ScrollView` needs `react-native-gesture-handler` (a `PanResponder`
> implementation mis-fired on imperfect taps and fought the scroll view, making the board feel
> broken). Revisit once gesture-handler is adopted (an `[OPEN]` dependency decision); until then the
> reliable tap-to-connect above ships.

### Board guarantee (amends §2 board size)
- Board size = `min(available pair count, 6)`, **padded to a minimum of 4** from the neighbor-lesson
  distractor union whenever ≥4 unique pairs exist app-wide. If fewer than 4 unique pairs exist
  globally, use what's available and `log()` the shortfall (no silent degenerate board).

### File plan delta
- **Modify:** `hooks/useImageMatchBoard.ts` (min-4 padding; `deselect` kept for a future drag path),
  `components/{WordTile,ImageTile}.tsx` (match pop + checkmark + mismatch shake), `ImageMatchGame.tsx`
  (haptics, shared ResultScreen).
- **Test:** `__tests__/imagematch/useImageMatchBoard.test.ts` covers the min-4 guarantee and deselect.

### Acceptance delta
- Tapping a word then its correct picture locks the pair (gold + pop + checkmark); a wrong picture
  flashes both red, then deselects; nothing locks.
- Board never renders fewer than 4 pairs when ≥4 exist app-wide.
- Recording + `user_overall_progress` behavior unchanged from §4.
