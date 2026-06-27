# Feature Tracker — Issue Log

Companion to `docs/feature-tracker.csv`. Phase 2 (code-trace + jest) findings.
**No code has been changed.** Fix decisions are deferred to owner sign-off (Phase 3).

- **Baseline:** `npx jest` → 99/99 passing, 12 suites. `npx tsc --noEmit` → clean (exit 0).
- **Reanimated worklet check:** no `moderateScale`/JS calls inside `useAnimatedStyle` worklets in AnswerOption,
  LessonSelector, or AudioOrb. (Matches the known-crash-class guardrail.) ✅
- Each issue below was confirmed against current source. Severity is my assessment; `Intentional?` flags items
  that may be by-design and should be a product decision, not a bug fix.

Legend: severity **High / Med / Low / Trivial**.

---

## Resolution log (Phase 4 — low-hanging fixes applied)

Owner approved fixing the low-hanging set. Applied **10 fixes**; re-verified with `tsc --noEmit` (exit 0) and
`jest` (99/99). Two listed candidates were found already-correct on closer read and changed nothing.

| Issue | Status | Change |
|---|---|---|
| ISS-01 | **Done** | `emergency.tsx` now `Toasts.audioFailed(retry)` on TTS failure |
| ISS-02 | **Done** | `_layout.tsx` now calls existing `Toasts.sessionLost()` on refresh-token signout |
| ISS-07 | **Done** | `lesson/[id].tsx` toasts `partUnavailable()` on invalid `?part=` before full-lesson fallback (new catalog entry) |
| ISS-08 | **Done** | `GuideFlow.tsx` races `fetchGuideContent()` vs a 6s timeout → `FALLBACK_GUIDE` |
| ISS-10 | **Done** | Removed dead `nWordsLearned` prop + unused `interpolate()` from `StreakMilestoneTakeover` |
| ISS-13 | **Done** | `progressStore.completeLesson` guards `typeof score === 'number'` before XP tier |
| ISS-15 | **Done** | Auto-replay Switch `disabled` while saving (`settings/audio.tsx`) |
| ISS-16 | **Done** | Retired image-match route shows "No longer available" message |
| ISS-18 | **Done** | `TeachPhrasesPhase` ignores chip taps while one is mid-highlight |
| ISS-21 | **Done** | `GuideStepShell` comment 4-step → 3-step |
| ISS-11 | **Wontfix** | Already correct: `useFluencyMode` folds `written`→`fluency`; null only pre-onboarding (unreachable here) |
| ISS-22 | **Wontfix** | Already correct: `LessonProgressBar` already guards `total > 0 ? … : 0` |

**Still open** (not low-hanging): ISS-03, ISS-04, ISS-05, ISS-06, ISS-09, ISS-12, ISS-14, ISS-17 (DB), ISS-19,
ISS-20. ISS-06 & ISS-14 await a product decision; ISS-17 needs a DB column.

---

## Medium

### ISS-01 — Emergency audio fails silently (no toast)
- **Story:** EMER-01 · `app/emergency.tsx:35-41`
- **Expected vs actual:** Every other audio surface toasts on failure (`GuidePhonemeButton.tsx:51`,
  `StepVowels.tsx:46`, `TeachWordsPhase.tsx:69`). Here `play()` only `console.warn`s — user taps an emergency
  card, nothing plays, no feedback. Worst place to swallow an error.
- **Proposed fix:** in the `.catch`, also call `Toasts.audioFailed(() => play(id, text))`.
- **Intentional?** No — inconsistent with the rest of the app.

### ISS-02 — Refresh-token expiry signs the user out silently
- **Story:** INFRA-04 · `app/_layout.tsx:243-249`; unused toast at `toastCatalog.ts:114`
- **Expected vs actual:** On a "refresh token" error the app calls `signOut()` + `setSession(null)` with no
  message; user is bounced to login with no idea why. `Toasts.sessionLost()` **already exists** but is never
  called.
- **Proposed fix:** call `Toasts.sessionLost()` before/at signOut on that branch.
- **Intentional?** No — the toast was written for exactly this and left unwired.

### ISS-03 — Reminder toggle not awaited / not disabled during async; desyncs on permission-deny
- **Story:** MODAL-10 · `components/modals/instances/RemindersSheet.tsx:136-142, 220-222`
- **Expected vs actual:** `onToggle` is non-async and fires `applyTime()`/`disableReminder()` without `await`;
  the `Switch` has no `disabled` prop. If the OS permission is denied, the visual toggle flips but the store
  isn't updated; re-tapping re-triggers the permission prompt. User can also double-tap mid-request.
- **Proposed fix:** make `onToggle` await; add an `isBusy` state that disables the Switch during the async flow;
  revert the toggle on failure/denial.
- **Intentional?** No — incomplete async state management.

### ISS-04 — Streak sheet "Keep learning" can point to the just-completed lesson
- **Story:** MODAL-12 · `components/modals/instances/StreakDetailSheet.tsx:83-88`
- **Expected vs actual:** `nextLessonSlot` is computed from `useCompletedLessons()` + `useDbLessons()` at render.
  If the sheet opens right after a completion (common — it can surface post-lesson) before queries invalidate,
  it can route "Keep learning" back to the lesson the user just finished.
- **Proposed fix:** pass the resolved next-lesson in as a prop from the caller, or gate on query-fresh state.
- **Intentional?** No — stale-hook race.

### ISS-05 — Onboarding step indicator inconsistent (dots say 5, labels say "of 4")
- **Story:** ONB-01..05 · `welcome.tsx:151` (0/5), `name.tsx:49,63`, `motivation.tsx:92,111`,
  `commitment.tsx:60,74`; basics labels "of 5" per audit
- **Expected vs actual:** `ProgressDots total={5}` (counts welcome as a step) while the text labels read
  "Step 1/2/3 **of 4**" (don't count welcome), and the basics screen reads "of 5". The denominators disagree
  across the same flow.
- **Proposed fix:** pick one convention — either dots `total={4}` with labels "of 4" (exclude welcome), or keep
  `total={5}` and relabel to "of 5" consistently including basics.
- **Intentional?** No — looks like drift from when the flow was re-counted.

### ISS-06 — "Skip for now" completes the lesson, same as "I'll try this"
- **Story:** LES-10 · `components/lesson/RealWorldPhase.tsx:76-81`
- **Expected vs actual:** Both CTAs call `onAdvance` → both advance to `done` and complete the lesson. "Skip
  for now" implies deferral, but there's no resume; the lesson is finished either way.
- **Proposed fix (product decision):** either rename to neutral copy (e.g. "Maybe later" with the same finish
  semantics, made explicit) or give skip a distinct path. Needs owner intent.
- **Intentional?** Possibly — there's no resume feature, so both finishing may be deliberate. Flag for decision.

### ISS-07 — Navigating to an invalid/locked lesson part silently runs the whole lesson
- **Story:** LES-01 · `app/lesson/[id].tsx:~37-40`
- **Expected vs actual:** When `?part=` doesn't match a section, `partIndex = -1`, `isPartRun = false`, and the
  full lesson runs with no message. A deep link to a locked/typo'd part gives no feedback.
- **Proposed fix:** if `part` is set but not found, toast "Part not available — starting the full lesson" (or
  route to the part chooser).
- **Intentional?** Partial — graceful fallback is by design, but the silent part is the gap.

### ISS-08 — Beginners Guide has no fetch timeout; loading can hang forever
- **Story:** GUIDE-01 / GUIDE-07 · `components/guide/GuideFlow.tsx:41-49`, `GuideLoading.tsx` (no error path)
- **Expected vs actual:** `fetchGuideContent()` is awaited once; the helper falls back on *errors*, but a
  network *stall* (no resolve, no reject) leaves `GuideLoading` spinning with no timeout and no escape but the
  back chip.
- **Proposed fix:** `Promise.race([fetchGuideContent(), timeout(Ns)])` → fall back to bundled guide on timeout.
- **Intentional?** No.

---

## Low

### ISS-09 — Phrase word-chip matching ignores Unicode/ligature variants (needs content check)
- **Story:** LES-06 · `components/lesson/TeachPhrasesPhase.tsx:34-36, 58`
- **Expected vs actual:** `normalize()` strips case + trailing punctuation only. If a phrase's transliteration
  token differs from the vocab token by composition/ligature, the chip won't match → silently disabled (no
  audio), looking identical to active chips.
- **Proposed fix:** add `.normalize('NFKD')`; **first** verify against real lesson content that any token
  actually fails to match (this may currently affect 0 phrases).
- **Intentional?** No, but unconfirmed impact — verify before fixing.

### ISS-10 — `StreakMilestoneTakeover` `nWordsLearned` prop is dead code
- **Story:** MODAL-13 · `components/modals/instances/StreakMilestoneTakeover.tsx:~65,136`
- **Expected vs actual:** `interpolate(copy.body, { nWordsLearned })` runs, but no milestone copy contains the
  `{nWordsLearned}` placeholder, so the prop is never rendered.
- **Proposed fix:** remove the prop + interpolate call, or add the placeholder to the copy if intended.
- **Intentional?** Likely shelved feature.

### ISS-11 — Goal sheet shows an empty gap for legacy `written` mode
- **Story:** MODAL-04 · `components/modals/instances/GoalSummarySheet.tsx:16-17`
- **Expected vs actual:** `goalLabel` is null when `goal` resolves to neither `spoken` nor `fluency` (e.g. a
  stale `written` mode), hiding the Learning-goal section while other sections render — asymmetric gap.
- **Proposed fix:** map `written` to a label, or guarantee mode is set before the sheet opens.
- **Intentional?** Possibly acceptable mid-migration; low impact.

### ISS-12 — ModalHost programmatic sheet-dismiss has no error guard
- **Story:** MODAL-01 · `components/modals/ModalHost.tsx:62-70`
- **Expected vs actual:** `dismiss()` calls `sheetRef.current.close()` and keeps `entry` until the sheet's
  `onDismiss` callback clears it. If `close()` throws or the callback never fires, `entry` persists and blocks
  future modals.
- **Proposed fix:** wrap `close()` in try/catch; or clear `entry` directly and let the close animation finish.
- **Intentional?** Partial — the swipe/backdrop path is by design; the programmatic path is the fragile one.

### ISS-13 — `completeLesson` awards 10 XP for a null/NaN score with no validation
- **Story:** INFRA-01 · `stores/progressStore.ts:~209`
- **Expected vs actual:** `score >= 80 ? 20 : 10` silently yields 10 if `score` is null/undefined/NaN. Type
  says `number`, but an unguarded caller could pass null.
- **Proposed fix:** `const xpAward = (typeof score === 'number' && score >= 80) ? 20 : 10;` (explicit), or
  validate at call sites.
- **Intentional?** No — defensive gap only.

### ISS-14 — Practice phases don't allow a retry on a wrong answer
- **Story:** LES-04 / LES-07 · `PracticeWordsPhase.tsx:95-97`, `PracticePhrasesPhase.tsx` (same)
- **Expected vs actual:** First pick locks; "Next" advances regardless of correctness. The "Practice" label can
  imply a second chance.
- **Proposed fix (product decision):** allow re-pick to the correct answer, or keep move-forward but make it
  clear. Likely intentional pedagogy.
- **Intentional?** Probably yes — flag for decision, not an auto-fix.

### ISS-15 — Auto-replay toggle has no pending/disabled state during save
- **Story:** SET-01 · `app/settings/audio.tsx:28-39` + Switch
- **Expected vs actual:** Optimistic update with no `disabled` during the async `updateAutoReplay`; on slow
  networks a user could toggle repeatedly. Reverts + toasts on failure (correct), just no in-flight feedback.
- **Proposed fix:** add a `saving` flag disabling the Switch during the call.
- **Intentional?** Optimistic pattern is valid; minor polish.

### ISS-16 — Retired image-match route shows generic "Game not found"
- **Story:** GAME-03 · `app/(games)/[game]/[n].tsx` (NotFound branch)
- **Expected vs actual:** `/image-match/*` is correctly rejected but shows the generic not-found message rather
  than "Image match is no longer available."
- **Proposed fix:** branch on `gameParam === 'image-match'` for a retirement message (only if such links can
  still exist).
- **Intentional?** Partial — dead route is known; copy is just generic.

### ISS-17 — Emergency urgency ranking via fragile English regex
- **Story:** EMER-01 · `app/emergency.tsx:~369-384` (CONTEXT_RULES)
- **Expected vs actual:** Badge + urgency rank derived by regex over the English `meaning`. A DB re-seed with
  different English wording silently re-ranks/mis-badges — which defeats the "survive re-seeds" comment.
- **Proposed fix:** add a `rank` column to `emergency_phrases` and sort by it (DB change — out of this run's
  scope per plan).
- **Intentional?** Partly documented; the fragility is real but the fix touches DB.

### ISS-18 — Rapid chip taps queue overlapping audio (no guard)
- **Story:** LES-06 · `components/lesson/TeachPhrasesPhase.tsx:92-98`
- **Expected vs actual:** Tapping a chip again within the 600ms highlight replays unconditionally and restarts
  the timer; fast taps can overlap audio.
- **Proposed fix:** ignore taps while a chip is highlighted/playing.
- **Intentional?** No — minor.

### ISS-19 — DoneCard completion mutation: on-mount, not cancellable, missable error toast
- **Story:** LES-11 · `components/lesson/DoneCard.tsx:113-118`
- **Expected vs actual:** Save fires on mount with no pending UI; on a slow net the user may leave before the
  error toast appears. (Mitigated by retry-on-tap, so partial.)
- **Proposed fix:** show a pending state on the nav buttons while the mutation is in-flight; use a sticky error.
- **Intentional?** Partial — retry exists; the missing pending UI is the gap.

### ISS-20 — Guide audio-fail toast can loop with no skip/dismiss
- **Story:** GUIDE-04/05/06 · `GuidePhonemeButton.tsx:51`, `StepVowels.tsx:46`, `StepReading.tsx:61`
- **Expected vs actual:** `Toasts.audioFailed(retry)` offers only retry; if TTS is permanently unavailable the
  user retries indefinitely with no acknowledge/skip from the toast.
- **Proposed fix:** allow dismiss/skip on the audio-failed toast (or detect no-voice and suppress retry).
- **Intentional?** No.

### ISS-21 — Stale "4-step" comment in GuideStepShell (docs only)
- **Story:** GUIDE-02 · `components/guide/GuideStepShell.tsx:~28`
- **Expected vs actual:** Comment says "4-step" but `GUIDE_STEP_COUNT === 3`. Code is correct; comment is stale.
- **Proposed fix:** update the comment to "3-step."
- **Intentional?** No — leftover from an earlier design.

---

## Trivial

### ISS-22 — LessonProgressBar computes `current/total` before clamping when total=0
- **Story:** LES-15 · `components/lesson/LessonProgressBar.tsx:~14`
- **Expected vs actual:** `total=0` → `Infinity` → clamped to 1, but conceptually should be 0%. Result is
  visually fine (clamp catches it); logic is counterintuitive.
- **Proposed fix:** `total === 0 ? 0 : clamp(current/total)`.
- **Intentional?** No — cosmetic logic nit.

---

## Verified correct (candidate issues REFUTED — no defect)

- **Profile "0 reasons" label** (`profile.tsx:96-98`): code filters the count to `null` when motivations is
  empty, so it never shows "0 reasons." ✅
- **Login `confirmEmailPending` toast** (`login.tsx:134-139`): only fires when `!data.session` (genuinely
  pending); defensive and correct given email-confirm is OFF. ✅
- **Home basics-nudge toast** (`index.tsx:71-77`): correctly gated (hydrated + guide-seen + not-yet-nudged,
  once). ✅
- **Reset-password helper text** (`reset-password.tsx:107-112`): correctly shows length vs match hints. ✅
- **Reanimated worklets**: no JS/`moderateScale` calls inside `useAnimatedStyle`. ✅

## Intentional-by-design (cite; do NOT fix without owner intent)

- **StepReading hard-coded Ta/ta + Da/da comparisons** — comment at `StepReading.tsx:~42` says comparison
  glyphs are fixed UI chrome; only the try-it word is DB-sourced.
- **image-match listed in `constants/games.ts`** while routed as not-found — known dead game, removal in
  progress (per repo memory `db_image_match_dropped`).
- **`SUPPORT_EMAIL = null` hides Contact/Report rows** (`help.tsx`) — placeholder until owner fills it in.
- **Login min-length 6 vs sign-up 8+** — deliberate (login lenient, sign-up strict).

---

## Severity tally

| Severity | Count | IDs |
|---|---|---|
| High | 0 | — |
| Med | 8 | ISS-01..08 |
| Low | 13 | ISS-09..21 |
| Trivial | 1 | ISS-22 |

Two of the Med items are **product decisions** rather than clear bugs (ISS-06 skip-completes,
overlaps with ISS-14 retry pedagogy). ISS-17 fix needs a DB change (out of this run's scope).
