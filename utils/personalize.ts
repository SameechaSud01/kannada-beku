import { flattenSections, type Lesson, type Phrase, type Word } from '../constants/lessons/types';
import type { ConversationScenario } from '../services/api/games/conversations';

/**
 * Placeholder for the learner's name in authored lesson content. Lives only in
 * the English + transliteration fields of self-introduction phrases (e.g.
 * "I am [name]"). The Kannada script keeps its authored example name so its
 * pre-recorded audio still resolves (see normalizeForAudio / getBundledAudio),
 * and the speech-matching + audio layers already tolerate the token.
 */
const NAME_TOKEN = /\[name\]/g;

/** Swap `[name]` placeholders in a string for the learner's first name. */
export function personalizeText(text: string, firstName: string): string {
  return text.replace(NAME_TOKEN, firstName);
}

function personalizePhrase(p: Phrase, firstName: string): Phrase {
  return {
    ...p,
    english: personalizeText(p.english, firstName),
    transliteration: personalizeText(p.transliteration, firstName),
  };
}

function personalizeWord(w: Word, firstName: string): Word {
  return {
    ...w,
    english: personalizeText(w.english, firstName),
    transliteration: personalizeText(w.transliteration, firstName),
  };
}

/**
 * Return a copy of the lesson with `[name]` placeholders resolved to the
 * learner's first name across every section (and the flattened views, kept
 * consistent). Kannada script is intentionally left untouched so the authored
 * example + its bundled audio stay intact.
 */
export function personalizeLesson(lesson: Lesson, firstName: string): Lesson {
  const sections = lesson.sections.map((s) => ({
    ...s,
    words: s.words.map((w) => personalizeWord(w, firstName)),
    phrases: s.phrases.map((p) => personalizePhrase(p, firstName)),
  }));
  return { ...lesson, sections, ...flattenSections(sections) };
}

/**
 * Resolve `[name]` placeholders in conversation scenarios — the English gloss +
 * transliteration of self-introduction reply options (e.g. "I am [name]"). The
 * Kannada line is left untouched so its authored example + audio stay intact.
 * Options/lines without the token are unaffected.
 */
export function personalizeScenarios(
  scenarios: ConversationScenario[],
  firstName: string,
): ConversationScenario[] {
  return scenarios.map((s) => ({
    ...s,
    turns: s.turns.map((t) => ({
      ...t,
      speakerLineEn: personalizeText(t.speakerLineEn, firstName),
      options: t.options.map((o) => ({
        ...o,
        en: personalizeText(o.en, firstName),
        tr: personalizeText(o.tr, firstName),
      })),
    })),
  }));
}
