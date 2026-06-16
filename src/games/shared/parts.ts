import { useMemo } from 'react';
import { lessonSectionsByNo, lessonSlugByNo } from '@/constants/lessons/lessonContent';
import { useProgressStore } from '@/stores/progressStore';

/**
 * Shared game sub-part logic (spec_game_subsection_split / spec_fix_games_flow).
 * A game is split into the same sub-sections as its lesson (1a / 1b / 1c …); each
 * game item carries a `section` key that ties it to one. A game part `Nx` unlocks
 * 1:1 with its *lesson* part — once the learner has finished lesson part `Nx` (or
 * the whole lesson), the matching game part is playable.
 */

export interface GamePartState {
  key: string;
  label: string;
  /** Number of game items in this part. */
  count: number;
  index: number;
  done: boolean;
  /** Reachable now — first part, or the previous part is done. */
  unlocked: boolean;
  /** The single in-progress part the chooser highlights. */
  active: boolean;
  isLast: boolean;
}

/** Anything with a section tag — the only field the split logic needs. */
export interface Sectioned {
  section: string | null;
}

/**
 * The sections this game actually has items for, in lesson order, with their
 * display labels (from the canonical lesson content) and item counts. Sections
 * the game has no items for are dropped (empty parts are hidden, spec §3).
 */
function availableSections(
  lessonNo: number,
  itemSections: (string | null)[],
): { key: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of itemSections) {
    if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return lessonSectionsByNo(lessonNo)
    .filter((s) => counts.has(s.key))
    .map((s) => ({ key: s.key, label: s.label, count: counts.get(s.key) as number }));
}

function computePartStates(
  sections: { key: string; label: string; count: number }[],
  playedKeys: ReadonlySet<string>, // completedGameParts → `done`
  unlockedKeys: ReadonlySet<string>, // lesson parts done → `unlocked`
): GamePartState[] {
  let activeAssigned = false;
  return sections.map((s, i, arr) => {
    const done = playedKeys.has(s.key);
    const unlocked = unlockedKeys.has(s.key); // 1:1 with the lesson part
    const active = unlocked && !done && !activeAssigned;
    if (active) activeAssigned = true;
    return {
      key: s.key,
      label: s.label,
      count: s.count,
      index: i,
      done,
      unlocked,
      active,
      isLast: i === arr.length - 1,
    };
  });
}

export interface GameSplit<T> {
  /** Part states for the chooser (empty when the lesson is single-section). */
  parts: GamePartState[];
  /** Show the sub-part chooser (multi-section lesson, no part chosen yet). */
  showChooser: boolean;
  /** Items the runner should actually play for the active part (or whole). */
  playItems: T[];
  /** The section being played, for recording completion. */
  activeSection: string | null;
}

/**
 * Decide whether to show the part chooser or play a single sub-part, and slice
 * the items accordingly. `section` is the `?part=` route param (null = none
 * chosen). A single-section lesson runs whole, no chooser.
 */
export function useGameSplit<T extends Sectioned>(
  gameKey: string,
  lessonNo: number,
  items: T[] | undefined,
  section: string | null,
): GameSplit<T> {
  const completedGameParts = useProgressStore((s) => s.completedGameParts);
  const completedParts = useProgressStore((s) => s.completedParts);
  const completedLessons = useProgressStore((s) => s.completedLessons);

  const sections = useMemo(
    () => availableSections(lessonNo, (items ?? []).map((i) => i.section)),
    [lessonNo, items],
  );

  const parts = useMemo(() => {
    const slug = lessonSlugByNo(lessonNo);
    const lessonComplete = !!slug && completedLessons.includes(slug);
    const gamePrefix = `${gameKey}:`;
    const played = new Set(
      completedGameParts
        .filter((k) => k.startsWith(gamePrefix))
        .map((k) => k.slice(gamePrefix.length)),
    );
    // A whole-lesson completion backfills every section as unlocked; otherwise a
    // section is unlocked once its lesson part is complete (1:1, not the game's
    // own sequence). Single-section lessons land in `completedLessons`, so they
    // unlock through the lessonComplete path.
    const unlocked = new Set(
      lessonComplete
        ? sections.map((s) => s.key)
        : slug
          ? completedParts
              .filter((k) => k.startsWith(`${slug}:`))
              .map((k) => k.slice(slug.length + 1))
          : [],
    );
    return computePartStates(sections, played, unlocked);
  }, [sections, completedGameParts, completedParts, completedLessons, gameKey, lessonNo]);

  const multi = parts.length > 1;
  const showChooser = multi && !section;

  const playItems = useMemo(() => {
    if (!items || showChooser) return [];
    if (multi && section) return items.filter((i) => i.section === section);
    return items; // single-section lesson, or chooser bypassed
  }, [items, showChooser, multi, section]);

  const activeSection = multi ? section : parts[0]?.key ?? null;

  return { parts, showChooser, playItems, activeSection };
}
