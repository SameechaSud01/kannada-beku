## TODO

Task backlog. IDs are stable (Txx). Close items in the same commit that
resolves them. Inline code markers use TODO(Txx) and must reference an ID here.

IDs are monotonic and never reused. Items sourced from a CONTRADICTIONS.md
divergence cite its `Cxx` ID — that entry stays canonical; this is the worklist
pointer. Items sourced from a STATE.md `[OPEN]` block or inline `TODO:` cite the
section.

## Open

- T001 [OPEN] Remove rowdy/classic voice system once owner picks the surviving voice (C3) — constants/copy.ts, hooks/useCopy.ts, stores/useUserStore.ts
- T002 [OPEN] Implement `fill_blank` drill for real, or remove it from the type union + authoring rules (C7) — components/lesson/drill/FillBlankPlaceholder.tsx, constants/lessons/types.ts
- T003 [OPEN] Ship Beginners' Guide code: routes, components, store flags, L0 seed migration, audit recompute predicate (C11) — app/onboarding/basics.tsx, app/guide.tsx, components/guide/*
- T004 [OPEN] Drop stale NativeWind references from README (C9) — README.md (lines 3, 153)
- T005 [OPEN] Update CONTENT.md game-content section to point at DB seed + accessors (C12) — docs/foundation/CONTENT.md
- T006 [OPEN] Final on-device verification of playful redesign, then merge app_redesign → main (C14) — branch app_redesign
- T007 [OPEN] On-device verification of transliteration font swap (Lora → DM Sans bold) (C15) — constants/fonts.ts, app/_layout.tsx
- T008 [OPEN] Surface `totalMinutesPracticed` in UI — tracked but not shown (STATE §useProgressStore) — stores/progressStore.ts
- T009 [OPEN] Surface `weeklyActivity` week-view — not yet surfaced (STATE §useProgressStore) — stores/progressStore.ts
- T010 [OPEN] Add `useXp()` and `useCurrentLesson()` selectors (STATE §Selectors/hooks) — hooks/progress.ts
- T011 [OPEN] Audit sign-out reset behavior + same-account progress restore (STATE §Reset/logout [OPEN])
- T012 [OPEN] Apply `ulp_*_own` RLS pattern before first read/write of conversation_/quick_quiz_ tables (STATE §RLS TODO) — services/api/migrations/
- T013 [OPEN] Document client↔server sync direction + conflict resolution once persistence is live (STATE §Cross-store sync [OPEN])
- T014 [OPEN] Show the alphabet chart in all lessons
- T015 [OPEN] Let the user tap "respectful" or "neutral" to see the difference between them
- T016 [OPEN] For any word where the user has to hold the letter, give an option to see the initial basics card showing the difference
- T017 [OPEN] Figure out why profile load takes so long, see if caching is an option
- T018 [OPEN] When an entire lesson ends the screen has been fixed, need to apply the same to sub parts of the same.
- T019 [OPEN] When user goes offline, save current state locally, and push to DB once back online. (sentry)
- T020 [OPEN] Make font size dynamic to work with the length of the word
- T021 [OPEN] Right now, correct is yellow. We need to make correct green and wrong red
## Done

- (move items here with [DONE], keep the ID)
