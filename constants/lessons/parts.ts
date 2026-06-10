import type { Lesson } from './types';

export interface PartState {
  key: string;
  label: string;
  index: number;
  wordCount: number;
  phraseCount: number;
  /** Sub-part finished (or whole lesson complete on the server). */
  done: boolean;
  /** Reachable now — first part, or the previous part is done (sequential). */
  unlocked: boolean;
  /** The single in-progress part the chooser should highlight. */
  active: boolean;
  isLast: boolean;
}

/**
 * Sequential sub-part progression. Part 0 is always unlocked; part i unlocks
 * once part i-1 is done. A lesson completed on the server backfills every part
 * as done, so finished lessons read correctly even after a reinstall wiped the
 * client-only `completedParts`.
 */
export function computePartStates(
  lesson: Lesson,
  completedPartKeys: ReadonlySet<string>,
  lessonComplete: boolean,
): PartState[] {
  const done = lesson.sections.map(
    (s) => lessonComplete || completedPartKeys.has(`${lesson.slug}:${s.key}`),
  );
  let activeAssigned = false;
  return lesson.sections.map((s, i) => {
    const unlocked = i === 0 || done[i - 1];
    const active = unlocked && !done[i] && !activeAssigned;
    if (active) activeAssigned = true;
    return {
      key: s.key,
      label: s.label,
      index: i,
      wordCount: s.words.length,
      phraseCount: s.phrases.length,
      done: done[i],
      unlocked,
      active,
      isLast: i === lesson.sections.length - 1,
    };
  });
}
