/**
 * Canonical Beginners' Guide content.
 * Source of truth for the rendered /onboarding/basics, /guide (4-step flow) and
 * /guide/chart (full reference) screens. See spec_beginners_guide.md and
 * design_handoff_chunky_v3 §8.
 *
 * The public.lessons row at slug='basics' carries a parallel snapshot in
 * content_json.reference.sections. The two are deliberately not synced — the
 * TS file is what gets rendered; the DB row is the raw reference material.
 *
 * Structure (chunky_v3):
 *   - GUIDE_SECTIONS — the original section model, KEPT INTACT. The `consonants`
 *     section holds the full 34-letter chart and powers /guide/chart. The
 *     `vowels` section is the source for the step-2 vowel pairs.
 *   - VOWEL_PAIRS / CONSONANT_FAMILIES / READING_ROWS — derived/curated view
 *     models for the 4-step paced flow. They reference the same content.
 */

export type GlyphItem = {
  kind: 'glyph';
  kannada: string;
  transliteration: string;
  example: string;
};

export type RuleItem = {
  kind: 'rule';
  ruleKind: 'retroflex' | 'dental' | 'geminated';
  title: string;
  description: string;
  examples: Array<{ transliteration: string; english: string }>;
};

export type KeyItem = {
  kind: 'key';
  symbol: string;
  example: string;
};

export type GuideItem = GlyphItem | RuleItem | KeyItem;

export type GuideSection = {
  slug: 'vowels' | 'consonant-rules' | 'consonants' | 'pronunciation-key';
  title: string;
  subtitle: string;
  order: number;
  items: GuideItem[];
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    slug: 'vowels',
    order: 1,
    title: 'Vowels (ಸ್ವರಗಳು)',
    subtitle: 'Kannada has 13 vowels. Long vowels use a macron — ā, ē, ī, ō, ū.',
    items: [
      { kind: 'glyph', kannada: 'ಅ', transliteration: 'a', example: 'as in America' },
      { kind: 'glyph', kannada: 'ಆ', transliteration: 'ā', example: 'as in art' },
      { kind: 'glyph', kannada: 'ಇ', transliteration: 'i', example: 'as in igloo' },
      { kind: 'glyph', kannada: 'ಈ', transliteration: 'ī', example: 'as in seed' },
      { kind: 'glyph', kannada: 'ಉ', transliteration: 'u', example: 'as in push' },
      { kind: 'glyph', kannada: 'ಊ', transliteration: 'ū', example: 'as in moon' },
      { kind: 'glyph', kannada: 'ಋ', transliteration: 'ṛ', example: 'as in rupees' },
      { kind: 'glyph', kannada: 'ಎ', transliteration: 'e', example: 'as in cake' },
      { kind: 'glyph', kannada: 'ಏ', transliteration: 'ē', example: 'as in crane' },
      { kind: 'glyph', kannada: 'ಐ', transliteration: 'ai', example: 'as in ice' },
      { kind: 'glyph', kannada: 'ಒ', transliteration: 'o', example: 'as in opener' },
      { kind: 'glyph', kannada: 'ಓ', transliteration: 'ō', example: 'as in go' },
      { kind: 'glyph', kannada: 'ಔ', transliteration: 'au', example: 'as in owl' },
    ],
  },
  {
    slug: 'consonant-rules',
    order: 2,
    title: 'Sounding consonants',
    subtitle: 'Three patterns to watch for: retroflex, dental, and doubled letters.',
    items: [
      {
        kind: 'rule',
        ruleKind: 'retroflex',
        title: 'Retroflex (capital letters)',
        description:
          'Tongue curls up and back, touching the ridge behind the teeth. Hollow, fuller sound.',
        examples: [
          { transliteration: 'Ta', english: 'as in Top' },
          { transliteration: 'Da', english: 'as in Dark' },
          { transliteration: 'Na', english: 'as in Pranam' },
          { transliteration: 'La', english: 'as in haLLi' },
        ],
      },
      {
        kind: 'rule',
        ruleKind: 'dental',
        title: 'Dental (lowercase letters)',
        description:
          'Tongue tip touches the back of the upper front teeth. Flat, soft, far forward.',
        examples: [
          { transliteration: 'ta', english: 'as in Bharath' },
          { transliteration: 'da', english: 'as in the' },
          { transliteration: 'na', english: 'as in narrator' },
          { transliteration: 'la', english: 'as in large' },
        ],
      },
      {
        kind: 'rule',
        ruleKind: 'geminated',
        title: 'Doubled letters',
        description: 'The consonant is held slightly longer than a single one.',
        examples: [
          { transliteration: 'appa', english: 'father' },
          { transliteration: 'amma', english: 'mother' },
        ],
      },
    ],
  },
  {
    slug: 'consonants',
    order: 3,
    title: 'Consonant chart (ವ್ಯಂಜನಗಳು)',
    subtitle: "The 34 consonants grouped by where they're produced in the mouth.",
    items: [
      { kind: 'glyph', kannada: 'ಕ', transliteration: 'ka', example: 'as in cup' },
      { kind: 'glyph', kannada: 'ಖ', transliteration: 'kha', example: 'as in khadi' },
      { kind: 'glyph', kannada: 'ಗ', transliteration: 'ga', example: 'as in gun' },
      { kind: 'glyph', kannada: 'ಘ', transliteration: 'gha', example: 'as in ghat' },
      { kind: 'glyph', kannada: 'ಙ', transliteration: 'gna', example: 'as in gnome' },
      { kind: 'glyph', kannada: 'ಚ', transliteration: 'cha', example: 'as in chair' },
      { kind: 'glyph', kannada: 'ಛ', transliteration: 'chha', example: 'as in church' },
      { kind: 'glyph', kannada: 'ಜ', transliteration: 'ja', example: 'as in jug' },
      { kind: 'glyph', kannada: 'ಝ', transliteration: 'jha', example: 'as in badge' },
      { kind: 'glyph', kannada: 'ಞ', transliteration: 'nja', example: 'rare in English' },
      { kind: 'glyph', kannada: 'ಟ', transliteration: 'Ta', example: 'as in Top' },
      { kind: 'glyph', kannada: 'ಠ', transliteration: 'Tha', example: 'as in Cut' },
      { kind: 'glyph', kannada: 'ಡ', transliteration: 'Da', example: 'as in Dark' },
      { kind: 'glyph', kannada: 'ಢ', transliteration: 'Ddha', example: 'as in Board' },
      { kind: 'glyph', kannada: 'ಣ', transliteration: 'Nha', example: 'rare in English' },
      { kind: 'glyph', kannada: 'ತ', transliteration: 'ta', example: 'as in Bharath' },
      { kind: 'glyph', kannada: 'ಥ', transliteration: 'tha', example: 'as in thumb' },
      { kind: 'glyph', kannada: 'ದ', transliteration: 'da', example: 'as in the' },
      { kind: 'glyph', kannada: 'ಧ', transliteration: 'dha', example: 'as in dhal' },
      { kind: 'glyph', kannada: 'ನ', transliteration: 'na', example: 'as in can' },
      { kind: 'glyph', kannada: 'ಪ', transliteration: 'pa', example: 'as in papaya' },
      { kind: 'glyph', kannada: 'ಫ', transliteration: 'pha', example: 'as in orphan' },
      { kind: 'glyph', kannada: 'ಬ', transliteration: 'ba', example: 'as in balloon' },
      { kind: 'glyph', kannada: 'ಭ', transliteration: 'bha', example: 'as in Bharath' },
      { kind: 'glyph', kannada: 'ಮ', transliteration: 'ma', example: 'as in man' },
      { kind: 'glyph', kannada: 'ಯ', transliteration: 'ya', example: 'as in yak' },
      { kind: 'glyph', kannada: 'ರ', transliteration: 'ra', example: 'as in rat' },
      { kind: 'glyph', kannada: 'ಲ', transliteration: 'la', example: 'as in lamp' },
      { kind: 'glyph', kannada: 'ವ', transliteration: 'va', example: 'as in water' },
      { kind: 'glyph', kannada: 'ಶ', transliteration: 'sha', example: 'as in ash' },
      { kind: 'glyph', kannada: 'ಷ', transliteration: 'sshha', example: 'as in shut' },
      { kind: 'glyph', kannada: 'ಸ', transliteration: 'sa', example: 'as in sun' },
      { kind: 'glyph', kannada: 'ಹ', transliteration: 'ha', example: 'as in hump' },
      { kind: 'glyph', kannada: 'ಳ', transliteration: 'lla', example: 'as in Clitella' },
    ],
  },
  {
    slug: 'pronunciation-key',
    order: 4,
    title: 'Reading transliteration',
    subtitle: "Symbols you'll see across the app.",
    items: [
      { kind: 'key', symbol: 'Ta', example: 'Top' },
      { kind: 'key', symbol: 'ta', example: 'Bharath' },
      { kind: 'key', symbol: 'Da', example: 'Dark' },
      { kind: 'key', symbol: 'da', example: 'the' },
      { kind: 'key', symbol: 'Na', example: 'Pranam' },
      { kind: 'key', symbol: 'na', example: 'narrator' },
      { kind: 'key', symbol: 'La', example: 'haLLi' },
      { kind: 'key', symbol: 'la', example: 'large' },
    ],
  },
];

// ── 4-step paced flow view models (chunky_v3 §8) ──────────────────────────────
//
// The four steps below are the curated, beginner-friendly slices of the data
// above. They are rendered by the new step components; GUIDE_SECTIONS stays the
// raw reference (and the full consonant chart for /guide/chart).

/** Number of steps in the paced basics flow. */
export const GUIDE_STEP_COUNT = 4;

/** Step 1 — "Three things — that's it" (numbered reassurance cards). */
export type BasicPrinciple = {
  /** Short headline shown beside the gold number circle. */
  title: string;
  /** One-line explanation. */
  body: string;
};

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

/**
 * The five short→long pairs, pulled from the GUIDE_SECTIONS vowels data.
 * Note the canonical examples in GUIDE_SECTIONS are kept; the design copy's
 * "up"/"art" shorthand is the trailing example word, already present there.
 */
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

/** Footnote for the three vowels not paired (diphthongs + vocalic r). */
export const VOWEL_LONERS_NOTE =
  '+ three loners you’ll meet later: ಐ ai · ಔ au · ಋ ṛ';

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
      { kannada: 'ಣ', transliteration: 'Na' },
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
