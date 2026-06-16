export interface Word {
  transliteration: string;
  english: string;
  kannada: string;
}

export interface Phrase {
  transliteration: string;
  english: string;
  kannada: string;
  /** Optional cultural/grammar note for PhraseDetailSheet. */
  note?: string;
  /** Optional atom-level gloss for PhraseDetailSheet. */
  gloss?: Array<{ atom: string; en: string; transliteration?: string }>;
}

/**
 * A sequential sub-part of a lesson (e.g. 1a "Saying hello"). A lesson is
 * played one section at a time to avoid overwhelming the learner. Un-split
 * lessons (Lesson 4, Lesson 0, any DB-sourced lesson) have a single section.
 */
export interface LessonSection {
  /** Stable id within the lesson, e.g. "1a". */
  key: string;
  /** Short display label, e.g. "Saying hello". */
  label: string;
  words: Word[];
  phrases: Phrase[];
}

export interface Lesson {
  id: string;
  lessonNo: number;
  title: string;
  slug: string;
  situation: string;
  realWorldPrompt: string;
  /**
   * Optional note shown on the Situation screen for lessons that teach the
   * neutral/respectful (singular/plural) distinction, explaining when to use
   * each register.
   */
  registerNote?: string;
  /** Sequential sub-parts; length 1 for un-split lessons. */
  sections: LessonSection[];
  /**
   * Flattened views over all sections, preserved so whole-lesson consumers
   * (Summary, Done, completion counts) keep working unchanged.
   */
  words: Word[];
  phrases: Phrase[];
}

/** Concatenate every section's words/phrases, in order. */
export function flattenSections(sections: LessonSection[]): {
  words: Word[];
  phrases: Phrase[];
} {
  return {
    words: sections.flatMap((s) => s.words),
    phrases: sections.flatMap((s) => s.phrases),
  };
}

export type LessonPhase =
  | 'idle'
  | 'situation'
  | 'teach_words'
  | 'practice_words'
  | 'teach_phrases'
  | 'practice_phrases'
  | 'summary'
  | 'real_world'
  | 'done';

export interface LessonRow {
  id: string;
  lesson_no: number;
  title: string;
  slug: string;
  situation: string;
  real_world_prompt: string;
  content_json: {
    reference: {
      words: Array<{ english: string; kannada: string; transliteration: string }>;
      phrases: Array<{ english: string; kannada: string; transliteration: string }>;
      verified?: boolean;
      source?: string;
    };
  };
}

export function mapDbLesson(row: LessonRow): Lesson {
  const words: Word[] = row.content_json.reference.words.map((w) => ({
    transliteration: w.transliteration,
    english: w.english,
    kannada: w.kannada,
  }));
  const phrases: Phrase[] = row.content_json.reference.phrases.map((p) => ({
    transliteration: p.transliteration,
    english: p.english,
    kannada: p.kannada,
  }));
  return {
    id: row.id,
    lessonNo: row.lesson_no,
    title: row.title,
    slug: row.slug,
    situation: row.situation,
    realWorldPrompt: row.real_world_prompt,
    // DB-sourced lessons are un-split: one section spanning all content.
    sections: [{ key: String(row.lesson_no), label: row.title, words, phrases }],
    words,
    phrases,
  };
}
