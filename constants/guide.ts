/**
 * Beginners' Guide — OFFLINE FALLBACK + UI-chrome constants + view-model types.
 *
 * The source of truth for guide content is the DB: the lessons row at
 * slug='basics' carries the structured payload at content_json.reference.guide,
 * loaded + validated by services/api/guide.ts. The guide runs during first-run
 * onboarding, so a flaky fetch must never blank the primer — this file is the
 * bundled fallback that loader uses when the DB read fails or is malformed.
 *
 * Keep this in sync with the DB payload (migration 2026-06-15_basics_guide_content).
 * See spec_beginners_guide.md and design_handoff_chunky_v3 §8.
 *
 * What lives here:
 *   - View-model types (VowelPair, VowelLoner, …) shared by the loader and the
 *     step components.
 *   - The fallback content (BASIC_PRINCIPLES, VOWEL_PAIRS, …).
 *   - Pure UI chrome that is NOT DB-sourced (intro blurb, loners caption, step
 *     count) — these stay in code by design.
 *
 * Onboarding-simplification (2026-06-22): the flow is now 3 screens — Listen →
 * Notice → Name. The old "Consonants live in 5 places" screen and the 34-letter
 * chart reference were dropped; the Ta/ta·Da/da audio demos in steps 1 & 3 are
 * fixed UI chrome in the step components, not DB-sourced.
 */

// ── 3-step paced flow view models (chunky_v3 §8) ──────────────────────────────

/** Number of steps in the paced basics flow. UI chrome (not DB-sourced). */
export const GUIDE_STEP_COUNT = 3;

/** Step 1 — "Three things — that's it" (numbered reassurance cards). */
export type BasicPrinciple = {
  /** Short headline shown beside the gold number circle. */
  title: string;
  /** One-line explanation. */
  body: string;
};

/** UI chrome — the step-1 reassurance paragraph (not DB-sourced). */
export const GUIDE_INTRO_BLURB =
  "You don't need to memorise anything here. Three small habits will carry you through every lesson — skim them once and move on.";

export const BASIC_PRINCIPLES: BasicPrinciple[] = [
  {
    title: 'Say what you see',
    body: 'Kannada is written the way it sounds. Read the letters left to right and you have said the word.',
  },
  {
    title: 'Capitals curl your tongue',
    body: 'A capital letter in our spellings (Ta, Da, La) means curl your tongue up and back — a fuller, hollow sound.',
  },
  {
    title: 'Doubled letters linger',
    body: 'A doubled consonant (appa, haḷḷi) is just held a beat longer than a single one.',
  },
];

/** Step 2 — "Vowels come in pairs" (short → long). */
export type VowelPair = {
  short: { kannada: string; transliteration: string; example: string };
  long: { kannada: string; transliteration: string; example: string };
};

export const VOWEL_PAIRS: VowelPair[] = [
  {
    short: { kannada: 'ಅ', transliteration: 'a', example: 'up' },
    long: { kannada: 'ಆ', transliteration: 'ā', example: 'art' },
  },
  {
    short: { kannada: 'ಇ', transliteration: 'i', example: 'igloo' },
    long: { kannada: 'ಈ', transliteration: 'ī', example: 'seed' },
  },
  {
    short: { kannada: 'ಉ', transliteration: 'u', example: 'push' },
    long: { kannada: 'ಊ', transliteration: 'ū', example: 'moon' },
  },
  {
    short: { kannada: 'ಎ', transliteration: 'e', example: 'cake' },
    long: { kannada: 'ಏ', transliteration: 'ē', example: 'crane' },
  },
  {
    short: { kannada: 'ಒ', transliteration: 'o', example: 'opener' },
    long: { kannada: 'ಓ', transliteration: 'ō', example: 'go' },
  },
];

/** The three vowels with no short→long twin (vocalic r + two diphthongs). */
export type VowelLoner = { kannada: string; transliteration: string; example: string };

export const VOWEL_LONERS: VowelLoner[] = [
  { kannada: 'ಋ', transliteration: 'ṛ', example: 'rupees' },
  { kannada: 'ಐ', transliteration: 'ai', example: 'ice' },
  { kannada: 'ಔ', transliteration: 'au', example: 'owl' },
];

/** UI chrome — caption above the loner row (not DB-sourced). */
export const VOWEL_LONERS_NOTE = 'And three that stand on their own:';

/** The step-3 "TRY IT" prompt. */
export const TRY_IT = {
  transliteration: 'haḷḷi',
  kannada: 'ಹಳ್ಳಿ',
  english: 'village',
};
