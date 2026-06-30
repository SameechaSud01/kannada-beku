// @ts-nocheck
/**
 * Pre-generate bundled Kannada TTS audio.
 *
 * Collects every unique Kannada string the app speaks (from the TS content
 * files AND the Supabase DB), synthesizes one MP3 per string with Azure Neural
 * TTS (kn-IN-SapnaNeural), writes them to assets/audio/kn/<sha1>.mp3, and emits
 * constants/audioManifest.ts mapping each normalized string -> require(asset).
 *
 * Run:  npm run gen:audio        (loads .env via node --env-file)
 *
 * Required env (generation time only — NEVER shipped, never EXPO_PUBLIC_):
 *   AZURE_SPEECH_KEY, AZURE_SPEECH_REGION
 * Reused env (already in .env):
 *   EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
 *
 * Idempotent: a string whose hashed MP3 already exists is not re-synthesized.
 * Re-run whenever TS or DB content changes, then commit the new MP3s + manifest.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AUDIO_DIR = join(ROOT, 'assets', 'audio', 'kn');
// Hand-recorded clips live here (committed, not Azure-generated). See
// MANUAL_OVERRIDES below — a key with a file here is served from it, never synthesized.
const MANUAL_DIR = join(AUDIO_DIR, 'manual');
const MANIFEST_PATH = join(ROOT, 'constants', 'audioManifest.ts');

const VOICE = 'kn-IN-SapnaNeural';
const LANG = 'kn-IN';
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
// Free (F0) tier is rate-limited (~20 req/min); Standard (S0) allows far more.
// Concurrency 1 + retry/backoff completes reliably on F0. Override for S0 with
// e.g. AZURE_TTS_CONCURRENCY=5 for a much faster run.
const CONCURRENCY = Number(process.env.AZURE_TTS_CONCURRENCY) || 1;
const MAX_RETRIES = 6; // per string, on 429 / transient 5xx
const RETRY_BASE_MS = 3000; // backoff base; doubles each attempt

// Matches the Kannada Unicode block.
const KANNADA = /[ಀ-೿]/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Normalization — MUST stay in lockstep with services/audio/bundledAudio.ts so
// generated keys match what the runtime looks up.
// ---------------------------------------------------------------------------
function normalizeForAudio(text) {
  return text
    .replace(/\[name\]/g, '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashFor(normalized) {
  return createHash('sha1').update(normalized, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// Pronunciation overrides — the Azure neural voice mispronounces a few isolated
// glyphs. The manifest KEY (and therefore the runtime lookup + hash) stays the
// real glyph; only the text SENT to Azure is swapped so the clip sounds right.
//   ಋ : the bare vocalic-R glyph reads wrong; "ರು" synthesizes the intended
//       "ru" sound (as in rupees).
//   ಔ : the bare diphthong glyph reads wrong; "ಅಉ" (a+u run together)
//       synthesizes the intended "au" sound (as in owl).
// ---------------------------------------------------------------------------
const SYNTH_OVERRIDES = {
  ಋ: 'ರು',
  ಔ: 'ಅಉ',
  ಐ: 'ಅಇ',
};

// ---------------------------------------------------------------------------
// IPA phoneme overrides — monophthong vowels. The bare glyph IS the only
// Kannada spelling of these sounds, so (unlike the composite vowels above)
// there's no respelling to swap in. Instead we pin the exact vowel with an IPA
// phoneme so the neural voice can't drift to the wrong quality/length.
// ---------------------------------------------------------------------------
const IPA_PHONEMES = {
  ಅ: 'ɐ',
  ಆ: 'aː',
  ಇ: 'i',
  ಈ: 'iː',
  ಉ: 'u',
  ಊ: 'uː',
  ಎ: 'e',
  ಏ: 'eː',
  ಒ: 'o',
  ಓ: 'oː',
};

// What gets hashed for the content-addressed filename. Overrides hash the
// swapped text (unchanged from today, so existing override clips stay cached);
// IPA vowels fold the phoneme into the hash so changing it busts the stale clip;
// everything else hashes the bare key (so existing word clips are untouched).
function hashInputFor(key) {
  if (SYNTH_OVERRIDES[key]) return SYNTH_OVERRIDES[key];
  if (IPA_PHONEMES[key]) return `${key} ipa:${IPA_PHONEMES[key]}`;
  return key;
}

// ---------------------------------------------------------------------------
// Manual recordings — Azure's neural voices mispronounce the isolated vowel
// letters (both kn-IN voices, IPA hints ignored), so the vowel sounds are
// hand-recorded instead. A key listed here whose file exists under MANUAL_DIR
// is served from that file and SKIPPED for Azure synthesis; if the file is not
// there yet, the key falls through to normal synthesis (nothing breaks).
// Map: manifest key (real glyph) -> filename stem under assets/audio/kn/manual/.
// ---------------------------------------------------------------------------
const MANUAL_OVERRIDES = {
  // Vowels (all 13).
  ಅ: 'a',
  ಆ: 'aa',
  ಇ: 'i',
  ಈ: 'ii',
  ಉ: 'u',
  ಊ: 'uu',
  ಋ: 'vr',
  ಎ: 'e',
  ಏ: 'ee',
  ಐ: 'ai',
  ಒ: 'o',
  ಓ: 'oo',
  ಔ: 'au',
  // Retroflex vs dental consonants (Lesson 0 step 4 — "Curl your tongue back").
  // Lone consonant letters Azure mispronounces just like the vowels, so they're
  // hand-recorded too. Stems are case-safe lowercase: the macOS filesystem is
  // case-insensitive, so a `Ta.mp3` / `ta.mp3` pair would collide. Doubled =
  // retroflex (the capital romanisation), single = dental.
  ಟ: 'tta', // retroflex "Ta"
  ತ: 'ta', // dental "ta"
  ಡ: 'dda', // retroflex "Da"
  ದ: 'da', // dental "da"
  // Geminated words (Lesson 0 step 5) — Azure doesn't hold the doubled consonant,
  // so these are hand-recorded too. Falls through to Azure until the file exists.
  ಅಪ್ಪ: 'appa', // father
  ಅಮ್ಮ: 'amma', // mother
};

// Absolute path to a key's manual recording if one exists on disk, else null.
function manualFileFor(key) {
  const stem = MANUAL_OVERRIDES[key];
  if (!stem) return null;
  const file = join(MANUAL_DIR, stem + '.mp3');
  return existsSync(file) ? file : null;
}

// ---------------------------------------------------------------------------
// 1. Collect strings
// ---------------------------------------------------------------------------

/**
 * Extract every quoted string literal (', ", `) that contains a Kannada char.
 *
 * A whole-file quote regex desyncs on stray apostrophes in comments and English
 * strings (e.g. "roof of the mouth", "they're"), so we scan character-by-
 * character: skip // and /* *\/ comments, then read each string with correct
 * quote/escape handling. Our content files are pure data (no regex literals),
 * so a simple scanner is robust here.
 */
function extractKannadaLiterals(src) {
  const out = [];
  const n = src.length;
  let i = 0;
  while (i < n) {
    const c = src[i];
    // Comments.
    if (c === '/' && src[i + 1] === '/') {
      i += 2;
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // String literals.
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      i++;
      let buf = '';
      while (i < n && src[i] !== quote) {
        if (src[i] === '\\') {
          buf += src[i + 1] ?? '';
          i += 2;
          continue;
        }
        buf += src[i];
        i++;
      }
      i++; // closing quote
      if (KANNADA.test(buf) && !buf.includes('${')) out.push(buf);
      continue;
    }
    i++;
  }
  return out;
}

function collectFromTsFiles() {
  const strings = new Set();
  // The Lesson 0 guide content (every Kannada glyph/word/sentence the 7-step flow
  // plays) lives in constants/guide.ts as the offline fallback; the step
  // components themselves embed no played Kannada (it all arrives via props), so
  // scanning the content files covers everything spoken. lessonContent.ts carries
  // the lesson 1–8 strings.
  for (const rel of ['constants/lessons/lessonContent.ts', 'constants/guide.ts']) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) {
      console.warn(`  ! TS source not found, skipping: ${rel}`);
      continue;
    }
    const text = readFileSync(p, 'utf8');
    for (const s of extractKannadaLiterals(text)) strings.add(s);
  }
  return strings;
}

async function collectFromDb(strings) {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  // Content tables are gated by row-level security that only allows reads for
  // logged-in users, so the anon key returns 0 rows here. Prefer the
  // service_role key (secret, generation-time only) which bypasses RLS.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('  ! Supabase env missing — skipping DB content (TS-only run).');
    return;
  }
  if (!serviceKey) {
    console.warn('  ! SUPABASE_SERVICE_ROLE_KEY not set — using anon key, which RLS may');
    console.warn('    block (DB content like emergency/opposites/conversation will be skipped).');
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  const add = (v) => {
    if (typeof v === 'string' && KANNADA.test(v)) strings.add(v);
  };
  const addOptions = (json) => {
    if (Array.isArray(json)) for (const o of json) add(o?.kn);
  };
  // Deep-walk an arbitrary object/array and add every Kannada string value. Used
  // for the Lesson 0 reference.guide payload, whose shape (vowels, shortLong,
  // retroflexRows, doubles, rhythm…) carries `kannada` fields at several depths.
  const addDeep = (node) => {
    if (!node) return;
    if (typeof node === 'string') return add(node);
    if (Array.isArray(node)) return node.forEach(addDeep);
    if (typeof node === 'object') return Object.values(node).forEach(addDeep);
  };

  // L0 basics + any lesson content_json still DB-sourced.
  {
    const { data, error } = await db.from('lessons').select('content_json');
    if (error) throw error;
    for (const row of data ?? []) {
      const ref = row?.content_json?.reference;
      for (const w of ref?.words ?? []) add(w?.kannada);
      for (const ph of ref?.phrases ?? []) add(ph?.kannada);
      // Lesson 0 guide content (spec_lesson0_redesign.md). Only the redesigned
      // shape (gated on `welcomePoints`) is walked — a pre-migration DB row still
      // carries the old chart/sections payload, whose ~34 lone consonants the new
      // flow never plays and which Azure mispronounces anyway. The TS fallback
      // (constants/guide.ts) already covers every new string until the migration runs.
      if (ref?.guide?.welcomePoints) addDeep(ref.guide);
    }
  }
  // Emergency phrases.
  {
    const { data, error } = await db.from('emergency_phrases').select('kannada');
    if (error) throw error;
    for (const r of data ?? []) add(r?.kannada);
  }
  // Dictation.
  {
    const { data, error } = await db.from('dictation_items').select('expected_answer');
    if (error) throw error;
    for (const r of data ?? []) add(r?.expected_answer);
  }
  // Opposites (word + opposite + option chips).
  {
    const { data, error } = await db.from('opposites_items').select('word, opposite, options_json');
    if (error) throw error;
    for (const r of data ?? []) {
      add(r?.word);
      add(r?.opposite);
      addOptions(r?.options_json);
    }
  }
  // Quick quiz.
  {
    const { data, error } = await db.from('quick_quiz_items').select('kannada');
    if (error) throw error;
    for (const r of data ?? []) add(r?.kannada);
  }
  // Conversation lines + option chips.
  {
    const { data, error } = await db
      .from('conversation_items')
      .select('speaker_line_kn, options_json');
    if (error) throw error;
    for (const r of data ?? []) {
      add(r?.speaker_line_kn);
      addOptions(r?.options_json);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Synthesize via Azure
// ---------------------------------------------------------------------------
function xmlEscape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function synthesize(key, azureKey, azureRegion) {
  const ipa = IPA_PHONEMES[key];
  const inner = ipa
    ? `<phoneme alphabet='ipa' ph='${xmlEscape(ipa)}'>${xmlEscape(key)}</phoneme>`
    : xmlEscape(SYNTH_OVERRIDES[key] ?? key);
  const ssml =
    `<speak version='1.0' xml:lang='${LANG}'>` +
    `<voice xml:lang='${LANG}' name='${VOICE}'>${inner}</voice>` +
    `</speak>`;
  const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'kannada-beku-audio-gen',
      },
      body: ssml,
    });

    if (res.ok) return Buffer.from(await res.arrayBuffer());

    // Throttled (429) or transient server error — wait and retry.
    const retryable = res.status === 429 || (res.status >= 500 && res.status < 600);
    if (retryable && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('retry-after')); // seconds, if sent
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : RETRY_BASE_MS * 2 ** attempt;
      await sleep(waitMs);
      continue;
    }

    const body = await res.text().catch(() => '');
    throw new Error(`Azure ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Emit manifest
// ---------------------------------------------------------------------------
function writeManifest(entries) {
  // entries: Array<{ key, requirePath }>, key = normalized string, requirePath =
  // module path (relative to constants/) of the bundled clip — either a synthesized
  // ../assets/audio/kn/<hash>.mp3 or a hand-recorded ../assets/audio/kn/manual/<stem>.mp3.
  const sorted = [...entries].sort((a, b) => a.key.localeCompare(b.key));
  const lines = sorted.map(
    ({ key, requirePath }) => `  ${JSON.stringify(key)}: require('${requirePath}'),`,
  );
  const body = `// AUTO-GENERATED by scripts/generateAudio.mjs — do not edit by hand.
// Maps a normalized Kannada string to its bundled MP3 asset (Metro require id).
// Regenerate with: npm run gen:audio
/* eslint-disable */

export const AUDIO_MANIFEST: Record<string, number> = {
${lines.join('\n')}
};
`;
  writeFileSync(MANIFEST_PATH, body, 'utf8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;
  if (!azureKey || !azureRegion) {
    console.error(
      'Missing AZURE_SPEECH_KEY / AZURE_SPEECH_REGION. Add them to .env (see .env.example).',
    );
    process.exit(1);
  }

  mkdirSync(AUDIO_DIR, { recursive: true });
  mkdirSync(MANUAL_DIR, { recursive: true });

  console.log('Collecting Kannada strings…');
  const raw = collectFromTsFiles();
  const tsCount = raw.size;
  await collectFromDb(raw);
  console.log(`  TS sources: ${tsCount} | +DB total raw: ${raw.size}`);

  // Normalize + dedupe. Hash the SYNTHESIZED text (post-override), not the key,
  // so the filename is content-addressed: changing an override yields a new
  // filename and busts Metro/device asset caches (a stable name keeps serving
  // the stale clip even after the bytes change).
  const byKey = new Map(); // normalized key -> hash(synth text)
  const manualByKey = new Map(); // normalized key -> require path of hand-recorded clip
  for (const s of raw) {
    const key = normalizeForAudio(s);
    if (!(key && KANNADA.test(key))) continue;
    // A hand-recorded clip wins: serve it and skip Azure for this key.
    if (manualFileFor(key)) {
      manualByKey.set(key, `../assets/audio/kn/manual/${MANUAL_OVERRIDES[key]}.mp3`);
      continue;
    }
    byKey.set(key, hashFor(hashInputFor(key)));
  }
  console.log(
    `  Unique normalized strings: ${byKey.size + manualByKey.size}` +
      ` (synth ${byKey.size}, manual ${manualByKey.size})`,
  );

  const work = [...byKey.entries()].map(([key, hash]) => ({ key, hash }));
  const failures = [];
  let made = 0;
  let cached = 0;

  // Bounded-concurrency pool.
  let idx = 0;
  async function worker() {
    while (idx < work.length) {
      const i = idx++;
      const { key, hash } = work[i];
      const file = join(AUDIO_DIR, `${hash}.mp3`);
      if (existsSync(file)) {
        cached++;
        continue;
      }
      try {
        const mp3 = await synthesize(key, azureKey, azureRegion);
        writeFileSync(file, mp3);
        made++;
        if (made % 25 === 0) console.log(`  …synthesized ${made}`);
      } catch (err) {
        failures.push({ key, err: String(err?.message ?? err) });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Manifest includes synthesized strings whose MP3 exists on disk, plus every
  // hand-recorded clip (which bypassed synthesis entirely).
  const present = work
    .filter(({ hash }) => existsSync(join(AUDIO_DIR, `${hash}.mp3`)))
    .map(({ key, hash }) => ({ key, requirePath: `../assets/audio/kn/${hash}.mp3` }));
  const manualEntries = [...manualByKey].map(([key, requirePath]) => ({ key, requirePath }));
  writeManifest([...present, ...manualEntries]);

  console.log('\nDone.');
  console.log(`  Newly synthesized: ${made}`);
  console.log(`  Cached (skipped):  ${cached}`);
  console.log(`  Manual recordings: ${manualEntries.length}`);
  console.log(`  In manifest:       ${present.length + manualEntries.length}`);
  console.log(`  Manifest:          ${relative(ROOT, MANIFEST_PATH)}`);
  console.log(`  Audio dir:         ${relative(ROOT, AUDIO_DIR)}`);
  if (failures.length) {
    console.warn(`\n  ${failures.length} failed (left to runtime TTS fallback):`);
    for (const f of failures.slice(0, 20)) console.warn(`    "${f.key}" — ${f.err}`);
    if (failures.length > 20) console.warn(`    …and ${failures.length - 20} more`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
