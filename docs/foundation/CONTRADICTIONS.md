---
doc: CONTRADICTIONS
status: living
owner: samee
last-reviewed: 2026-06-01
related:
  - SCOPE.md
  - DESIGN.md
  - CONTENT.md
  - NAVIGATION.md
  - STATE.md
  - INTERACTIONS.md
---

# Contradictions

A living log of code-vs-spec divergences. Two sections: **Active** (the gap exists today) and **Resolved** (the gap was closed; entry kept as history).

Each entry: **what's wrong**, **why it matters**, **owning spec(s)**, **resolution owed**.

Numbering is monotonic and never reused. Gaps in the sequence (C2, C4, C5, C8…) are slots reserved for divergences raised but not yet documented.

## Active

### C3 — Rowdy/classic voice system still wired but locked for removal

**What's wrong:** Spec ([CONTENT.md](CONTENT.md#voice-system)) declares the two-tone (`classic` / `rowdy`) voice system as `[LOCKED: REMOVAL IN PROGRESS]`, but the code still implements it end-to-end:
- [constants/copy.ts](../../constants/copy.ts): every key carries both `classic` and `rowdy` variants.
- [hooks/useCopy.ts](../../hooks/useCopy.ts): reads `useUserStore((s) => s.mode)` and indexes `COPY[key][mode]`.
- [stores/useUserStore.ts](../../stores/useUserStore.ts): `mode: 'rowdy' | 'classic'` field, default `'classic'`, `setMode` action, persisted to AsyncStorage key `user_prefs`.

**Why it matters:** Until the migration runs, anyone editing copy will instinctively add both variants — re-entrenching the system we're killing. Anyone debugging hydration may treat the `mode` field as load-bearing.

**Owning specs:** [CONTENT.md](CONTENT.md#voice-system) (canonical migration), [STATE.md](STATE.md#useuserstore), [INTERACTIONS.md](INTERACTIONS.md#named-moments) (M6 voided).

**Resolution owed:**
1. Owner picks the single surviving voice (`[OPEN]`).
2. Execute steps 2–4 of the migration in CONTENT.md.
3. Step 5 (Profile/onboarding UI removal) is already a verified no-op — no tone UI exists.

### C7 — `fill_blank` drill type is a placeholder, not an implementation

**What's wrong:** [CONTENT.md](CONTENT.md#authoring-rules-spec-leads-code--content-must-conform) authoring rule says drills "mix `listen_pick` / `translate_pick` / `fill_blank`." The type ([constants/lessons/types.ts](../../constants/lessons/types.ts)) includes `fill_blank`. Routing in [components/lesson/drill/DrillPhase.tsx](../../components/lesson/drill/DrillPhase.tsx) sends `fill_blank` items to [components/lesson/drill/FillBlankPlaceholder.tsx](../../components/lesson/drill/FillBlankPlaceholder.tsx), which renders the literal text "Fill-in-the-blank / Not yet implemented — skipping." and a Skip button that resolves the drill as wrong. **Verified by reading both files directly.**

**Why it matters:** Lessons 2–8 (per the [CONTENT.md](CONTENT.md#lesson-slots) curriculum) will be authored against this rule. If a lesson includes `fill_blank` drills, learners will hit "Not yet implemented — skipping" and lose points on those items.

**Owning spec:** [CONTENT.md](CONTENT.md#authoring-rules-spec-leads-code--content-must-conform).

**Resolution owed:** Either (a) implement the `fill_blank` drill UI for real, or (b) remove `fill_blank` from the type union and the authoring-rules wording until it's built. Lessons 2–8 should not depend on `fill_blank` until one of those lands.

### C11 — Beginners' Guide spec landed; code not yet shipped

**What's wrong:** [spec_beginners_guide.md](../../spec_docs/Sameecha/spec_beginners_guide.md) is `[LOCKED]` as of 2026-06-01 and amends [NAVIGATION.md J1](NAVIGATION.md#j1-first-time-sign-up) (6-step onboarding), [CONTENT.md](CONTENT.md#curriculum-overview) (Lesson 0 reference primer), [STATE.md](STATE.md#useuserstore) (`hasSeenBasicsGuide`, `hasSeenBasicsHomeNudge`), and [spec_lesson_content_source.md](../../spec_docs/Sameecha/spec_lesson_content_source.md) (optional `sections?` field on `content_json.reference`). The code reflects none of these yet:

- No `app/onboarding/basics.tsx` route — onboarding still ends at `/onboarding/commitment`.
- No `app/guide.tsx` route.
- No `components/guide/*` components.
- `useUserStore` does not yet declare or persist `hasSeenBasicsGuide` / `hasSeenBasicsHomeNudge`.
- `constants/guide.ts` does not exist.
- No `services/api/migrations/2026-06-XX_lesson_0_basics_seed.sql` — the `public.lessons` table has no `lesson_no = 0` row.
- The `recompute_overall_progress` trigger function's lesson-count predicate has not been audited for whether it would falsely include `lesson_no = 0`.

**Why it matters:** Until the code ships, a new sign-up follows the *old* 5-step onboarding (without the Basics step), and the Learn tab has no re-entry card. The spec is committed-and-locked but invisible to users. Anyone touching `useUserStore`, `onboarding/_layout.tsx`, or the lessons schema in the interim could land changes that contradict the locked spec.

**Owning specs:** [spec_beginners_guide.md](../../spec_docs/Sameecha/spec_beginners_guide.md) (canonical), with cross-refs in [NAVIGATION.md](NAVIGATION.md), [CONTENT.md](CONTENT.md), [STATE.md](STATE.md), and [spec_lesson_content_source.md](../../spec_docs/Sameecha/spec_lesson_content_source.md).

**Resolution owed:**
1. Audit `recompute_overall_progress` (in [services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql](../../services/api/migrations/2026-05-27_db_wiring_games_and_overall.sql)) for its lesson-count predicate; if it counts all `public.lessons` rows unconditionally, add `where lesson_no > 0` in the same PR as the seed migration.
2. Ship the migration, the routes, the components, the `useUserStore` flags, and the Learn-tab basics card per the acceptance criteria in [spec_beginners_guide.md](../../spec_docs/Sameecha/spec_beginners_guide.md).
3. Close this entry once verified end-to-end on iPhone SE and a larger device.

### C9 — Stale "NativeWind" text in repo README; CLAUDE.md verified clean

**What's wrong:** The repo's top-level [README.md](../../README.md) still references NativeWind in two places (lines 3 and 153). Code is clean — grep across `*.ts`/`*.tsx`/`*.js`/`*.jsx`/`*.json` for `nativewind` or `className=` returns zero hits outside `node_modules`. NativeWind was removed in commit `818e1ba` and the OppositeGame port finished in commit `01a516e` (see resolved C1). MMKV is similarly absent from both code and [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — the only MMKV strings in the repo are an unrelated SHA in `package-lock.json` and the prior `docs/STATE.md` TODO line that was removed in this revision.

**Verified scope of the divergence:**
- [README.md](../../README.md) lines 3, 153 — stale NativeWind references.
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — already clean (verified grep, zero hits for NativeWind or MMKV).

**Why it matters:** New contributors reading the README will install / configure NativeWind that the project doesn't use and that would conflict with the inline-styles + tokens rule.

**Owning spec:** [DESIGN.md](DESIGN.md#styling-rules-implicit-in-tokens) (style approach) — and the README itself.

**Resolution owed:** Edit [README.md](../../README.md) to drop NativeWind from the stack list (line 3) and from the "Styling" section (line 153), replacing with "inline styles + tokens in `constants/`". No CLAUDE.md edit needed beyond the new top-of-file session-start instruction.

### C12 — CONTENT.md still points game content at deleted local data files

**What's wrong:** [CONTENT.md](CONTENT.md#game-content) describes Opposites as "Consumes word-pair data from [wordPairs.ts](../../src/games/opposites/wordPairs.ts)" with a TODO asking for the word-pair count. As of 2026-06-02 ([spec_content_integrity](../../spec_docs/Sameecha/spec_content_integrity.md) §3.7) the live games consume content **from Supabase** (`fetchOppositesItemsByLessonNo` / `fetchDictationItemsByLessonNo` / `fetchImageMatchItemsByLessonNo`), and the dead local banks were deleted: `src/games/opposites/data/wordPairs.ts` (`RAW_PAIRS`), `src/games/imagematch/data/vocabBank.ts` (`VOCAB_BANK`), `src/games/dictation/data/wordBank.ts` (`WORD_BANK`), plus their tests. The `data/karnataka_fun_facts.json` fallback import was removed from Home (Home is now DB-only with an empty state). The `wordPairs.ts` link in CONTENT.md now points at a non-existent file.

**Why it matters:** A reader following CONTENT.md will look for word-pair data in a deleted file and miss that the DB seed ([2026-05-27_db_wiring_games_seed.sql](../../services/api/migrations/2026-05-27_db_wiring_games_seed.sql)) is the source of truth.

**Owning spec:** [CONTENT.md](CONTENT.md#game-content).

**Resolution owed:** Update CONTENT.md's "Game content" section to point Opposites/Dictation at the DB seed + accessors (and drop the stale `wordPairs.ts` link and word-pair-count TODO). `data/emergency.json` and `data/karnataka_fun_facts.json` are intentionally retained as seed artifacts (per C10 precedent) — not a divergence.

**Note:** `constants/lessons/plannedLessons.ts` was deliberately **left in app code** (drives unlock/progress math); moving it to the DB is out of scope per spec_content_integrity §3.7.

### C13 — Image Match hidden from Practice, but still 1 of 3 games in the locked overall-progress formula

**What's wrong:** Image Match was removed from the Practice game list ([app/(tabs)/practice.tsx](../../app/%28tabs%29/practice.tsx) `GAMES`) on 2026-06-03 pending a better mechanic (the tap-to-connect board, see [spec_imagematch_board_redesign.md](../../spec_docs/Sameecha/spec_imagematch_board_redesign.md) §6 draw-a-thread `[DEFERRED]`). The game runner (`src/games/imagematch/`) and route case (`app/(games)/[game]/[n].tsx`) remain intact — only the UI entry point is gone. But the `[LOCKED]` `user_overall_progress` formula still counts **image_match** as one of its 3 games (the 80%-of-items "cleared" threshold reads `image_match_progress.is_correct`).

**Why it matters:** With no UI path to play Image Match, a user cannot accumulate `image_match_progress`, so **overall progress can never reach 100%** while the game is hidden. Any surface that renders the overall-progress percentage will appear permanently capped.

**Owning specs:** [spec_db_wiring_games_and_overall_progress.md](../../spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md) (locked formula), [spec_imagematch_board_redesign.md](../../spec_docs/Sameecha/spec_imagematch_board_redesign.md).

**Resolution owed:** Either (a) re-list Image Match once a better mechanic ships (restore the one line in `GAMES`), or (b) if it stays hidden, get owner sign-off to amend the locked formula to 2 games (opposites + dictation) via migration — a `[LOCKED]` change, not to be done silently. Until one lands, treat the capped overall progress as known.

### C14 — Playful redesign code shipped on `app_redesign`; pending final on-device verification

**What's wrong (narrowing):** [spec_playful_redesign.md](../../spec_docs/Sameecha/spec_playful_redesign.md) (signed off 2026-06-04) amends locked decisions — DESIGN.md typography (Baloo, Amendment A), type scale, `TabBar` (floating pill, Amendment B), additive colour tokens, the near-white surface ramp (Amendment D), and [spec_text_hierarchy.md](../../spec_docs/Sameecha/spec_text_hierarchy.md) §4 (Emergency English-first, Amendment C). Phases 1–8 are now implemented on the `app_redesign` branch:

- ✅ Deps + tokens + Baloo font-load; `fonts.ts` `baloo` group + `TypeScale`; `colors.ts` additive tokens + near-white ramp.
- ✅ Shared `components/ui/` primitives: `BrandGradient`, `LipButton`, `ProgressRing`, `AudioOrb`, `Watermark`, `Celebration`, `StreakPill`.
- ✅ `TabBar` is the floating icon-only red pill.
- ✅ Home / Learn / Practice / Profile restyled; lesson runner restyled with `LipButton` footers, `AnswerOption` correct/wrong micro-interactions, and the lesson-complete `Celebration` (streak unified to `Celebration`, locked copy reused).
- ✅ Emergency is English-first with the gradient header. Welcome has the gradient treatment.

**Still open:** (a) final **end-to-end on-device verification** on iPhone SE + a larger device (owner is testing phase-by-phase); (b) optional items intentionally deferred — the Discord-style loading screen, the `AudioOrb` ping on lesson audio buttons, and a user-facing watermark/reduced-motion **settings toggle** (defaults are hard-coded per spec: watermark on/Rangoli, Noto Kannada, near-white bg, reduced-motion honoured in `Celebration`). The `level` Celebration variant is built but unwired (no real level system).

**Owning spec:** [spec_playful_redesign.md](../../spec_docs/Sameecha/spec_playful_redesign.md).

**Resolution owed:** Close once the owner confirms the full flow on device. Then merge `app_redesign` → `main`. Decide separately whether to build the deferred optional items.

## Resolved

### C10 — `emergency_phrases` table now read by app code ✅

**What was wrong:** [CONTENT.md](CONTENT.md#emergency-content) declared that emergency content lived in [data/emergency.json](../../data/emergency.json), but the Supabase project shipped an unused `emergency_phrases` table. The DB-vs-JSON source-of-truth direction was unresolved.

**Resolution:** [spec_db_wiring_games_and_overall_progress.md](../../spec_docs/Sameecha/spec_db_wiring_games_and_overall_progress.md) (PR1 + PR2) picked "DB wins":
- PR1 added RLS to `emergency_phrases` and seeded the 9 rows from `data/emergency.json` ([2026-05-27_db_wiring_games_seed.sql](../../services/api/migrations/2026-05-27_db_wiring_games_seed.sql) Migration 6).
- PR2 added [services/api/emergency.ts](../../services/api/emergency.ts) accessor and [hooks/useEmergencyPhrases.ts](../../hooks/useEmergencyPhrases.ts); refactored [app/emergency.tsx](../../app/emergency.tsx) to fetch from DB instead of importing the JSON. Also added a `transliteration` column ([2026-05-27b_emergency_transliteration.sql](../../services/api/migrations/2026-05-27b_emergency_transliteration.sql)) so the "Roman · English" subtext survived the migration.
- [data/emergency.json](../../data/emergency.json) stays in repo as a seed artifact (no app imports verified by grep).

**Verification (performed manually, not assumed):**
- Manual test 2026-05-27: Emergency screen renders 3 groups × 3 phrases fetched from `emergency_phrases`; "Roman · English" line present.
- `grep -rn "emergency.json" --include="*.ts" --include="*.tsx" app/ components/ hooks/ stores/ services/` returns zero hits in app code.

**Owning specs:** [CONTENT.md](CONTENT.md#emergency-content) — to be updated next session to point at the DB table instead of the JSON file.

**Status:** Closed 2026-05-27.

### C6 — Lesson-completion idempotency contract now pinned by tests ✅

**What was wrong:** [STATE.md](STATE.md#streak-logic) locks the contract that `completeLesson` is idempotent, but no tests pinned it. A future refactor that removed the store's early-return would have silently re-inflated `xp` / `totalPhrasesLearned` / `totalMinutesPracticed` on every replay.

**Resolution:** [spec_progress_persistence.md](../../spec_docs/Sameecha/spec_progress_persistence.md) bundled the test fix. [__tests__/stores/progressStore.test.ts](../../__tests__/stores/progressStore.test.ts) calls `useProgressStore.completeLesson` twice with the same slug and asserts `xp`, `totalPhrasesLearned`, `totalMinutesPracticed`, `todayMinutes`, and `completedLessons.length` do not change on the second call (and that a higher score on replay does not award additional XP either).

**Owning spec:** [STATE.md](STATE.md#streak-logic).

**Status:** Closed 2026-05-20.

### C1 — OppositeGame ported off NativeWind ✅

**What was wrong:** `src/games/opposites/` was the last holdout still using NativeWind `className` props after the broader NativeWind rip-out.

**Resolution:** Commit `01a516e` ("refactor(opposites): port OppositeGame from NativeWind to inline styles + tokens") converted all 7 OppositeGame source files (`OppositeGame.tsx`, `components/FeedbackBanner.tsx`, `components/OptionButton.tsx`, and others touched in the commit) from Tailwind `className` props to inline `style={{...}}` objects backed by Colors/Spacing/Radius/Fonts tokens. Color realignment was applied (Tailwind emerald → `Colors.primary`, etc.).

**Verification (performed this session, not assumed from the commit message):**
- `git show --stat 01a516e` returns a real commit on 2026-05-19 touching `app/(games)/opposites.tsx`, `src/games/opposites/OppositeGame.tsx`, `src/games/opposites/components/FeedbackBanner.tsx`, `src/games/opposites/components/OptionButton.tsx` (and additional files truncated by `head -30`).
- `grep -rni 'nativewind\|className=' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.json'` across the repo (excluding `node_modules`) returns zero hits. The codebase is genuinely clean of NativeWind.

**Owning spec:** [DESIGN.md](DESIGN.md).

**Status:** Closed 2026-05-19. Stale README references survive — tracked separately as C9.
