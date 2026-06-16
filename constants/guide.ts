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
 *   - View-model types (GlyphItem, VowelPair, ConsonantFamily, …) shared by the
 *     loader and the step components.
 *   - The fallback content (CONSONANT_CHART, BASIC_PRINCIPLES, VOWEL_PAIRS, …).
 *   - Pure UI chrome that is NOT DB-sourced (intro blurb, loners caption, step
 *     count) — these stay in code by design.
 */

export type GlyphItem = {
  kannada: string;
  transliteration: string;
  example: string;
};

/** Fallback for the full 34-letter consonant chart (/guide/chart). */
export const CONSONANT_CHART: GlyphItem[] = [
  { kannada: 'ಕ', transliteration: 'ka', example: 'as in cup' },
  { kannada: 'ಖ', transliteration: 'kha', example: 'as in khadi' },
  { kannada: 'ಗ', transliteration: 'ga', example: 'as in gun' },
  { kannada: 'ಘ', transliteration: 'gha', example: 'as in ghat' },
  { kannada: 'ಙ', transliteration: 'gna', example: 'as in gnome' },
  { kannada: 'ಚ', transliteration: 'cha', example: 'as in chair' },
  { kannada: 'ಛ', transliteration: 'chha', example: 'as in church' },
  { kannada: 'ಜ', transliteration: 'ja', example: 'as in jug' },
  { kannada: 'ಝ', transliteration: 'jha', example: 'as in badge' },
  { kannada: 'ಞ', transliteration: 'nja', example: 'rare in English' },
  { kannada: 'ಟ', transliteration: 'Ta', example: 'as in Top' },
  { kannada: 'ಠ', transliteration: 'Tta', example: "hard 'Tt' — as in cut" },
  { kannada: 'ಡ', transliteration: 'Da', example: 'as in Dark' },
  { kannada: 'ಢ', transliteration: 'Dda', example: "hard 'Dd' — as in board" },
  { kannada: 'ಣ', transliteration: 'Nna', example: "heavy 'Nn' — rare in English" },
  { kannada: 'ತ', transliteration: 'ta', example: 'as in Bharath' },
  { kannada: 'ಥ', transliteration: 'tha', example: "soft 'th' — as in Thailand" },
  { kannada: 'ದ', transliteration: 'da', example: 'as in the' },
  { kannada: 'ಧ', transliteration: 'dha', example: 'as in dhal' },
  { kannada: 'ನ', transliteration: 'na', example: 'as in can' },
  { kannada: 'ಪ', transliteration: 'pa', example: 'as in papaya' },
  { kannada: 'ಫ', transliteration: 'pha', example: 'as in orphan' },
  { kannada: 'ಬ', transliteration: 'ba', example: 'as in balloon' },
  { kannada: 'ಭ', transliteration: 'bha', example: 'as in Bharath' },
  { kannada: 'ಮ', transliteration: 'ma', example: 'as in man' },
  { kannada: 'ಯ', transliteration: 'ya', example: 'as in yak' },
  { kannada: 'ರ', transliteration: 'ra', example: 'as in rat' },
  { kannada: 'ಲ', transliteration: 'la', example: 'as in lamp' },
  { kannada: 'ವ', transliteration: 'va', example: 'as in van' },
  { kannada: 'ಶ', transliteration: 'sha', example: 'as in ash' },
  { kannada: 'ಷ', transliteration: 'sshha', example: 'as in shut' },
  { kannada: 'ಸ', transliteration: 'sa', example: 'as in sun' },
  { kannada: 'ಹ', transliteration: 'ha', example: 'as in hump' },
  { kannada: 'ಳ', transliteration: 'lla', example: "rare 'L' — palate sound" },
];

// ── 4-step paced flow view models (chunky_v3 §8) ──────────────────────────────

/** Number of steps in the paced basics flow. UI chrome (not DB-sourced). */
export const GUIDE_STEP_COUNT = 4;

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
    body: 'A doubled consonant (appa, haLLi) is just held a beat longer than a single one.',
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
    long: { kannada: 'ಓ', transliteration: 'ō', example: 'groan' },
  },
];

/** The three vowels with no short→long twin (vocalic r + two diphthongs). */
export type VowelLoner = { kannada: string; transliteration: string; example: string };

export const VOWEL_LONERS: VowelLoner[] = [
  { kannada: 'ಋ', transliteration: 'ru', example: 'rupees' },
  { kannada: 'ಐ', transliteration: 'ai', example: 'ice' },
  { kannada: 'ಔ', transliteration: 'au', example: 'owl' },
];

/** UI chrome — caption above the loner row (not DB-sourced). */
export const VOWEL_LONERS_NOTE = 'And three that stand on their own:';

/** Step 3 — "Consonants live in 5 places" (accordion families). */
export type ConsonantFamily = {
  id: 'throat' | 'palate' | 'curled' | 'teeth' | 'lips';
  /** Place-of-articulation label. */
  place: string;
  /** Short hint of how the sound is made. */
  hint: string;
  glyphs: Array<{ kannada: string; transliteration: string }>;
};

export const CONSONANT_FAMILIES: ConsonantFamily[] = [
  {
    id: 'throat',
    place: 'Throat',
    hint: 'Sound starts at the back of the mouth.',
    glyphs: [
      { kannada: 'ಕ', transliteration: 'ka' },
      { kannada: 'ಖ', transliteration: 'kha' },
      { kannada: 'ಗ', transliteration: 'ga' },
      { kannada: 'ಘ', transliteration: 'gha' },
    ],
  },
  {
    id: 'palate',
    place: 'Palate',
    hint: 'Tongue presses the roof of the mouth.',
    glyphs: [
      { kannada: 'ಚ', transliteration: 'cha' },
      { kannada: 'ಜ', transliteration: 'ja' },
    ],
  },
  {
    id: 'curled',
    place: 'Curled tongue',
    hint: 'Tongue curls up and back (the capital sounds).',
    glyphs: [
      { kannada: 'ಟ', transliteration: 'Ta' },
      { kannada: 'ಡ', transliteration: 'Da' },
      { kannada: 'ಣ', transliteration: 'Nna' },
    ],
  },
  {
    id: 'teeth',
    place: 'Teeth',
    hint: 'Tongue tip touches the upper teeth (the lowercase sounds).',
    glyphs: [
      { kannada: 'ತ', transliteration: 'ta' },
      { kannada: 'ದ', transliteration: 'da' },
      { kannada: 'ನ', transliteration: 'na' },
    ],
  },
  {
    id: 'lips',
    place: 'Lips',
    hint: 'Both lips come together.',
    glyphs: [
      { kannada: 'ಪ', transliteration: 'pa' },
      { kannada: 'ಬ', transliteration: 'ba' },
      { kannada: 'ಮ', transliteration: 'ma' },
    ],
  },
];

/** Step 4 — "Reading + try it" comparison rows (capital vs lowercase). */
export type ReadingRow = {
  symbol: string;
  /** true = retroflex/capital (red); false = dental/lowercase (deep gold). */
  isCapital: boolean;
  example: string;
};

export const READING_ROWS: ReadingRow[] = [
  { symbol: 'Ta', isCapital: true, example: 'as in Top' },
  { symbol: 'ta', isCapital: false, example: 'as in Bharath' },
  { symbol: 'Da', isCapital: true, example: 'as in Dark' },
  { symbol: 'da', isCapital: false, example: 'as in the' },
];

/** The step-4 "TRY IT" prompt. */
export const TRY_IT = {
  transliteration: 'haLLi',
  kannada: 'ಹಳ್ಳಿ',
  english: 'village',
};
