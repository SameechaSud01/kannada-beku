import { computeOverallMastery } from '../../services/progress/overallMastery';
import { TS_LESSONS } from '../../constants/lessons/lessonContent';
import { LEARN_ALPHA } from '../../constants/goals';
import type { GameMasteryByLesson } from '../../services/api/gameMastery';

const allSlugs = TS_LESSONS.map((l) => l.slug);
const perfectGames: GameMasteryByLesson = Object.fromEntries(
  TS_LESSONS.map((l) => [l.lessonNo, { correct: 10, total: 10 }]),
);

describe('computeOverallMastery', () => {
  it('is 0% with no progress', () => {
    const r = computeOverallMastery([], [], {});
    expect(r.progressPct).toBe(0);
    expect(r.perLesson.every((l) => l.mastery === 0)).toBe(true);
  });

  it('is 100% when every lesson is learnt and every game is perfect', () => {
    const r = computeOverallMastery(allSlugs, [], perfectGames);
    expect(Math.round(r.progressPct)).toBe(100);
  });

  it('treats a lesson with no game items as learn-only (no drag)', () => {
    // No game data at all -> practice is null everywhere, so a fully-learnt
    // course is 100% rather than being held back by missing game items.
    const r = computeOverallMastery(allSlugs, [], {});
    expect(Math.round(r.progressPct)).toBe(100);
    expect(r.perLesson.every((l) => l.practice === null)).toBe(true);
  });

  it('gives continuous partial credit below the old 80% cliff', () => {
    const lessonNo = TS_LESSONS[0].lessonNo;
    const games: GameMasteryByLesson = { [lessonNo]: { correct: 79, total: 100 } };
    const r = computeOverallMastery([], [], games);
    const l1 = r.perLesson.find((l) => l.lessonNo === lessonNo)!;
    expect(l1.practice).toBeCloseTo(0.79, 5);
    // Old server formula scored a 79% subgame as 0. The rollup gives real,
    // strictly-positive credit.
    expect(l1.mastery).toBeCloseTo((1 - LEARN_ALPHA) * 0.79, 5);
    expect(l1.mastery).toBeGreaterThan(0);
  });

  it('blends learn and practice with LEARN_ALPHA', () => {
    const { slug, lessonNo } = TS_LESSONS[0];
    const games: GameMasteryByLesson = { [lessonNo]: { correct: 1, total: 2 } }; // practice 0.5
    const r = computeOverallMastery([slug], [], games); // learn 1 (fully complete)
    const l1 = r.perLesson.find((l) => l.lessonNo === lessonNo)!;
    expect(l1.learn).toBe(1);
    expect(l1.practice).toBeCloseTo(0.5, 5);
    expect(l1.mastery).toBeCloseTo(LEARN_ALPHA * 1 + (1 - LEARN_ALPHA) * 0.5, 5);
  });

  it('counts partial parts toward learn (continuous, slug-scoped)', () => {
    const lesson = TS_LESSONS.find((l) => l.sections.length > 1)!;
    const oneSlugPart = [`${lesson.slug}:${lesson.sections[0].key}`];
    const r = computeOverallMastery([], oneSlugPart, {});
    const row = r.perLesson.find((l) => l.lessonNo === lesson.lessonNo)!;
    expect(row.learn).toBeCloseTo(1 / lesson.sections.length, 5);
  });
});
