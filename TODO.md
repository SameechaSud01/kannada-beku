## TODO

Task backlog. IDs are stable (Txx). Close items in the same commit that
resolves them. Inline code markers use TODO(Txx) and must reference an ID here.

IDs are monotonic and never reused. Items sourced from a CONTRADICTIONS.md
divergence cite its `Cxx` ID — that entry stays canonical; this is the worklist
pointer. Items sourced from a STATE.md `[OPEN]` block or inline `TODO:` cite the
section.

## Open

- T015 [OPEN] Let the user tap "respectful" or "neutral" to see the difference between them
- T016 [OPEN] For any word where the user has to hold the letter, give an option to see the initial basics card showing the difference
- T022 [OPEN] how can we incorpoaratre images to show along side words
- T023 [OPEN] carousel posts using claude for testing

## Done
- T007 [DONE] Transliteration font swap verified — Lora fully retired (no `Fonts.lora`, all transliteration on `dmSans.bold`); removed dead `@expo-google-fonts/lora` dep + cleaned stale docs; app builds/runs on iOS sim without Lora (C15 resolved)
- T006 [DONE] Playful redesign verified rendering on iOS simulator (Baloo type, floating pill tabbar, gradient cards, multi-ring); `app_redesign` already merged into `main` (C14 resolved)
- T019 [DONE] Offline-first progress sync — local-first lesson completion + game attempts queue to a persisted outbox (`stores/syncQueueStore.ts`) and flush via `flushSyncQueue()` on launch + `expo-network` reconnect; idempotent, poison-pill capped, Sentry-instrumented
- T001 [DONE] Removed rowdy/classic voice system — owner kept classic; copy.ts collapsed to single strings, useCopy() returns directly, `mode` dropped from useUserStore (user_prefs v2 migrate strips it) (C3 resolved)
- T022 [DONE] Info "i" on the Home Daily-Goal card opens a `RingInfoSheet` explaining how each ring (Listen/Speak/Practice) is scored + that they reset at midnight
- T003 [DONE] Beginners' Guide code already shipped (basics route, app/guide/*, store flags, L0 seed + content migrations); verified recompute predicate can't count L0 (C11 resolved)
- T013 [DONE] Documented client↔server sync — offline-first client, server as backup; write/reconcile paths + conflict resolution (union completions, personal-best scores, client-owned counters) in STATE §Cross-store sync
- T012 [DONE] RLS for quick_quiz_/conversation_ tables was already shipped in their 2026-06-02 migrations (select-only items, own-row progress, record_*_attempt RPCs); documented it in STATE §RLS and closed the stale TODO
- T010 [DONE] Added `useCurrentLesson()` + `useWeekActivity()` selectors (`useXp()`/`useMinutesPracticed()` already existed); STATE Selectors table updated
- T009 [DONE] `weeklyActivity` week-view — Profile "This week" strip (last 7 days) via `useWeekActivity()`
- T008 [DONE] `totalMinutesPracticed` surfaced as a Profile "Minutes" stat card via `useMinutesPracticed()`
- T020 [DONE] Dynamic font sizing — `utils/fontScale.ts` `fitFontSize()` shrinks long words/phrases below the max on the teach/practice displays (`adjustsFontSizeToFit` kept as backstop)
- T011 [DONE] Audited sign-out/reset — behavior is correct (same-account preserves, cross-account wipes); documented in STATE §Reset/logout and fixed a stale `reset()` claim. Account-deletion left as the one open product decision
- T021 [DONE] Correct now green / wrong red — QuickQuiz `QuizOptionButton` ported off gold to match the owner-locked green/red answer feedback (lesson AnswerOption was already green/red)
- T005 [DONE] CONTENT.md game-content section now points at DB seed + accessors; Quick Quiz promoted to live (C12 resolved)
- T004 [DONE] Dropped stale NativeWind references — README/CLAUDE.md were already clean; fixed ONBOARDING.md + DESIGN.md drift note (C9 resolved)
- T002 [DONE] `fill_blank` removed with the lesson-flow redesign (no drill system in code); cleaned CONTENT.md authoring rule + DESIGN.md component list (C7 resolved, option b)
- T018 [DONE] Sub-part lesson-end screen (PartDoneCard) already uses the same trail layout as the full DoneCard; the calmer "orientation, not applause" tone is intentional — closed per owner (no change needed)
- T017 [DONE] Figure out why profile load takes so long, see if caching is an option
- (move items here with [DONE], keep the ID)
