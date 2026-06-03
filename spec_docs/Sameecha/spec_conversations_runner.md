---
doc: spec_conversations_runner
status: proposed
owner: samee
last-reviewed: 2026-06-02
related:
  - spec_db_wiring_games_and_overall_progress.md
  - spec_quick_quiz_runner.md
  - CONTENT.md
  - STATE.md
---

# Conversations — pick-the-reply runner

> **Decision layer.** `[LOCKED]` = decided. `[OPEN]` = undecided. `[PROPOSED]` = pending owner sign-off.

Builds the `conversations` game (currently a `ComingSoon` stub). Owner-approved mechanic (2026-06-02): a short roleplay dialogue where the user picks the correct Kannada reply at each turn.

---

## 1. Scope

`[PROPOSED]`

New game runner + scenario/turn tables + per-item progress. **Excluded from `user_overall_progress`** (locked formula) — no recompute trigger, no overall-progress invalidation. Includes authoring seed dialogues for **L1 and L2** as part of the work; L3–L8 fall through to the existing empty state until authored.

---

## 2. Mechanic

`[PROPOSED]`

- A scenario = an ordered list of 2–4 **turns**. Each playthrough plays one scenario; replay picks the next/random scenario.
- Each turn shows the other speaker's line (Kannada + English gloss); the user picks the correct Kannada reply from 3–4 options.
- Wrong pick → reveal the correct reply (reuse the `correct/wrong/reveal` option states); require **Next** to advance.
- After the last turn → result screen (score = correct first-try picks).
- An attempt is recorded against the **turn's** `item_id` (not the option), `isCorrect` per pick.

---

## 3. Data model (resolved)

`[PROPOSED]` **One row per turn**, grouped under a parent scenario row — keeps the uniform per-item recording every game uses.
- `conversation_scenarios(id, lesson_id fk lessons, sort_order, title)`, unique `(lesson_id, sort_order)`.
- `conversation_items(id, scenario_id fk scenarios, turn_index, speaker_line_kn, speaker_line_en, options_json jsonb, correct_option_id text)`, unique `(scenario_id, turn_index)`. `options_json` mirrors opposites `options_json` shape: `[{id, kn, tr, en}]`. `correct_option_id` references one option's `id`.
- `conversation_progress(user_id, item_id, is_correct, attempts, last_played)`, pk `(user_id, item_id)`.

---

## 4. DB plan

`[PROPOSED]` New migration `services/api/migrations/2026-06-02_conversations.sql` (+ seed), idempotent, mirroring the wiring migration:
- Tables above; RLS: scenarios + items `select` for authenticated; progress `select/insert/update` own, no delete.
- RPC `record_conversation_attempt(p_item_id, p_is_correct)` — SECURITY INVOKER OR-merge personal-best.
- **NO trigger on `recompute_overall_progress`** — SQL comment states the exclusion.
- Seed: L1 + L2 dialogues, deterministic `uuid_generate_v5` from `(conversation, lesson_no, scenario_idx, turn_idx)`; vocab drawn from `content_json.reference.words`; carry the existing `verified:false` native-speaker-review caveat; validate every `correct_option_id` exists in its `options_json`.

---

## 5. App plan

`[PROPOSED]`
- `services/api/games/conversations.ts`: `fetchConversationScenariosByLessonNo` (fetch scenarios + turns, group by `turn_index` in JS) + `recordConversationAttempt`.
- `hooks/games/conversations.ts`: `useConversationScenarios` + `useRecordConversationAttempt` (no overall-progress invalidation).
- `src/games/conversations/`: `ConversationGame.tsx` (loader+inner), `hooks/useConversation.ts` (turn state machine), `components/{DialogueBubble,ReplyOptionGrid,ReplyOptionButton}.tsx`, reuse opposites-style `ResultScreen`/`ProgressBar`, `types.ts`, `index.ts`.
- Wire `app/(games)/[game]/[n].tsx`: `case 'conversations': return <ConversationGame lessonNo={lessonNo} />;`.

---

## 6. Acceptance criteria

`[PROPOSED]`
- A dialogue advances turn by turn; wrong pick reveals the correct reply; result screen shows score/total.
- Attempt round-trips to `conversation_progress`. `user_overall_progress` unchanged after play.
- Unseeded lessons (L3–L8) show the existing empty state.
- Migration runs cleanly twice; RLS denies cross-user progress reads; every `correct_option_id` is present in its `options_json`.

---

## 7. Verification

On-device per CLAUDE.md. Play L1 and L2; answer one turn wrong to see the reveal; finish. Open an unseeded lesson → empty state. Screenshot a dialogue turn + a reveal + result. Confirm `conversation_progress` row and unchanged `user_overall_progress`.

---

## 8. Amendment — chat UI, replay variety, streak (2026-06-02)

`[PROPOSED]` Owner-approved (2026-06-02). Reframes the static turn card as a **messaging
interface**, so a roleplay feels like texting a Kannada friend rather than a flashcard drill.
**Front-end-only** — data model (§3), recording (§2 record against the turn item id), and the
`user_overall_progress` exclusion (§1) are unchanged.

### Chat UI
- Replace the single static `DialogueBubble` with a **scrolling chat transcript** that accumulates
  past turns:
  - **NPC line** = left-aligned bubble with a small avatar — a tinted circle holding
    `Icons.gameConversations` (no image asset needed). Kannada line on top, English gloss below.
  - **User's chosen reply** = right-aligned bubble appended after they pick.
- Each new NPC line animates in behind a **typing indicator** (3 pulsing dots, `Animated` loop),
  then performs a **typewriter reveal** of the Kannada text (`useTypewriter` hook — JS substring
  timer, not an `Animated` value; respects a sensible per-char interval).
- Reply options keep the `correct/wrong/reveal` states from §2 and gain the shared
  lift/checkmark/shake/feedback-banner treatment per [spec_game_polish.md](spec_game_polish.md).

### Replay variety (amends §2 scenario selection)
- Shuffle scenario order once on mount; advance **sequentially** through the shuffled list on each
  replay (instead of `(i + 1) % length` modulo cycling).
- When every scenario in the list has been played, show an **"all caught up" end state** (with a
  restart that re-shuffles) rather than silently looping the same scenarios forever.

### Streak + richer result
- Add `useStreak` (consecutive correct first-try picks); the feedback banner shows "On a roll!" at
  streak ≥3.
- Result screen shows score/total **and best streak**, with the rangoli reward.

### File plan delta
- **New:** `components/ChatTranscript.tsx`, `components/{NpcBubble,UserBubble,TypingIndicator}.tsx`,
  `hooks/useTypewriter.ts`.
- **Modify:** `ConversationGame.tsx` (scenario shuffle + end state), `hooks/useConversation.ts`
  (streak; expose transcript history), `types.ts` as needed.
- Reuse shared `FeedbackBanner` / `useStreak` / result wrapper from `src/games/shared/`.

### Acceptance delta
- A turn renders as a chat exchange: typing indicator → typewriter NPC line → user reply bubble.
- Replaying cycles through scenarios in shuffled order and surfaces an end state when exhausted.
- Result shows best streak; recording + `user_overall_progress` behavior unchanged from §6.
