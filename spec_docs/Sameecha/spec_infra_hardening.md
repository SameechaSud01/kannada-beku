# Spec — Infrastructure hardening: caching, async, DB performance, scaling & security

**Created 2026-06-16.** Standalone spec from the infra audit (caching, async, fast DB
queries, load testing, horizontal scaling, RLS, Supabase policies, service keys). This
is **not** a feature change — no user-visible behaviour changes except faster cold
starts and offline-tolerant reads. Phased so each phase is owner-testable in isolation.

## Context — current state (from audit, 2026-06-16)

The app is **read-heavy against a single Supabase project**. Most "scale" concerns are
already handled by Supabase's managed Postgres/PostgREST tier or by patterns already in
place. The audit found the stack is in good shape; this spec captures the **handful of
real, implementable wins** plus the **advisory guardrails** that need to be written down
so they aren't violated later.

What already exists (do **not** rebuild):

- **React Query v5** (`@tanstack/react-query ^5.95.2`) is the server-cache layer.
  `queryClient` is created in `app/_layout.tsx:44` (`new QueryClient()` — no
  `defaultOptions`). Per-hook `staleTime` is set ad hoc:
  lessons 5 min (`hooks/useLessons.ts:47,57`), games 1 h (`hooks/games/*.ts`),
  emergency 24 h (`hooks/useEmergencyPhrases.ts:12`), fun facts 24 h
  (`hooks/useKarnatakaFunFacts.ts:8`), overall progress 60 s
  (`hooks/useOverallProgress.ts:19`).
- **Module-level `Map` caches** for id lookups (`services/api/lessons.ts`, game loaders).
- **Zustand + AsyncStorage** for progress (`kannada-beku-progress`) and prefs
  (`user_prefs`).
- **RLS on all 18 tables**, anon-key-only client (`services/api/supabase.ts`), session
  in iOS Keychain via `ChunkedSecureStoreAdapter`. **No service key in client code.**

> **Known live-DB drift (important).** Migrations here are **manual** (no Supabase CLI;
> owner runs SQL in the dashboard). The live DB has **diverged** from
> `services/api/migrations/`: `image_match` tables were dropped and
> `recompute_overall_progress` was patched live to a 2-game formula. The repo migrations
> still describe the 3-game image-match world. Phase 5 documents this; do not assume the
> repo SQL reflects production.

## Goals

1. **Faster cold starts + offline-tolerant reads** — persist the React Query cache so
   the app shows last-fetched content instantly on launch and survives no-network.
2. **Centralise cache policy** — one `QueryClient` default config instead of scattered
   per-hook `staleTime` magic numbers.
3. **Remove the one async wart** — the boot-time N+1 backfill loop.
4. **Verify DB performance + security invariants** — FK indexes, the `karnataka_fun_facts`
   policy, and that the live aggregate stays cheap.
5. **Write down the advisory guardrails** — service-key rule, load-testing playbook,
   scaling levers, and the repo↔live drift — so future work doesn't regress them.

## Non-goals

- **No content bundling.** Static tables (emergency, fun facts, game items) stay
  DB-sourced; we only persist the React Query cache (owner decision, 2026-06-16). DB
  remains the source of truth; offline shows last-fetched data, not a shipped snapshot.
- **No server, Edge Function, or Redis.** Out of scope.
- **No horizontal-scaling machinery** (read replicas, sharding, multi-region). Advisory
  only — documented, not built (Phase 6).
- **No change to the locked overall-progress formula** or to RLS policies' logic.

---

## Phase 1 — Persist the React Query cache (offline-tolerant warm starts)

**Problem.** `new QueryClient()` (`app/_layout.tsx:44`) holds the cache in memory only.
Every cold start re-fetches lessons / emergency / fun facts / game items even though they
change rarely, and a launch with no network shows empty states. A language app opened on
patchy mobile data in Karnataka should show its last-known content immediately.

**Fix.** Add the official persistence plugin backed by AsyncStorage (already a dep,
`2.2.0`). Wrap the provider with `PersistQueryClientProvider`.

Add deps:

```
@tanstack/react-query-persist-client
@tanstack/query-async-storage-persister
```

```ts
// app/_layout.tsx — replace the bare client + QueryClientProvider
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,   // keep cache 24 h so persistence has something to save
      retry: 2,
    },
  },
});

const asyncPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'kannada-rq-cache',
  throttleTime: 1000,
});
```

```tsx
// app/_layout.tsx — swap <QueryClientProvider> for:
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister: asyncPersister,
    maxAge: 24 * 60 * 60 * 1000,
    // Bump this string whenever a query's shape changes, to bust stale persisted data.
    buster: 'v1',
    dehydrateOptions: {
      // Persist content reads only — never persist per-user progress/auth-scoped data,
      // which must always be re-fetched fresh under the current session.
      shouldDehydrateQuery: (q) => {
        const key = String(q.queryKey?.[0] ?? '');
        const PERSIST = ['lessons', 'emergency-phrases', 'karnataka-fun-facts',
          'opposites-items', 'dictation-items', 'quick-quiz-items',
          'conversation-scenarios', 'conversation-items'];
        return PERSIST.includes(key) && q.state.status === 'success';
      },
    },
  }}
>
  {/* …existing children… */}
</PersistQueryClientProvider>
```

> **Security note.** The `shouldDehydrateQuery` allowlist is deliberate: only seeded,
> non-personal content is written to disk. `overall-progress`, `lesson-completions`, and
> anything keyed by `userId` are **never** persisted, so a shared device can't leak one
> user's progress to the next. This must stay an allowlist, never a denylist.

**Acceptance**
- Cold start with airplane mode on **after** one online launch shows lessons, emergency
  phrases, and fun facts (last-fetched), not empty states.
- Per-user progress (overall %, completions) is **not** read from the persisted cache —
  it re-fetches when online and is absent offline (shows its normal loading/empty state).
- Switching accounts does not surface the previous user's progress from disk.

**Manual test (owner) — handoff after Phase 1**
- [ ] Launch online once, force-quit, enable airplane mode, relaunch → lessons,
      emergency, fun facts visible immediately; no error banners.
- [ ] Sign out, sign in as a different account offline → no stale per-user numbers from
      the first account.

---

## Phase 2 — Centralise & tune cache policy

**Problem.** `staleTime` is scattered across 8+ hooks with inconsistent values and no
shared default. Static content (lessons, emergency, fun facts, game items) is re-fetched
more often than it ever changes.

**Fix.** Set sensible defaults on the `QueryClient` and lean on them; keep only the
*intentional* per-hook overrides.

```ts
// app/_layout.tsx — extend defaultOptions.queries from Phase 1
queries: {
  gcTime: 24 * 60 * 60 * 1000,
  staleTime: 60 * 60 * 1000,        // 1 h default — fine for all seeded content
  retry: 2,
  refetchOnWindowFocus: false,       // RN has no window; avoid surprise refetches
},
```

Then, per hook:
- **Static content** (`useLessons`, `useEmergencyPhrases`, `useKarnatakaFunFacts`, all
  `hooks/games/*` item loaders): remove the local `staleTime` and inherit the 1 h default
  — or set `staleTime: Infinity` since these only change on a manual reseed. The persisted
  cache (Phase 1) makes the refetch cost irrelevant anyway.
- **Per-user progress** (`useOverallProgress`, completions): keep a **short** `staleTime`
  (≤ 60 s) so it stays fresh after a mutation. These are the *only* queries that should
  override the default downward.

> Note: `useOverallProgress` is increasingly vestigial — `spec_fix_home_profile_sync.md`
> moved the displayed overall % to a client-side computation. If that ships, this hook is
> analytics-only; its `staleTime` stops mattering for UI. Don't delete it here, just stop
> treating it as hot.

**Acceptance**
- A single source (`defaultOptions`) defines cache policy; per-hook `staleTime` exists
  only where it intentionally differs (per-user progress).
- No behavioural regression: content still loads; progress still updates after a lesson/
  game.

**Manual test (owner) — handoff after Phase 2**
- [ ] Open Learn, Emergency, Home fun-fact card → all load as before.
- [ ] Complete a lesson part / game → progress numbers still update promptly.

---

## Phase 3 — Fix the boot-time N+1 backfill

**Problem.** `hydrateCompletions()` (`app/_layout.tsx:52-77`) loops over local-only
completions and, **serially per slug**, awaits `fetchLessonIdBySlug(slug)` then
`recordLessonCompletion(...)`. With N local-only lessons that's up to 2N sequential
round-trips on boot. Rare (backfill only) but trivially fixable.

**Fix.** Parallelise the per-slug backfill with `Promise.all`. The slug→id map is already
pre-seeded for lessons 1–8 in `services/api/lessons.ts`, so most lookups are in-memory
hits; parallelising the remainder removes the serial network stall.

```ts
// app/_layout.tsx — hydrateCompletions(), replace the for-loop
await Promise.all(
  localOnly.map(async (slug) => {
    try {
      const lessonId = await fetchLessonIdBySlug(slug);
      if (!lessonId) {
        console.warn('[progress] backfill skipped, no lesson for slug', slug);
        return;
      }
      await recordLessonCompletion(lessonId, null);
    } catch (err) {
      console.warn('[progress] backfill failed for slug', slug, err);
    }
  }),
);
```

Per-slug `try/catch` is preserved so one failure doesn't abort the rest. Ordering doesn't
matter — `hydrateFromServerCompletions` merges the union afterward.

**Acceptance**
- Backfill of local-only completions runs concurrently; a fresh install with several
  local-only lessons syncs them without a visible serial stall.
- No completion is lost or double-recorded (`recordLessonCompletion` is personal-best
  idempotent; `record_lesson_completion` RPC never lowers a score).

**Manual test (owner) — handoff after Phase 3**
- [ ] On an account with progress made offline, go online and relaunch → all completions
      appear server-side; no errors; overall % consistent.

---

## Phase 4 — DB performance & security verification (owner-run SQL)

These are **checks**, mostly no-ops if the audit's assumptions hold. Owner runs them in
the Supabase SQL editor (migrations are manual here).

**4a — Confirm the FK / lookup indexes the aggregate relies on.**
`recompute_overall_progress(user_id)` fires on **every** progress write (trigger) and
filters progress tables by `user_id`, joining items by `lesson_id`. The progress PKs lead
with `user_id` (covers the filter); the `*_items` unique `(lesson_id, sort_order)` indexes
cover `lesson_id` lookups. Verify there are no sequential scans:

```sql
EXPLAIN ANALYZE SELECT count(distinct lesson_id)
FROM opposites_progress p JOIN opposites_items i ON i.id = p.item_id
WHERE p.user_id = '<a-real-user-uuid>' AND p.is_correct;
```

If a seq scan appears on a progress table as rows grow, add `CREATE INDEX … ON
<table>(user_id);`. Expected today: index/PK scans, microsecond timing. **No index needed
unless EXPLAIN says otherwise.**

**4b — Confirm `karnataka_fun_facts` RLS policy is live.** The two audit passes disagreed
on whether its `select` policy exists.

```sql
SELECT tablename, policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'karnataka_fun_facts';
```

Expect one `SELECT` policy for authenticated. If absent, add:
```sql
ALTER TABLE karnataka_fun_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY karnataka_fun_facts_select_authenticated
  ON karnataka_fun_facts FOR SELECT TO authenticated USING (true);
```

**4c — Spot-check RLS coverage across all 18 tables** (one query, confirms nothing
regressed):
```sql
SELECT relname, relrowsecurity FROM pg_class
WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace ORDER BY relname;
```
Every app table should show `relrowsecurity = true`.

**Acceptance**
- EXPLAIN shows index/PK scans for the aggregate's hot path (no seq scans on progress).
- `karnataka_fun_facts` has a confirmed authenticated-select policy.
- All 18 tables report RLS enabled.

**Manual test (owner) — handoff after Phase 4**
- [ ] Run 4a/4b/4c; paste results. Add indexes only if 4a shows a seq scan.

---

## Phase 5 — Document the repo ↔ live-DB drift

**Problem.** `services/api/migrations/` still describes the 3-game (image_match) formula
and image_match tables, but **production dropped image_match and runs a 2-game formula**
(patched live 2026-06-13). Anyone reading the migrations to understand production is
misled — a real correctness hazard for future DB work.

**Fix (docs only, no SQL).** Add `services/api/migrations/README.md` recording:
- Migrations are **applied manually** by the owner in the Supabase dashboard (no CLI);
  files here are the authoring history, **not** an auto-applied source of truth.
- **Live divergences from the files**, dated:
  - `image_match_items` / `image_match_progress` **dropped** in production.
  - `recompute_overall_progress` **patched live to a 2-game formula** (lessons +
    opposites + dictation), superseding the image-match-era 3-game formula in
    `2026-05-27_db_wiring_games_and_overall.sql` and `2026-06-10_c13_…sql`.
- A pointer to capture the **current live schema** as a snapshot
  (`database.sql` is reference-only; consider a dated `live_schema_2026-06-16.sql` dumped
  from the dashboard) so the next person diffs against reality.

Cross-link from `docs/foundation/STATE.md` / `CONTRADICTIONS.md` if those track DB state.

**Acceptance**
- `migrations/README.md` exists and states the manual-apply process + the two live
  divergences with dates.

**Manual test (owner) — handoff after Phase 5**
- [ ] Read the README; confirm it matches what's actually in production.

---

## Phase 6 — Advisory guardrails (write-down, no code)

These are the audit topics that are **not** code changes for this app's scale but must be
recorded so future work doesn't regress them. Add as a short
`docs/foundation/INFRA.md` (or append to STATE.md).

**Service keys — the one hard rule.**
- ✅ Today: client uses only `EXPO_PUBLIC_SUPABASE_ANON_KEY` (a publishable key). **No
  `service_role` key anywhere in the bundle.** Keep it that way.
- **Never** put the `service_role` key in any `EXPO_PUBLIC_*` var, `.env` shipped to the
  client, or app code — it bypasses all RLS.
- The "owner reads `user_feedback` via service role" path is **server/dashboard-only**,
  never the app. Any future privileged op (analytics, bulk reads, content admin) goes
  behind a Supabase **Edge Function** or a small server holding the service key, called
  from the app with the user's JWT.

**Load testing — the playbook (run only before a launch/acquisition spike).**
- Tool: **k6** or **Artillery** against the PostgREST REST/RPC URLs, using a pool of test
  test-user JWTs.
- Simulate the real hot path: load lessons → record a few `record_*_attempt` RPCs → read
  overall progress.
- Watch Supabase **Reports** + `pg_stat_statements` for slow queries, and **Database →
  Connections** for pool saturation (the thing that saturates first is connections, not
  query time).
- Not worth building now — documented so it's ready when needed.

**Horizontal scaling — what the levers actually are.**
- You don't scale this yourself: Postgres scales **vertically** (bigger instance);
  PostgREST/GoTrue/Storage scale horizontally on Supabase's side.
- Mobile clients already go through **Supavisor** (pooled PostgREST) — fine for many
  concurrent clients. Only if a future **direct-Postgres** serverless path is added does
  pooler mode (transaction mode) need explicit attention.
- **Read replicas** (paid) only if genuinely read-bound — Phase 1 caching defers this
  indefinitely. **No sharding / multi-region** — not this app's problem.

**Acceptance**
- `INFRA.md` exists with the service-key rule, the load-test playbook, and the scaling
  levers.

---

## Phase ordering & dependencies

| Phase | What | Type | Depends on |
|---|---|---|---|
| 1 | Persist RQ cache | code (app) | — |
| 2 | Centralise cache policy | code (app) | 1 (shares `defaultOptions`) |
| 3 | Fix boot N+1 | code (app) | — |
| 4 | DB perf/security verify | owner SQL | — |
| 5 | Document repo↔live drift | docs | — |
| 6 | Advisory guardrails | docs | — |

Phases 1–3 are the user-facing wins and should land first (1→2 sequential; 3 independent).
Phases 4–6 are verification/documentation and can run in parallel or after. **Hand off for
owner manual test after each code phase** before continuing.

## Out of scope (explicit)

- Content bundling / offline content snapshot (owner chose persist-only).
- Edge Functions, custom server, Redis, materialized views.
- Read replicas, sharding, multi-region, custom load balancing.
- Changing the locked overall-progress formula or any RLS policy logic.
- Re-aligning repo migrations to the live 2-game DB (documented in Phase 5, not executed).

## Global acceptance criteria

1. Cold start shows last-fetched static content instantly and offline; per-user progress
   is never served from disk across sessions/accounts.
2. Cache policy lives in one `QueryClient` config; per-hook overrides are intentional only.
3. Boot backfill is concurrent; no completion lost or double-counted.
4. EXPLAIN confirms the aggregate's hot path uses indexes; all 18 tables RLS-enabled;
   `karnataka_fun_facts` policy confirmed.
5. `migrations/README.md` records manual-apply + the two live divergences.
6. `INFRA.md` records the service-key rule, load-test playbook, and scaling levers.
