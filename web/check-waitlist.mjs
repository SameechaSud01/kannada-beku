#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════
// WAITLIST SMOKE TEST
// Validates that every field the signup form sends has a matching column in
// the live Supabase `waitlist` table. Catches schema drift (a form field with
// no column) BEFORE real users hit a 400 — exactly the bug that silently ate
// a week of signups when `community_optin` was added to the form but not the DB.
//
//     node web/check-waitlist.mjs
//
// Exit 0 = payload and table agree. Exit 1 = mismatch (prints the bad column).
//
// HOW IT AVOIDS WRITING A TEST ROW: the table is insert-only for the anon key
// (it can INSERT but not SELECT). We send `Prefer: return=representation`,
// which forces Postgres to read the row back after inserting — the RLS read
// check fails and the whole transaction is rolled back. So:
//   • missing column      → 400 PGRST204  (parsed & rejected before any insert)
//   • all columns valid   → 401/403 RLS   (insert rolled back, nothing persists)
// Either way the table is left untouched.
//
// Keep SAMPLE_PAYLOAD's keys in sync with the body of `full` in saveSignup()
// in site-questionnaire.jsx — same column names, one representative value each.
// Add a key here the moment you add one to the form; that's what makes this
// test catch the next missing column.
// ════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://fhhzrzmmulqgmfwmeodq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i4ovF7U6Z0wHD09wMDBtpA_CETQFN2l';
const SUPABASE_TABLE = 'waitlist';

const SAMPLE_PAYLOAD = {
  email: `smoketest_${Date.now()}@kannadabeku.test`,
  name: 'Smoke Test',
  city: 'Bengaluru',
  motivation: ['Respect the culture'],
  motivation_note: 'smoke test',
  struggles: ['Pronunciation'],
  struggles_note: 'smoke test',
  wants: ['Hold a conversation'],
  wants_note: 'smoke test',
  pricing_model: 'One-time purchase',
  price: '₹999',
  community_optin: true,
};

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

function pass(msg) { console.log(`\n✅ PASS — ${msg}\n`); process.exit(0); }
function fail(msg) { console.error(`\n❌ FAIL — ${msg}\n`); process.exit(1); }

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: 'POST',
    // return=representation → read-back is RLS-rejected → row rolled back.
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(SAMPLE_PAYLOAD),
  });
  const body = await res.text();
  const n = Object.keys(SAMPLE_PAYLOAD).length;

  // Missing column — the bug this test exists to catch.
  if (res.status === 400 && (body.includes('PGRST204') || body.includes('Could not find'))) {
    const col = body.match(/'([^']+)' column/)?.[1];
    fail(`column "${col ?? '?'}" is in the form but not in the waitlist table.\n   ${body}\n   → add it in the Supabase SQL Editor, then re-run.`);
  }

  // All columns valid; the insert was rolled back by the RLS read check.
  if (res.status === 401 || res.status === 403) {
    pass(`all ${n} form columns exist in the waitlist table (no test row written).`);
  }

  // RLS now allows read-back, so a real row persisted. Schema is still fine,
  // but warn so it can be cleaned up — and so we notice the RLS change.
  if (res.ok) {
    const id = (() => { try { return JSON.parse(body)?.[0]?.id; } catch { return null; } })();
    console.warn(`\n⚠️  All ${n} columns exist, but a test row WAS written (RLS now permits read-back).`);
    console.warn(`   Delete it:  delete from waitlist where email like 'smoketest_%@kannadabeku.test';`);
    if (id) console.warn(`   (row id = ${id})`);
    pass('schema OK — see cleanup note above.');
  }

  // Anything else (constraint, network, etc.) — surface it verbatim.
  fail(`unexpected response ${res.status}:\n   ${body}`);
}

run().catch((err) => fail(`smoke test errored: ${err.message}`));
