# Spec: Scalability & Offline Fixes

**Status:** DRAFT — awaiting owner approval
**Date:** 2026-07-08
**Source:** SCALABILITY_AUDIT.html (repo root) + owner direction in chat (end-of-game mastery recompute; Emergency fully offline)
**Branch:** new branch `perf/offline-content-mastery` off `main` (current `fix/lesson-flow-polish` carries uncommitted onboarding work + a TEMP-PREVIEW gate that must not ride along)

---

## Scope

Five phases, each independently shippable and owner-tested before the next begins:

1. **Instant Profile + end-of-game mastery recompute** (client)
2. **Emergency phrases completely offline** (client + content extraction)
3. **Bundle game items in TS; collapse the mastery fan-out** (client + content extraction)
4. **Resilience housekeeping:** request timeouts, defensive limits, weeklyActivity prune (client)
5. **DB cleanup:** drop the unused `recompute_overall_progress` triggers (owner-run SQL)

### Out of scope
- Preview/production Supabase project split (owner decision, tracked separately)
- Any change to lesson content, lesson flow, or the overall-progress formula (formula is `[LOCKED]` per docs/foundation)
- Persisting the TanStack Query cache to AsyncStorage (revisit only if Phase 1+3 don't make Profile feel instant)

---

## Phase 1 — Instant Profile + end-of-game mastery recompute

### Current behavior
- `app/(tabs)/profile.tsx:113` returns `<ProfileSkeleton/>` while the game-mastery query loads, blocking the entire page (name, stats, week strip — all local) on a ~44-request network fan-out. The designed `'—'` fallback at line 234 is unreachable.
- Every answer tap in all four games calls `queryClient.invalidateQueries(['game-mastery', userId])` (`hooks/games/{opposites,dictation,quickQuiz,conversations}.ts`), so any later Profile/Home mount refetches the whole fan-out.

### Target behavior
1. Remove the skeleton gate. Profile renders immediately from local data; the overall-progress band shows `—` until the mastery query resolves, then fills in (existing line-234 path).
2. Remove the per-answer `invalidateQueries` from all four game hooks.
3. Refresh game mastery **once per game session** instead:
   - When the shared `ResultScreen` (src/games/shared/ResultScreen.tsx) mounts → background `queryClient.refetchQueries(['game-mastery', userId])`.
   - Also on game-screen unmount (`app/(games)/[game]/[n].tsx`) to cover mid-game quits, deduped so finishing a game doesn't fire twice.
4. **Race guard:** answer writes are fire-and-forget; the refetch must not run while attempt mutations are still in flight. Wait for `queryClient.isMutating()` to settle (or a bounded ~1.5s delay, whichever is simpler in code) before refetching. If the device is offline, skip the refetch — the queued attempts will flush later and the next natural refetch picks them up.

### Acceptance criteria
- Cold launch → Profile opens instantly (no full-page skeleton); band shows `—` then the percentage.
- Play a game to the end screen, then open Profile → percentage reflects the new answers with **no fetch triggered by the Profile mount** (verify via network log / react-query devtools).
- Quit a game mid-way → mastery still refreshes (unmount path).
- Answering questions no longer marks the mastery query stale (no refetch storm on tab switches).
- `npm run typecheck` clean; screenshots of Profile on iPhone SE + 15 Pro Max.
- **Owner manual test before Phase 2.**

---

## Phase 2 — Emergency phrases completely offline

### Current behavior
`services/api/emergency.ts:35-37` selects the whole `emergency_phrases` table per device (24h client cache). No bundled fallback — a first-ever launch while offline shows an error on the Emergency screen, despite Learn/Home advertising it as the offline practice path.

### Target behavior
1. Generate `constants/emergencyPhrases.ts` from the **live DB** (live DB is the content source of truth; repo seed SQL has drifted). New script `scripts/generateContent.mjs` following the `scripts/generateAudio.mjs` pattern (`node --env-file=.env`), emitting the same `EmergencyGroup[]` shape the screen consumes, preserving group/sort order and ISO transliterations.
2. `fetchEmergencyPhrases()` returns the bundled constant synchronously. The DB read is **removed** (table stays in the DB as the regeneration source; content changes ship via app/EAS update).
3. Audio: verify every bundled phrase resolves in `constants/audioManifest.ts`; anything missing falls back to on-device TTS (existing behavior). List any gaps in the PR description.

### Acceptance criteria
- Fresh install (or cleared storage) in airplane mode → Emergency screen renders fully; phrase audio plays (bundled MP3 or device TTS).
- Rendered content is byte-identical to what the DB served before the change (diff the generated TS against a live fetch during review).
- `npm run typecheck` clean; screenshot of Emergency screen.
- **Owner manual test before Phase 3.**

---

## Phase 3 — Bundle game items; collapse mastery fan-out

### Current behavior
- The four games fetch items per lesson from `opposites_items` / `dictation_items` / `quick_quiz_items` / `conversation_scenarios`+`conversation_items` (1h cache, retry ×2, **no offline fallback** — games unplayable offline with a cold cache).
- `fetchGameMasteryByLesson` (`services/api/gameMastery.ts:71`) = 4 progress reads + one item fetch per game per lesson (conversations: two sequential) ≈ 44 requests per computation.

### Target behavior
1. Extend `scripts/generateContent.mjs` to dump the four games' item tables from the live DB into `constants/games/` (one file per game), **including the real DB row UUIDs** — progress rows and the `record_*_attempt` RPCs key on `item_id`, so bundled ids must match the DB exactly. Quick Quiz keeps its 3-lesson distractor-neighbor behavior (data is per-lesson; the neighbor logic stays in the component).
2. `fetch*ItemsByLessonNo` return bundled data synchronously (mirror of the `TS_LESSONS` pattern in `services/api/lessons.ts`). DB reads removed; tables remain as the regeneration source.
3. `gameMastery.ts` builds the item→lesson map from the bundles → the query becomes **4 small indexed progress reads**.
4. Games become playable offline end-to-end: items load from bundle; attempts queue in the existing offline outbox and flush on reconnect.
5. Conversation `[name]` personalization keeps working — placeholder substitution is client-side; bundled rows carry the placeholder verbatim. Verify explicitly.

### Acceptance criteria
- Airplane mode, cold cache → all four games load and play; attempts appear in the sync queue and flush on reconnect.
- Profile mastery query issues exactly 4 network requests (network log).
- Parity check in review: generated TS vs live DB rows (id, text, sort_order) — zero diffs at generation time.
- Conversation game still greets with the user's name.
- `npm run typecheck` clean; screenshots of one game per type.
- **Owner manual test before Phase 4.**

---

## Phase 4 — Resilience housekeeping

1. `withTimeout(promise, ms)` helper (~10s) wrapping the remaining Supabase reads (auth-time user row, completed lessons, guide, the 4 progress reads) so a stalled connection surfaces the error/fallback state instead of an endless spinner. Unit-test the helper.
2. Defensive `.limit()` on the remaining unbounded selects (`fetchCompletedLessons`, `fetchCorrectItemIds` — generous caps, e.g. 2000).
3. Prune `progressStore.weeklyActivity` to a rolling 60-day window on rehydrate. Unit-test the prune.

### Acceptance criteria
- Unit tests for `withTimeout` and the prune pass; `npm run typecheck` clean.
- Existing behavior unchanged on the happy path (owner smoke test).

---

## Phase 5 — DB cleanup (owner-run SQL; no app change)

The app no longer reads `user_overall_progress` (client-side rollup since ui_ux_3), but AFTER INSERT/UPDATE triggers still run a 4-way aggregate recompute on **every game answer and lesson completion** — the single biggest write-side cost at scale.

1. I provide `services/api/migrations/2026-07-XX_drop_overall_progress_triggers.sql`:
   - First a **verification query** listing live triggers (the live DB was hand-patched 2026-06-13 and diverges from repo migrations — image_match dropped, function rewritten; do not trust repo SQL as ground truth).
   - Then `DROP TRIGGER` for each remaining `trg_recompute_overall_progress*` and `DROP FUNCTION recompute_overall_progress`.
   - `user_overall_progress` table is **kept** (inert, harmless, preserves history). Dropping it is a separate owner call.
2. Owner runs it in the Supabase dashboard (no CLI; anon key can't run DDL).

### Acceptance criteria
- Verification query shows zero recompute triggers remaining.
- A game answer and a lesson completion still succeed afterwards (the RPCs don't reference the function).

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Bundled content drifts from DB after future content edits | DB stays the regeneration source; rerunning `generateContent.mjs` is part of any content-change workflow. Content changes now require an app/EAS update — accepted trade-off. |
| Bundled item UUIDs diverge from DB (breaks progress FK) | Generator pulls ids from the live DB verbatim; parity check in each PR. Never hand-edit generated files. |
| End-screen refetch races the last answer write | Wait for mutations to settle before refetching; skip when offline. |
| Mid-game quit leaves mastery stale | Unmount-path refetch (Phase 1.3). |
| Live-DB divergence makes repo trigger SQL wrong | Phase 5 script verifies live trigger list before dropping anything. |

## Implementation log

### Phase 1 — implemented 2026-07-08 (typecheck ✓, sim-verified ✓)
| Change | File(s) |
|---|---|
| Removed full-page skeleton gate; `—` fallback now reachable | `app/(tabs)/profile.tsx` |
| Per-answer `invalidateQueries` → `markMasteryDirty()` | `hooks/games/{opposites,dictation,quickQuiz,conversations}.ts` |
| New dirty-flag refresh module (mutation-settle + offline guard) | `services/progress/masteryRefresh.ts` |
| Refetch on end screen mount | `src/games/shared/ResultScreen.tsx` |
| Refetch on game-screen unmount (mid-game quits) | `app/(games)/[game]/[n].tsx` |

Verified: Profile renders full content at 1s on iPhone 17 Pro sim (screenshots t1/t2 identical, no skeleton). Not sim-exercised: end-of-game refetch (owner manual test).
Orphan flagged: `ProfileSkeleton` in `components/states/skeletons/TabSkeletons.tsx` now unused (left in place).

### Phase 2 — implemented 2026-07-08 (typecheck ✓, sim-verified ✓)
| Change | File(s) |
|---|---|
| Content generator script (live DB → TS bundles) + `npm run gen:content` | `scripts/generateContent.mjs`, `package.json` |
| Bundled emergency phrases (9 rows, 3 groups) | `constants/emergencyPhrases.ts` (generated) |
| `fetchEmergencyPhrases` serves the bundle; DB read removed | `services/api/emergency.ts` |

Verified: Emergency renders all groups/phrases from the bundle on sim. Audio-coverage check: 2 phrases lack bundled MP3s ("No, don't want", "It's okay") — device TTS fallback covers them; queue a `gen:audio` run to close.

### Phase 3 — implemented 2026-07-08 (typecheck ✓, sim-verified ✓)
| Change | File(s) |
|---|---|
| Bundled game items with verbatim DB UUIDs (30 opposites, 45 dictation, 45 quiz, 4 scenarios/12 turns) | `constants/games/{oppositesItems,dictationItems,quickQuizItems,conversationScenarios}.ts` (generated) |
| Item fetchers serve bundles; `lessonIdByNo`/row-mapping removed; record RPCs unchanged | `services/api/games/{opposites,dictation,quickQuiz,conversations}.ts` |
| Mastery fan-out collapsed to 4 progress reads; timing log added | `services/api/gameMastery.ts` |
| Production logs: mastery refetch at game end (+ duration), offline skip | `services/progress/masteryRefresh.ts` |

Verified on sim: Opposites part chooser shows correct per-part question counts and gameplay renders question + 4 options from the bundle; `[name]` personalization path unchanged (select-side, deep-copy checked). Mutation-safety audited: all game shuffles copy before shuffling; `personalizeScenarios` deep-copies.
True airplane-mode run: owner manual test (sim shares the Mac's network).

### Phase 4 — implemented 2026-07-08 (typecheck ✓, 102/102 jest ✓, boot sim-verified ✓)
| Change | File(s) |
|---|---|
| `withTimeout` helper (10s default; races, doesn't abort) | `lib/withTimeout.ts` |
| Timeout applied to the remaining reads: user row, completed lessons, guide, 4 progress reads | `services/api/{users,progress,guide,gameMastery}.ts` |
| Defensive `.limit()`: 500 on completed lessons, 2000 on progress item-ids | `services/api/{progress,gameMastery}.ts` |
| `weeklyActivity` pruned to 60-day rolling window on rehydrate (same-ref no-op skips the write) | `utils/pruneWeeklyActivity.ts`, `stores/progressStore.ts` |
| Unit tests (11) for both helpers | `__tests__/lib/withTimeout.test.ts`, `__tests__/utils/pruneWeeklyActivity.test.ts` |

### Phase 5 — RUN BY OWNER 2026-07-08 ✓
`services/api/migrations/2026-07-08_drop_overall_progress_triggers.sql` executed in the dashboard. Live trigger names differed from repo migrations (`trg_ulp/opp/dict_recompute_overall` — surfaced by the first run's dependency error, script corrected). Post-run verify: Step 1 query returns zero rows. `user_overall_progress` table kept per owner decision. Remaining check: one game answer + one lesson completion in the app to confirm writes (the record_* RPCs never referenced the dropped function — expected to pass).

## Measured results (live-DB stress benchmarks, 2026-07-08)

Pre-fix benchmark: fan-out 36 req / 254 ms mean vs 4 req / 53 ms; trigger overhead ~0 ms (finding downgraded); 10-user burst 360 req / 1.8 s / 0 failures.

Post-fix benchmark (after Phases 1–3): full new-style session (6 reads) p50 110 ms; end-of-game refetch 53 ms; **25 concurrent users: new shape 0.38 s vs old shape 18.2 s (48×)** — the concurrency win is the headline scalability proof. Emergency + game items now zero-request/offline. Full numbers in `SCALABILITY_AUDIT.html` §6 + addendum.

## Open questions for owner

1. **Emergency/game content updates will require an app or EAS update** once reads move to bundles (same as lessons today). Confirm this is acceptable.
2. Phase 5: triggers + function only (recommended), or also drop the `user_overall_progress` table?
3. Preview/prod Supabase split — schedule separately or fold in after Phase 5?
