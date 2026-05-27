---
doc: AUDIT
audit: app-non-negotiables
status: report
owner: samee
date: 2026-05-27
auditor: claude-code
related:
  - ../foundation/README.md
  - ../foundation/CONTRADICTIONS.md
---

# App Non-Negotiables — Audit Report (2026-05-27)

Read-only audit run against the [App Non-Negotiables spec](https://...). No code was modified during this pass. This document records evidence and findings only — see the [Recommended Fixes](#recommended-fixes-ranked-impact--effort) section for ordered next steps; nothing here is approved work.

**Scope:** Expo SDK 54 / RN 0.81 app with Supabase backend. No standalone app server (Supabase is BaaS), so "backend" checks are read as "Supabase RPC + RLS + SQL migrations."

**Status legend:** `[PASS]` / `[FAIL]` / `[NEEDS REVIEW]` / `[N/A]`.

---

## 1. Structure

### [PASS] 1.1 No direct fetch/axios in UI
- **Evidence:** `grep -E "fetch\(|axios\." app components hooks` → 0 hits. All network access is funneled through `services/api/*.ts` and consumed via hooks.
- **Notes:** `app/_layout.tsx`, `app/(auth)/login.tsx`, and `stores/useAuthStore.ts` import `supabase` directly to subscribe to `auth.onAuthStateChange` / call `signOut`. That is session-lifecycle, not data fetching, and is the documented `supabase-js` pattern.

### [PASS] 1.2 Business logic mostly out of JSX
- **Evidence:** Lesson runner logic in [hooks/useLessonRunner.ts](../../hooks/useLessonRunner.ts); progress math in [stores/progressStore.ts](../../stores/progressStore.ts) (`completeLesson` is idempotent and computes XP centrally); copy via [hooks/useCopy.ts](../../hooks/useCopy.ts). Screen files are mostly composition.
- **Notes:** [app/(tabs)/learn.tsx](../../app/(tabs)/learn.tsx) lines 56–77 does inline view-model computation (joining `PLANNED_LESSON_SLOTS` with DB rows + completion state), but it's a `.map` + ternary at one level of depth — within tolerance.

### [PASS] 1.3 No DB/ORM imports in UI
- **Evidence:** `grep -E "prisma|drizzle|knex|sequelize|typeorm"` → 0 hits. Supabase client is wrapped per check 1.1.

### [PASS] 1.4 Single state library
- **Evidence:** [package.json](../../package.json) declares Zustand for client state + TanStack Query for server state. No competing libraries. Clear split: persisted Zustand stores ([useUserStore.ts](../../stores/useUserStore.ts), [progressStore.ts](../../stores/progressStore.ts), [useAuthStore.ts](../../stores/useAuthStore.ts)) vs. React Query (`useDbLessons`, `useDbLesson`, `useEmergencyPhrases`, `useOpposites*`, `useCompleteLessonMutation`).

### [NEEDS REVIEW] 1.5 Possible duplicate state — completedLessons
- **Evidence:** Server truth lives in `public.user_lesson_progress`; client mirrors it in [useProgressStore.completedLessons](../../stores/progressStore.ts); hydration runs in [app/_layout.tsx](../../app/_layout.tsx) lines 39–64 (`hydrateCompletions`).
- **Notes:** Intentional offline-first mirror, not a bug — `hydrateFromServerCompletions` does a deduped union. But there is no `useQuery` for completions, so React Query and the Zustand store both touch lesson-progress data. Worth knowing.

### [NEEDS REVIEW] 1.6 Folder organization
- **Evidence:** Top-level layout is type-based (`components/`, `hooks/`, `stores/`, `services/`) except [src/games/](../../src/games/) (`opposites`, `dictation`, `imagematch`) which is feature-based.
- **Notes:** With ~10 lesson screens + 3 games + onboarding + auth, the project is at the threshold the spec calls out. `components/lesson/`, `components/onboarding/`, `components/modals/` already group by domain inside `components/`, so the structure is consistent and discoverable. Flagging for human judgement — not failing.

### [PASS] 1.7 Shared UI primitives location
- **Evidence:** [components/ui/](../../components/ui/) holds `Button.tsx`, `TabBar.tsx`, `RoundIconButton.tsx`, `ExitBackButton.tsx`.

### [PASS] 1.8 No circular imports
- **Evidence:** `npx madge --circular --extensions ts,tsx app components hooks src stores services constants` → "✔ No circular dependency found!" across 123 files.

### [PASS] 1.9 Typed contracts
- **Evidence:** [tsconfig.json](../../tsconfig.json) extends `expo/tsconfig.base` with `"strict": true`. `grep ': any|<any>|as any'` across source → **0 hits.** Only `@ts-expect-error` usage is 3 well-justified suppressions in [components/modals/ModalHost.tsx](../../components/modals/ModalHost.tsx) (props validated at call site). API responses are typed (`UserRow`, `LessonRow`, `LessonCompletion`, `Lesson`). Stores typed (`ProgressState`, `UserState`, `AuthState`). Navigation params accessed via `useLocalSearchParams<{ id: string }>()`.
- **Notes:** Did not verify Expo Router typed routes (`experiments.typedRoutes`) is enabled — [app.json](../../app.json) has no `experiments` block. The per-call generic on `useLocalSearchParams` is the manual fallback, used consistently.

---

## 2. Stack

### [FAIL] 2.1 Dependency health — outdated
- **Evidence:** `npm outdated` shows the entire Expo + RN core stack is **two SDK majors behind** — Expo 54 → 56 latest, expo-router 6.0.23 → 56.2.7, expo-constants 18 → 56, expo-linking 8 → 56, expo-blur 15 → 56, react-native 0.81.5 → 0.85.3, etc. Spec rule: "not 2+ majors behind."
- **Notes:** Several non-Expo deps also lag (`@tanstack/react-query` 5.95 → 5.100, `@supabase/supabase-js` 2.101 → 2.106, jest 29 → 30, `@testing-library/react-native` 12 → 13, async-storage 2 → 3). Upgrading should be planned as a coordinated SDK bump — RN/Expo majors must move together.

### [FAIL] 2.2 npm audit — 1 high, 17 moderate
- **Evidence:** `npm audit --json`
  - **HIGH:** `@xmldom/xmldom` — XML injection / uncontrolled recursion / node-injection (4 advisories). Pulled in via `xcode` → `@expo/config-plugins` → `@expo/cli` (build-time only, not in the shipped bundle).
  - 17 moderate: `@expo/*` chain, `postcss`, `ws`, `uuid`, `brace-expansion`. Most are transitive Expo build-time deps.
- **Notes:** No critical, no app-runtime exposure visible — xmldom only runs during build/native-code generation. Still fails the literal rule ("critical/high clean OR documented justification"). The bundled Expo SDK upgrade in 2.1 likely resolves most of these.

### [PASS] 2.3 Auth provider not deeply embedded
- **Evidence:** `grep "supabase\." app components hooks` shows only 4 files reach into supabase directly ([app/_layout.tsx](../../app/_layout.tsx), [app/(auth)/login.tsx](../../app/(auth)/login.tsx), [stores/useAuthStore.ts](../../stores/useAuthStore.ts), and the service layer). All data access goes through `services/api/*`. Swapping providers would touch a handful of files, not "rewriting unrelated code."

### [NEEDS REVIEW] 2.4 Data export path
- **Evidence:** Supabase ships built-in CSV/SQL export and `pg_dump` access — capability exists at the BaaS level. The repo itself does not document an export procedure.
- **Notes:** Mark NEEDS REVIEW because the spec asks for a "documented" path. Capability is fine; documentation gap.

### [PASS] 2.5 Expo Go vs Dev Client documented
- **Evidence:** [README.md](../../README.md) line 64 and [ONBOARDING.md](../../ONBOARDING.md) lines 115, 132 both mention "Expo Go or dev client" for `npm start`. The project currently runs in Expo Go (no `expo-dev-client` dep, no required native modules outside the SDK).

### [NEEDS REVIEW] 2.6 EAS Build configured but minimal
- **Evidence:** [eas.json](../../eas.json) exists with `development`, `preview`, `production` profiles, but profiles are essentially empty (no resource class, no env, no channel). Sufficient to run `eas build`, not yet production-grade.

### [FAIL] 2.7 expo-updates not configured
- **Evidence:** `expo-updates` is absent from [package.json](../../package.json) and [app.json](../../app.json) has no `updates` block. Spec asks "if OTA updates are intended" — not currently intended, but worth confirming. **Verify with owner whether OTA is part of the release plan.**

---

## 3. Scalability

### [FAIL] 3.1 Lists — ScrollView+map everywhere, zero FlatList/FlashList
- **Evidence:** `grep "FlatList|FlashList|SectionList"` across `app/`, `components/`, `src/` → **0 hits.** Every list uses `<ScrollView>` + `.map()`:
  - [app/(tabs)/learn.tsx](../../app/(tabs)/learn.tsx) line 197 — `rows.map` over `PLANNED_LESSON_SLOTS` (currently ~8 items; could grow).
  - [app/(tabs)/profile.tsx](../../app/(tabs)/profile.tsx) line 365 — `settingsItems.map` (small, fixed).
  - [app/(tabs)/practice.tsx](../../app/(tabs)/practice.tsx) line 179 — `GAMES.map` (3 items, fixed).
  - [app/emergency.tsx](../../app/emergency.tsx) lines 111, 161 — nested map over groups × items (~9 total).
  - [components/lesson/LessonSelector.tsx](../../components/lesson/LessonSelector.tsx) line 267 — `lessons.map` (10 items, will grow with curriculum).
  - [components/lesson/DoneCard.tsx](../../components/lesson/DoneCard.tsx) line 301 — `games.map`.
  - [app/heritage/[id].tsx](../../app/heritage/[id].tsx) line 117 — paragraph blocks.
- **Notes:** Spec rule is FlatList for "any list that could exceed ~50 items." Today none does — curriculum cap is 10 lessons, settings ≤6, games = 3, emergency phrases = 9. So this is a **scalability tripwire FAIL, not a current-bug FAIL.** As the lesson library grows past ~50 cards, or if you add a phrase library / vocab list / history screen, `LessonSelector` and the learn screen will need to migrate. The [CLAUDE.md](../../.claude/CLAUDE.md) project rule explicitly mandates FlatList/FlashList for >10 items — code currently violates that rule for the 10-item lesson selector.

### [FAIL] 3.2 keyExtractor — index used as key in 3 places
- **Evidence:**
  - [app/heritage/[id].tsx](../../app/heritage/[id].tsx) line 119 — `key={i}` on paragraph blocks.
  - [components/modals/instances/StreakMilestoneTakeover.tsx](../../components/modals/instances/StreakMilestoneTakeover.tsx) line 225 — `key={i}` on streak dots.
  - [components/onboarding/ProgressDots.tsx](../../components/onboarding/ProgressDots.tsx) line 16 — `key={i}` on dots.
- **Notes:** Dots are static-length and never reordered, so the React-reconciler bug surface is near zero. Heritage paragraphs are the only dynamic case. Low real-world risk, but spec rule violated literally.

### [PASS] 3.3 Backend stateless
- **Evidence:** Supabase + RLS — no app server to keep state in. Auth tokens persist in `expo-secure-store` ([services/api/supabase.ts](../../services/api/supabase.ts) lines 13–21), not in memory.

### [FAIL] 3.4 Database indexes — only one explicit index
- **Evidence:** `grep "create.*index" services/api/migrations/*.sql` → only `lessons_slug_unique` ([2026-05-20_progress_persistence.sql](../../services/api/migrations/2026-05-20_progress_persistence.sql)). Frequently-filtered columns have no explicit index:
  - `user_lesson_progress.user_id` — filtered on every `fetchCompletedLessons` call.
  - `user_lesson_progress(user_id, lesson_id)` — upsert target in `record_lesson_completion` RPC.
  - `opposites_items.lesson_id`, `dictation_items.lesson_id`, `image_match_items.lesson_id` — implied by composite unique on `(lesson_id, sort_order)` but worth verifying.
  - `emergency_phrases.category`, `*.sort_order`.
- **Notes:** Supabase auto-indexes primary keys, and `add constraint ... unique (lesson_id, sort_order)` creates a backing index that covers `lesson_id` prefix queries. But `user_lesson_progress.user_id` alone is the most-hit filter and should have an explicit index unless one already exists from a PK setup. **Verify against the live Supabase schema before declaring PASS** — migrations only show a partial picture (no `create table` is in this folder, suggesting tables were scaffolded via the Supabase UI).

### [PASS] 3.5 No obvious N+1
- **Evidence:** `fetchCompletedLessons` joins `user_lesson_progress → lessons` in a single PostgREST query with the `lessons:lesson_id ( slug )` embed ([services/api/progress.ts](../../services/api/progress.ts) line 31). `fetchAllLessons` is a single SELECT.
- **Notes:** One sequential loop in [app/_layout.tsx](../../app/_layout.tsx) lines 48–59 — `for (const slug of localOnly) await fetchLessonIdBySlug(slug)` for backfill. Bounded by local-only completions (small N at boot), and `fetchLessonIdBySlug` has an in-memory cache, but if a user has many local-only legacy completions this will sequentialize round-trips. Worth tracking.

### [PASS] 3.6 Caching policy explicit
- **Evidence:** Every `useQuery` sets `staleTime` — [hooks/useEmergencyPhrases.ts](../../hooks/useEmergencyPhrases.ts) line 12 (24h), [hooks/useLessons.ts](../../hooks/useLessons.ts) lines 37, 47 (5min), [hooks/games/opposites.ts](../../hooks/games/opposites.ts) line 18 (1h). [app/_layout.tsx](../../app/_layout.tsx) line 31 `new QueryClient()` uses defaults otherwise (gcTime, retries). Not exhaustive but not "default-everywhere."
- **Notes:** NEEDS REVIEW shading — no documented strategy doc; staleTimes are per-hook choices.

### [FAIL] 3.7 Crash reporting NOT wired
- **Evidence:** `grep "sentry|@sentry|crashlytics|datadog|bugsnag"` in package.json + source → **0 hits.** Errors today are `console.warn` only ([services/api/onboarding.ts](../../services/api/onboarding.ts) line 29, [services/audio/deviceTtsAudioService.ts](../../services/audio/deviceTtsAudioService.ts) lines 21, 44, [app/_layout.tsx](../../app/_layout.tsx) lines 52, 57, 127, 131, 214, 219). Once shipped, crashes will be invisible.

### [FAIL] 3.8 Analytics NOT wired
- **Evidence:** No analytics SDK in [package.json](../../package.json) (no PostHog, Mixpanel, Amplitude, Segment, Firebase Analytics, etc.).
- **Notes:** Mark as FAIL if product decisions need data; mark N/A if shipping without an analytics dependency by design. Confirm with owner.

### [N/A] 3.9 Server logs structured
- No app server — Supabase RPCs log into PG via `raise notice` if at all, which is outside the audit scope.

---

## 4. Usability

### [NEEDS REVIEW] 4.1 Async states — loading partial, error/empty mostly missing
- **Evidence per screen:**
  - [app/lesson/[id].tsx](../../app/lesson/[id].tsx) lines 28–34 — has `isLoading` (spinner) and `null` fallback (LessonNotFound). **No `isError` branch** — if `fetchLessonBySlug` throws, `lessonQuery.data` stays undefined, falls through to LessonNotFound. OK behavior, no "retry" affordance.
  - [app/(tabs)/learn.tsx](../../app/(tabs)/learn.tsx) line 42 — `dbLessons = lessonsQuery.data ?? []`. **No loading state, no error UI.** Falls back to `PLANNED_LESSON_SLOTS` titles, so the user sees something — but if the network is offline they don't know data didn't load. No retry.
  - [app/(games)/[game]/index.tsx](../../app/(games)/[game]/index.tsx) — uses `useLessons()` which is a derived Zustand selector (no async); fine.
  - [app/emergency.tsx](../../app/emergency.tsx) — reads from [data/emergency.json](../../data/emergency.json) at import time; no async, fine.
  - [app/heritage/[id].tsx](../../app/heritage/[id].tsx) — local lookup, fine.
  - [components/lesson/DoneCard.tsx](../../components/lesson/DoneCard.tsx) lines 143–160 — completion mutation has `isError` + retry button + `isPending` busy state. Good model.
- **Notes:** Spec rule is "every screen with data fetch has loading + error + empty explicit." Lesson runner partially complies, learn-tab does not, DoneCard fully complies. Verdict: NEEDS REVIEW — not a hard fail, but learn-tab error UX is real.

### [PASS] 4.2 Touch targets
- **Evidence:** Sampled `Pressable` styles use `moderateScale(40)` (back button at [app/emergency.tsx](../../app/emergency.tsx) lines 68–69), `minHeight: moderateScale(56)` (settings rows), CTAs are full-width. `Pressable` used everywhere (84 instances), `TouchableOpacity` **zero**. Several places use `hitSlop` (e.g., `hitSlop={12}`).
- **Notes:** Did not measure every Pressable, but the pattern is consistent.

### [FAIL] 4.3 Offline behavior
- **Evidence:** `grep "NetInfo|@react-native-community/netinfo"` → 0 hits. No connectivity detection. Errors from `supabase` requests fall through to console.warn or React-Query default retry. Emergency screen ships offline-first by design (local JSON). No user-visible "you appear to be offline" state.
- **Notes:** For a learning app where users may be on flaky transit Wi-Fi (and the app explicitly markets "Works offline" on the Emergency screen — [app/emergency.tsx](../../app/emergency.tsx) line 105), some NetInfo-driven UI would be valuable.

### [PASS] 4.4 Accessibility — partial
- **Evidence:** `grep "accessibilityLabel|accessibilityRole|accessible"` → 132 hits across app/components/src. Icon buttons consistently have `accessibilityLabel`. `maxFontSizeMultiplier` set on many Text nodes (e.g., learn screen, profile settings) to control dynamic-type breakage.
- **Notes:** Did not run a WCAG contrast check, and `Colors.tertiary = '#464646'` on `Colors.surface = '#fbfbe2'` is roughly 7.5:1 — fine for body. Pure-rendering audit of contrast would be a separate pass.

### [FAIL] 4.5 Heritage screen uses hex literals instead of tokens
- **Evidence:** [app/heritage/[id].tsx](../../app/heritage/[id].tsx) lines 38, 39, 43, 52, 71, 74, 90, 93, 94, 95, … uses `'#FBFBE2'`, `'#1B1D0E'`, `'#91001B'`, `'#5C1A1A'`, etc. directly — matching values exist in [constants/colors.ts](../../constants/colors.ts) (`Colors.surface`, `Colors.onSurface`, `Colors.primary`).
- **Notes:** Violates the project rule in [.claude/CLAUDE.md](../../.claude/CLAUDE.md) ("Never use a hex literal in a component — every color comes from `Colors`"). Mechanical fix.

### [FAIL] 4.6 DictationGame uses raw fontSize literals
- **Evidence:** [src/games/dictation/DictationGame.tsx](../../src/games/dictation/DictationGame.tsx) lines 64, 71, 124, 139 — `fontSize: 14` and `fontSize: 16` not wrapped in `moderateScale(...)`. Same rule violation, different file.

### [NEEDS REVIEW] 4.7 Primary action clarity
- **Evidence:** Sampled screens — lesson/[id] phases have a single CTA; onboarding screens have a single primary Pressable (`disabled={!canSubmit}` pattern). Tab navigation is clear. Did not exhaustively review.

---

## 5. Security & Cross-cutting

### [PASS] 5.1 Secrets
- `git ls-files | grep '^\.env'` → only `.env.example` tracked; `.env` is gitignored.
- `grep -E "sk_|AKIA|ghp_|AIza|eyJ.*\.eyJ"` across source → **0 hits.** No accidental secrets.
- Auth tokens stored via `expo-secure-store` adapter ([services/api/supabase.ts](../../services/api/supabase.ts) lines 13–21), not AsyncStorage. AsyncStorage holds only `user_prefs` (display name, prefs) and `kannada-baa-progress` (completed lessons, XP) — non-sensitive.
- [scripts/security-scan.sh](../../scripts/security-scan.sh) exists and runs as part of `npm run pre-push`.
- **Caveat:** `EXPO_PUBLIC_SUPABASE_ANON_KEY` *is* shipped in the bundle by design (anon key is meant to be public, gated by RLS). That's correct usage as long as RLS policies are tight (they are — see migrations).

### [PASS] 5.2 Migrations versioned
- **Evidence:** [services/api/migrations/](../../services/api/migrations/) holds 6 dated `.sql`/`.csv` files (2026-05-20 and 2026-05-27 batches), checked into git. RLS policies defined per table.
- **Notes:** AsyncStorage / Zustand `persist` has no explicit migration handler (`onRehydrateStorage` is used only to set `isHydrated`). If you add or remove fields in `useUserStore` or `progressStore`, old persisted blobs will hydrate with stale shapes. Spec calls this out as "versioning strategy if schema could change." Light **NEEDS REVIEW** here.

### [FAIL] 5.3 CI
- **Evidence:** No `.github/workflows/`, no `.gitlab-ci.yml`, no `.circleci/`. Pre-push script ([scripts/security-scan.sh](../../scripts/security-scan.sh) + `npm run typecheck`) is local-only and can be bypassed with `--no-verify`.
- **Notes:** No CI = no enforcement on PRs. For a solo project this might be acceptable; spec rule is FAIL.

### [PASS] 5.4 Testing baseline
- **Evidence:** 9 test files in [__tests__/](../../__tests__/) covering opposites, dictation, imagematch, and progressStore. `grep ".only\|.skip\|xit\|xdescribe"` → **0 hits.** Idempotency contract on `completeLesson` is pinned (per resolved [C6 in CONTRADICTIONS.md](../foundation/CONTRADICTIONS.md)).
- **Notes:** No smoke test for auth flow or lesson flow end-to-end — [app/(auth)/login.tsx](../../app/(auth)/login.tsx) and [app/lesson/[id].tsx](../../app/lesson/[id].tsx) are untested. PASS on the literal rule (smoke tests exist for critical *game* flows; no `.only`/`.skip`); flagging that auth + lesson runner are uncovered.

---

## 6. Output

### Summary table

| Section | PASS | FAIL | NEEDS REVIEW | N/A |
|---|---|---|---|---|
| 1. Structure | 6 | 0 | 2 | 0 |
| 2. Stack | 2 | 3 | 2 | 0 |
| 3. Scalability | 3 | 4 | 0 | 1 |
| 4. Usability | 2 | 3 | 2 | 0 |
| 5. Security | 3 | 1 | 0 | 0 |
| **Total** | **16** | **11** | **6** | **1** |

### Critical failures (fix before any release)

1. **3.7 — No crash reporting.** Shipping without Sentry/Crashlytics means production crashes are invisible. Highest impact, lowest effort: `npx expo install sentry-expo` + DSN in `.env`.
2. **2.2 / 2.1 — Expo SDK 54 is two majors behind (56 is latest) + 1 high-severity audit finding.** Plan a coordinated SDK 55→56 bump. The audit `high` resolves at the same time. Touch react-native, all `expo-*` packages, expo-router, jest-expo together.
3. **5.3 — No CI.** Without enforced typecheck + test on PRs, the pre-push script can be skipped. Add a minimal GitHub Actions workflow: `npm ci && npm run typecheck && npm test`.

### Recommended fixes (ranked impact / effort)

| # | Item | Impact | Effort | Notes |
|---|---|---|---|---|
| 1 | Add crash reporting (3.7) | High | Low | Sentry init in [app/_layout.tsx](../../app/_layout.tsx). |
| 2 | Add CI workflow (5.3) | High | Low | One YAML file; gates merges. |
| 3 | Coordinated Expo SDK bump (2.1, 2.2) | High | Medium | Resolves audit `high` + most moderates. |
| 4 | Wire `isError` + retry on learn-tab and lesson queries (4.1) | Medium | Low | Already have the pattern in [DoneCard.tsx](../../components/lesson/DoneCard.tsx). |
| 5 | Fix hex literals in [app/heritage/[id].tsx](../../app/heritage/[id].tsx) and raw `fontSize` in [DictationGame.tsx](../../src/games/dictation/DictationGame.tsx) (4.5, 4.6) | Medium | Low | Project-rule cleanup; mechanical. |
| 6 | Add NetInfo + a global "you're offline" toast (4.3) | Medium | Low-Med | App markets offline emergency phrases; users will hit offline state. |
| 7 | Migrate [LessonSelector](../../components/lesson/LessonSelector.tsx) and [learn.tsx](../../app/(tabs)/learn.tsx) from ScrollView+map to FlatList (3.1) | Medium | Medium | Required by [CLAUDE.md](../../.claude/CLAUDE.md) rule for >10-item lists; relevant once curriculum grows. |
| 8 | Verify (or add) explicit DB indexes on `user_lesson_progress.user_id`, and `*_items.lesson_id` (3.4) | Medium | Low | Check Supabase Studio; add a migration if missing. |
| 9 | Decide on OTA + configure `expo-updates` if yes (2.7) | Medium | Low | One CLI command + [app.json](../../app.json) block. |
| 10 | Replace `key={i}` in heritage paragraphs with stable key (3.2) | Low | Low | Other two `key={i}` usages are static dots — fine to leave. |
| 11 | Document Supabase data-export procedure (2.4) | Low | Low | README addendum. |
| 12 | Zustand persist migration handlers (5.2) | Low | Low | Add `version` + `migrate` to [useUserStore.ts](../../stores/useUserStore.ts) / [progressStore.ts](../../stores/progressStore.ts) before next shape change. |
| 13 | Smoke test for auth + lesson flow (5.4) | Medium | Medium | Real coverage gap, but not blocking. |
| 14 | Analytics SDK decision (3.8) | Depends | Low | Owner decision. |

### Open questions (need owner decision before fixing)

1. **OTA updates** — is `expo-updates` part of the release plan? If yes, configure now; if no, mark 2.7 as N/A.
2. **Analytics** — shipping without analytics on purpose, or oversight? (3.8)
3. **Crash reporter choice** — Sentry vs. Bugsnag vs. EAS Insights? (3.7)
4. **Supabase indexes** — should I open Supabase Studio and read the live schema to confirm 3.4, or is index audit owner-side?
5. **NetInfo scope** — global offline banner, or per-screen offline empty-states, or both? (4.3)
6. **Folder structure** — leave the current type-based layout (with feature folders inside `components/` and `src/games/`), or migrate to a top-level `features/` tree before it grows past the current 10 lessons / 3 games? (1.6)

---

## Cross-reference with active contradictions

Three [active contradictions in CONTRADICTIONS.md](../foundation/CONTRADICTIONS.md) overlap with this audit:

- **C3** — `rowdy/classic` voice system still wired in code but locked for removal. `useUserStore.mode` field, `setMode`, [useCopy.ts](../../hooks/useCopy.ts) indexing all alive. No audit finding here, but a known cleanup.
- **C7** — `fill_blank` drill type renders a "Not yet implemented — skipping" placeholder. Will surface as a usability failure (4.1 / 4.5) as soon as a lesson uses it.
- **C10** — `emergency_phrases` table in Supabase but [app/emergency.tsx](../../app/emergency.tsx) reads [data/emergency.json](../../data/emergency.json). Related to 3.4 — that table currently has no app reader, so its indexing doesn't matter yet.
