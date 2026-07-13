/**
 * Lesson 0 (Kannada basics) — OFFLINE FALLBACK + view-model types + UI chrome.
 *
 * The source of truth for guide content is the DB: the lessons row at
 * slug='basics' carries the structured payload at content_json.reference.guide,
 * loaded + validated by services/api/guide.ts. The guide runs during first-run
 * onboarding, so a flaky fetch must never blank the primer — this file is the
 * bundled fallback the loader uses when the DB read fails or is malformed.
 *
 * Redesign 2026-06-30 (spec_lesson0_redesign.md): the primer is now a paced,
 * listen-first 7-step flow (Welcome → Vowel sounds → Short vs long → Retroflex →
 * Doubles → Rhythm → Recap). The old 4-section reference chart (13 vowels, the
 * full 34-consonant chart, the pronunciation key) is superseded — see that spec
 * for the owner-signed supersede of the locked spec_beginners_guide.md rows.
 *
 * Phase 1 (this change) ships the new content here as the fallback; the live DB
 * row still carries the OLD guide shape, so the loader's structural check rejects
 * it and falls back to these constants. Phase 2 updates the DB payload to match.
 *
 * What lives here:
 *   - View-model types (WelcomePoint, VowelSound, …) shared by the loader and the
 *     step components.
 *   - The fallback content (WELCOME_POINTS, VOWEL_SOUNDS, …).
 *   - Pure UI chrome that is NOT DB-sourced (step count, per-step CTA labels).
 */

// ── Paced flow chrome (spec_lesson0_redesign.md) ─────────────────────────────

/** Number of steps in the paced basics flow. UI chrome (not DB-sourced). */
export const GUIDE_STEP_COUNT = 7;

/**
 * Per-step primary CTA labels (1-based step → label). UI chrome — the last
 * label points at Lesson 1. Length must equal GUIDE_STEP_COUNT.
 */
export const GUIDE_STEP_CTAS = [
  "Let's listen",
  'Next',
  'Next',
  'Next',
  'Next',
  'Next',
  'Start Lesson 1 · Greetings',
];

// ── Step view models ─────────────────────────────────────────────────────────

/** Step 1 — a numbered reassurance point. */
export type WelcomePoint = { n: number; text: string };

/** Step 2 — one of the 8 common vowel sounds (tap to hear). */
export type VowelSound = { kannada: string; transliteration: string };

/** A word used in a minimal-pair / example demo. */
export type GuideWord = { kannada: string; transliteration: string; english: string };

/** Step 3 — the short→long minimal pair (bala vs baala). */
export type ShortLongPair = { short: GuideWord; long: GuideWord };

/** Step 4 — one retroflex (curled) vs dental (teeth) comparison row. */
export type RetroflexRow = {
  curled: { kannada: string; transliteration: string };
  dental: { kannada: string; transliteration: string };
};

/** Step 6 — the rhythm sentence broken into per-syllable beats. */
export type RhythmSentence = {
  kannada: string;
  syllables: string[];
  transliteration: string;
  english: string;
};

// ── Fallback content ─────────────────────────────────────────────────────────

/** Step 1 — "Welcome to Kannada": three things that make it easier than it looks. */
export const WELCOME_POINTS: WelcomePoint[] = [
  { n: 1, text: 'It is spoken almost exactly as it is written.' },
  { n: 2, text: 'Every vowel is pronounced — nothing stays silent.' },
  { n: 3, text: 'Even stress: syllables share the weight.' },
];

/** Step 2 — the 8 common vowel sounds (docx: a, aa, i, ee, u, oo, e, o). */
export const VOWEL_SOUNDS: VowelSound[] = [
  { kannada: 'ಅ', transliteration: 'a' },
  { kannada: 'ಆ', transliteration: 'aa' },
  { kannada: 'ಇ', transliteration: 'i' },
  { kannada: 'ಈ', transliteration: 'ee' },
  { kannada: 'ಉ', transliteration: 'u' },
  { kannada: 'ಊ', transliteration: 'oo' },
  { kannada: 'ಎ', transliteration: 'e' },
  { kannada: 'ಒ', transliteration: 'o' },
];

/** Step 3 — short vs long: holding the vowel changes the word. */
export const SHORT_LONG_PAIR: ShortLongPair = {
  short: { kannada: 'ಬಲ', transliteration: 'bala', english: 'strength' },
  long: { kannada: 'ಬಾಲ', transliteration: 'baala', english: 'tail' },
};

/** Step 4 — retroflex (Capital, curled) vs dental (lowercase, teeth). */
export const RETROFLEX_ROWS: RetroflexRow[] = [
  {
    curled: { kannada: 'ಟ', transliteration: 'Ta' },
    dental: { kannada: 'ತ', transliteration: 'ta' },
  },
  {
    curled: { kannada: 'ಡ', transliteration: 'Da' },
    dental: { kannada: 'ದ', transliteration: 'da' },
  },
];

/** Step 5 — doubled consonants are held a beat longer. */
export const DOUBLE_WORDS: GuideWord[] = [
  { kannada: 'ಅಪ್ಪ', transliteration: 'appa', english: 'father' },
  { kannada: 'ಅಮ್ಮ', transliteration: 'amma', english: 'mother' },
  { kannada: 'ಹಳ್ಳಿ', transliteration: 'haLLi', english: 'village' },
];

/** Step 6 — the even, syllable-timed rhythm of Kannada. */
export const RHYTHM_SENTENCE: RhythmSentence = {
  kannada: 'ನನಗೆ ಕನ್ನಡ ಬೇಕು',
  syllables: ['na', 'na', 'ge', 'kan', 'na', 'da', 'bē', 'ku'],
  transliteration: 'Nanage Kannada bēku',
  english: '“I want Kannada”',
};

/** Step 7 — four takeaways to keep in your pocket. */
export const RECAP_POINTS: string[] = [
  'Kannada is phonetic — say what you see.',
  'Long vowels change the word (bala vs baala).',
  'Capital letters (Ta, Da, Na, La) mean curl your tongue.',
  'Double letters are held slightly longer.',
];
