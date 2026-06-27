# Database migrations

This project uses Supabase (Postgres) but **does not use the Supabase CLI**.
There is no automated migration runner, no `supabase/` config, and no
`db push`. Schema changes are applied **by hand** by the project owner in the
Supabase dashboard SQL editor.

Read this before touching anything under `services/api/migrations/` or `db.sql`.

## How a schema change happens

1. Author the change as a new, dated SQL file in
   [`services/api/migrations/`](services/api/migrations/) using the existing
   naming convention: `YYYY-MM-DD[_suffix]_short_description.sql`
   (e.g. `2026-06-22_streak_persistence.sql`). Suffixes (`b`, `c`, …) order
   multiple migrations authored on the same day.
2. The **owner runs the SQL manually** in the Supabase dashboard. The app's
   anon key cannot run DDL, so nothing in the client applies these.
3. Commit the SQL file so the repo keeps a record of intended changes.

These files are an **append-only ledger of intent**, not a replayable chain.
There is no "drop the DB and re-run all migrations to get a fresh schema" path.

## `db.sql`

[`db.sql`](db.sql) is a **read-only snapshot** of the live schema, exported for
context (e.g. for tooling and code review). Its own header says it is *not*
meant to be executed — table order and constraints are not guaranteed valid for
a fresh run. Treat it as documentation, not a setup script.

## ⚠️ Known drift: the repo and the live DB are not in sync

Because migrations are applied by hand and some fixes were applied **directly**
in the dashboard without a corresponding committed file, the live database has
diverged from what the migration files in this repo would produce. Known cases:

- **`recompute_overall_progress`** was patched live (to a reduced-game formula)
  after the `image_match` tables were dropped — see
  `2026-06-10_c13_drop_image_match_from_overall.sql`. Image Match has since been
  fully removed from the app.
- **Overall progress / mastery is now computed client-side** from lesson
  content; the server-side recompute trigger is left in place but effectively
  unused. Do not assume the DB column is the source of truth for overall %.
- **Seed data drift**: some content seeds in this repo (diacritic
  normalizations, greeting standardizations) were applied to live rows out of
  band, so the committed seed `.sql`/`.csv` files do not exactly match live rows.

### If you need ground truth

Query the live database directly (or check `db.sql` for current schema shape).
Do **not** assume the newest migration file reflects the live state.

## Wishlist (not done — see `chore/codebase-hardening` notes)

Adopting the Supabase CLI (`supabase init` + linked project + `db diff`/`db push`)
would make migrations reproducible and end the drift. That requires owner DB
access and a one-time reconciliation of live state vs. the migration ledger, so
it is intentionally **out of scope** for the current hardening pass.
