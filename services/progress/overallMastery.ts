import { TS_LESSONS } from '../../constants/lessons/lessonContent';
import { LEARN_ALPHA } from '../../constants/goals';
import type { GameMasteryByLesson } from '../api/gameMastery';

/** Per-lesson breakdown behind the overall %, useful for debugging / future UI. */
export type LessonMasteryBreakdown = {
  lessonNo: number;
  slug: string;
  /** Fraction of the lesson taught (parts completed / parts). 0..1. */
  learn: number;
  /** Fraction of the lesson's game items answered correctly, or null when the
   *  lesson has no game content (then it doesn't drag the score). 0..1. */
  practice: number | null;
  /** Blended lesson mastery. 0..1. */
  mastery: number;
};

export type OverallMastery = {
  /** 0..100, the headline number shown on Profile. */
  progressPct: number;
  perLesson: LessonMasteryBreakdown[];
};

/**
 * Content-derived overall progress — the per-lesson mastery rollup that
 * replaced the arbitrary server formula (50·lessons/8 + 25·opp/8 + 25·dict/8
 * with an 80% cliff). Pure + side-effect free so it's unit-testable and runs
 * client-side.
 *
 *   learn_L    = parts of L completed / L.sections.length            (continuous)
 *   practice_L = Σ_games correct / Σ_games total  for L              (continuous, all games)
 *   mastery_L  = α·learn_L + (1−α)·practice_L   (= learn_L if L has no game items)
 *   overall    = 100 · mean_L(mastery_L)        (denominator = TS_LESSONS.length)
 *
 * No magic 8 (denominators are real content counts), no threshold cliff, and
 * every game counts in proportion to its item volume.
 */
export function computeOverallMastery(
  completedLessons: string[], // slugs (see progressStore)
  completedParts: string[], // "<slug>:<partKey>"
  gameMastery: GameMasteryByLesson,
): OverallMastery {
  const completedSet = new Set(completedLessons);

  const perLesson: LessonMasteryBreakdown[] = TS_LESSONS.map((lesson) => {
    const sectionCount = lesson.sections.length;
    // A fully-completed lesson lands in completedLessons and backfills all its
    // parts; otherwise count its sub-parts recorded in completedParts.
    const partsDone = completedSet.has(lesson.slug)
      ? sectionCount
      : completedParts.filter((k) => k.startsWith(`${lesson.slug}:`)).length;
    const learn = sectionCount > 0 ? Math.min(1, partsDone / sectionCount) : 0;

    const gm = gameMastery[lesson.lessonNo];
    const practice = gm && gm.total > 0 ? gm.correct / gm.total : null;

    const mastery = practice === null ? learn : LEARN_ALPHA * learn + (1 - LEARN_ALPHA) * practice;

    return { lessonNo: lesson.lessonNo, slug: lesson.slug, learn, practice, mastery };
  });

  const avg =
    perLesson.length > 0 ? perLesson.reduce((sum, l) => sum + l.mastery, 0) / perLesson.length : 0;

  return {
    progressPct: Math.max(0, Math.min(100, avg * 100)),
    perLesson,
  };
}
