/**
 * Content integrity: canonical lesson content (constants/lessons/lessonContent.ts).
 *
 * These tests make every future content edit self-checking. They encode the
 * conventions from the owner content reference (Kannada-Beku-Content.docx) and
 * the 2026-06-26 ISO diacritic normalization:
 *   - transliterations use only lowercase Latin + ā ē ī ō ū ḍ ḷ ṭ ṇ ṣ ṛ
 *   - retroflex letters in the Kannada map 1:1 to their dotted Latin forms
 *     (e.g. ಳ ↔ ḷ), so ಲ್ಲ words stay plain "ll" (illi, not iḷḷi)
 *   - `[name]` is a personalization placeholder, allowed in any field
 */
import { TS_LESSONS, lessonSectionsByNo } from '../../constants/lessons/lessonContent';
import type { Phrase, Word } from '../../constants/lessons/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Latin letters allowed in a transliteration, after stripping `[name]`. */
const TRANSLIT_RE = /^[a-zāēīōūḍḷṭṇṣṛ ?!,.'…-]+$/;

/** Kannada-block chars plus space/punctuation, after stripping `[name]`. */
const KANNADA_RE = /^[ಀ-೿ ?!,.'…-]+$/;

/** Retroflex/special consonants that must map 1:1 Kannada ↔ transliteration. */
const RETROFLEX_PAIRS: [kannada: string, latin: string][] = [
  ['ಳ', 'ḷ'],
  ['ಟ', 'ṭ'],
  ['ಡ', 'ḍ'],
  ['ಣ', 'ṇ'],
  ['ಷ', 'ṣ'],
];

const stripName = (s: string) => s.replace(/\[name\]/g, '').trim();
const count = (s: string, ch: string) => s.split(ch).length - 1;

/**
 * Entries where the Kannada↔transliteration retroflex mapping does NOT hold,
 * found when this suite was first written (2026-07-09) and flagged to the
 * owner for a ruling against the content reference. "kannada" (ಕನ್ನಡ) is
 * plausibly a deliberate familiar-name exception; nade/nadeyiri (ನಡೆ) look
 * like plain misses of the 2026-06-26 normalization. Remove entries here once
 * the content is corrected or the exception is confirmed.
 */
const KNOWN_RETROFLEX_EXCEPTIONS = new Set(['nade', 'nadeyiri', 'nimage kannada gottā?']);

/** Every (word|phrase) across all lessons, labelled for failure messages. */
const allEntries: { label: string; entry: Word | Phrase }[] = TS_LESSONS.flatMap((l) =>
  l.sections.flatMap((s) => [
    ...s.words.map((w) => ({
      label: `L${l.lessonNo} ${s.key} word "${w.transliteration}"`,
      entry: w,
    })),
    ...s.phrases.map((p) => ({
      label: `L${l.lessonNo} ${s.key} phrase "${p.transliteration}"`,
      entry: p,
    })),
  ]),
);

describe('lesson catalogue shape', () => {
  it('has exactly lessons 1–8, in order', () => {
    expect(TS_LESSONS.map((l) => l.lessonNo)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('has unique UUIDs and unique slugs', () => {
    const ids = TS_LESSONS.map((l) => l.id);
    const slugs = TS_LESSONS.map((l) => l.slug);
    ids.forEach((id) => expect(id).toMatch(UUID_RE));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has non-empty title, situation, and realWorldPrompt on every lesson', () => {
    for (const l of TS_LESSONS) {
      expect(l.title.trim()).not.toBe('');
      expect(l.situation.trim()).not.toBe('');
      expect(l.realWorldPrompt.trim()).not.toBe('');
    }
  });

  it('section keys are unique per lesson and follow the "<no>" / "<no><letter>" pattern', () => {
    for (const l of TS_LESSONS) {
      const keys = l.sections.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const key of keys) {
        expect(key).toMatch(new RegExp(`^${l.lessonNo}[a-z]?$`));
      }
    }
  });

  it('every section has a label and at least one word or phrase', () => {
    for (const l of TS_LESSONS) {
      for (const s of l.sections) {
        expect(s.label.trim()).not.toBe('');
        expect(s.words.length + s.phrases.length).toBeGreaterThan(0);
      }
    }
  });

  it('lessonSectionsByNo mirrors the authored sections and is [] for unknown lessons', () => {
    for (const l of TS_LESSONS) {
      expect(lessonSectionsByNo(l.lessonNo)).toEqual(
        l.sections.map((s) => ({ key: s.key, label: s.label })),
      );
    }
    expect(lessonSectionsByNo(99)).toEqual([]);
  });
});

describe('per-entry field integrity', () => {
  it.each(allEntries.map(({ label, entry }) => [label, entry] as const))(
    '%s has well-formed kannada / transliteration / english',
    (_label, entry) => {
      const kn = stripName(entry.kannada);
      const tr = stripName(entry.transliteration);
      expect(kn).not.toBe('');
      expect(tr).not.toBe('');
      expect(entry.english.trim()).not.toBe('');
      expect(kn).toMatch(KANNADA_RE);
      expect(tr).toMatch(TRANSLIT_RE);
    },
  );
});

describe('ISO diacritic conventions (2026-06-26 normalization)', () => {
  it.each(RETROFLEX_PAIRS)(
    'every %s in the Kannada appears as %s in the transliteration (and vice versa)',
    (knChar, latinChar) => {
      const mismatches = allEntries
        .filter(({ entry }) => !KNOWN_RETROFLEX_EXCEPTIONS.has(entry.transliteration))
        .filter(
          ({ entry }) => count(entry.kannada, knChar) !== count(entry.transliteration, latinChar),
        )
        .map(
          ({ label, entry }) =>
            `${label}: ${count(entry.kannada, knChar)}×${knChar} vs ${count(entry.transliteration, latinChar)}×${latinChar}`,
        );
      expect(mismatches).toEqual([]);
    },
  );

  it('no transliteration contains uppercase letters', () => {
    const offenders = allEntries
      .filter(({ entry }) => /[A-Z]/.test(stripName(entry.transliteration)))
      .map(({ label }) => label);
    expect(offenders).toEqual([]);
  });
});
