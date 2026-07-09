/**
 * Content integrity: generated game content bundles (constants/games/*) plus
 * emergency phrases and fun facts.
 *
 * These files are AUTO-GENERATED from the live DB by scripts/generateContent.mjs,
 * so this suite is the tripwire that catches a bad dashboard edit or a broken
 * regeneration before it ships: dangling lesson/section references, quiz turns
 * whose correct answer isn't among the options, duplicate ids, etc.
 */
import { CONVERSATION_SCENARIOS_BY_LESSON } from '../../constants/games/conversationScenarios';
import { DICTATION_ITEMS_BY_LESSON } from '../../constants/games/dictationItems';
import { OPPOSITES_ITEMS_BY_LESSON } from '../../constants/games/oppositesItems';
import { QUICK_QUIZ_ITEMS_BY_LESSON } from '../../constants/games/quickQuizItems';
import { EMERGENCY_GROUPS } from '../../constants/emergencyPhrases';
import { TS_LESSONS, lessonSectionsByNo } from '../../constants/lessons/lessonContent';
import funFacts from '../../data/karnataka_fun_facts.json';

const LESSON_NOS = TS_LESSONS.map((l) => l.lessonNo);
const LESSON_ID_BY_NO = new Map(TS_LESSONS.map((l) => [l.lessonNo, l.id]));
const KANNADA_CHAR_RE = /[ಀ-೿]/;

const sectionKeysOf = (lessonNo: number) => new Set(lessonSectionsByNo(lessonNo).map((s) => s.key));

/** Assert ids are unique across every array in a BY_LESSON record. */
function expectUniqueIds(byLesson: Record<number, { id: string }[]>) {
  const ids = Object.values(byLesson).flatMap((items) => items.map((i) => i.id));
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  expect(dupes).toEqual([]);
}

/** Assert every item's lessonNo/lessonId/section agree with the lesson catalogue. */
function expectLessonLinks(
  byLesson: Record<
    number,
    { id: string; lessonNo: number; lessonId: string; section: string | null }[]
  >,
) {
  for (const [key, items] of Object.entries(byLesson)) {
    const lessonNo = Number(key);
    expect(LESSON_NOS).toContain(lessonNo);
    const validSections = sectionKeysOf(lessonNo);
    for (const item of items) {
      expect(item.lessonNo).toBe(lessonNo);
      expect(item.lessonId).toBe(LESSON_ID_BY_NO.get(lessonNo));
      if (item.section != null) {
        expect(validSections).toContain(item.section);
      }
    }
  }
}

describe('game bank lesson coverage', () => {
  // The live DB has not authored every game for every lesson yet. This pins
  // the coverage as of 2026-07-09 so a bank silently DISAPPEARING fails the
  // suite; extend the expected list when new lesson content is authored.
  it.each([
    ['quick quiz', QUICK_QUIZ_ITEMS_BY_LESSON, [1, 2, 3, 4, 5, 6]],
    ['opposites', OPPOSITES_ITEMS_BY_LESSON, [1, 2, 3, 4, 5, 6, 7]],
    ['dictation', DICTATION_ITEMS_BY_LESSON, [1, 2, 3, 4, 5, 6]],
    ['conversations', CONVERSATION_SCENARIOS_BY_LESSON, [1, 2]],
  ] as const)('%s covers its known lessons with non-empty banks', (_name, byLesson, expected) => {
    const keys = Object.keys(byLesson)
      .map(Number)
      .sort((a, b) => a - b);
    expect(keys).toEqual([...expected]);
    for (const key of keys) {
      expect(LESSON_NOS).toContain(key);
    }
    for (const items of Object.values(byLesson)) {
      expect(items.length).toBeGreaterThan(0);
    }
  });
});

describe('quick quiz items', () => {
  it('have unique ids and valid lesson/section links', () => {
    expectUniqueIds(QUICK_QUIZ_ITEMS_BY_LESSON);
    expectLessonLinks(QUICK_QUIZ_ITEMS_BY_LESSON);
  });

  it('have non-empty kannada / transliteration / meaning', () => {
    for (const item of Object.values(QUICK_QUIZ_ITEMS_BY_LESSON).flat()) {
      expect(item.kannada).toMatch(KANNADA_CHAR_RE);
      expect((item.transliteration ?? '').trim()).not.toBe('');
      expect(item.meaning.trim()).not.toBe('');
    }
  });

  it('every lesson bank has at least 2 items so a round can offer options', () => {
    for (const items of Object.values(QUICK_QUIZ_ITEMS_BY_LESSON)) {
      expect(items.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('opposites items', () => {
  it('have unique ids and valid lesson/section links', () => {
    expectUniqueIds(OPPOSITES_ITEMS_BY_LESSON);
    expectLessonLinks(OPPOSITES_ITEMS_BY_LESSON);
  });

  it('offer the true opposite exactly once among distinct options', () => {
    for (const item of Object.values(OPPOSITES_ITEMS_BY_LESSON).flat()) {
      const matching = item.options.filter((o) => o.kn === item.opposite);
      expect({ id: item.id, word: item.word, matches: matching.length }).toEqual({
        id: item.id,
        word: item.word,
        matches: 1,
      });
      const kns = item.options.map((o) => o.kn);
      expect(new Set(kns).size).toBe(kns.length);
      expect(item.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('dictation items', () => {
  it('have unique ids and valid lesson/section links', () => {
    expectUniqueIds(DICTATION_ITEMS_BY_LESSON);
    expectLessonLinks(DICTATION_ITEMS_BY_LESSON);
  });

  it('have a Kannada expected answer, accepted spellings, and a phonetic guide', () => {
    for (const item of Object.values(DICTATION_ITEMS_BY_LESSON).flat()) {
      expect(item.expectedAnswer).toMatch(KANNADA_CHAR_RE);
      expect(item.acceptedSpellings.length).toBeGreaterThan(0);
      for (const s of item.acceptedSpellings) {
        expect(s.trim()).not.toBe('');
      }
      // Note: duplicates within acceptedSpellings exist in the live data
      // (e.g. 'beku' twice) — harmless at runtime, so not asserted here.
      expect((item.phonetic ?? '').trim()).not.toBe('');
    }
  });
});

describe('conversation scenarios', () => {
  const scenarios = Object.values(CONVERSATION_SCENARIOS_BY_LESSON).flat();

  it('have unique scenario and turn ids', () => {
    const scenarioIds = scenarios.map((s) => s.id);
    expect(new Set(scenarioIds).size).toBe(scenarioIds.length);
    const turnIds = scenarios.flatMap((s) => s.turns.map((t) => t.id));
    expect(new Set(turnIds).size).toBe(turnIds.length);
  });

  it('scenarios reference valid sections and have at least one turn', () => {
    for (const [key, list] of Object.entries(CONVERSATION_SCENARIOS_BY_LESSON)) {
      const validSections = sectionKeysOf(Number(key));
      for (const scenario of list) {
        expect(scenario.title.trim()).not.toBe('');
        expect(scenario.turns.length).toBeGreaterThan(0);
        if (scenario.section != null) {
          expect(validSections).toContain(scenario.section);
        }
      }
    }
  });

  it('every turn is answerable: distinct options including the correct one', () => {
    for (const scenario of scenarios) {
      const indices = scenario.turns.map((t) => t.turnIndex);
      expect([...indices].sort((a, b) => a - b)).toEqual(indices);
      expect(new Set(indices).size).toBe(indices.length);
      for (const turn of scenario.turns) {
        expect(turn.speakerLineKn).toMatch(KANNADA_CHAR_RE);
        expect(turn.speakerLineEn.trim()).not.toBe('');
        expect(turn.options.length).toBeGreaterThanOrEqual(2);
        const optionIds = turn.options.map((o) => o.id);
        expect(new Set(optionIds).size).toBe(optionIds.length);
        expect(optionIds).toContain(turn.correctOptionId);
      }
    }
  });
});

describe('emergency phrases', () => {
  it('groups and items are unique, labelled, and non-empty', () => {
    const groupIds = EMERGENCY_GROUPS.map((g) => g.id);
    expect(new Set(groupIds).size).toBe(groupIds.length);
    const itemIds = EMERGENCY_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(itemIds).size).toBe(itemIds.length);
    for (const group of EMERGENCY_GROUPS) {
      expect(group.label.trim()).not.toBe('');
      expect(group.items.length).toBeGreaterThan(0);
      for (const item of group.items) {
        expect(item.kannada).toMatch(KANNADA_CHAR_RE);
        expect((item.transliteration ?? '').trim()).not.toBe('');
        expect(item.meaning.trim()).not.toBe('');
      }
    }
  });
});

describe('karnataka fun facts', () => {
  it('facts are unique, numbered, and non-empty', () => {
    expect(funFacts.length).toBeGreaterThan(0);
    const nos = funFacts.map((f) => f.factNo);
    expect(new Set(nos).size).toBe(nos.length);
    for (const f of funFacts) {
      expect(f.category.trim()).not.toBe('');
      expect(f.fact.trim()).not.toBe('');
    }
  });
});
