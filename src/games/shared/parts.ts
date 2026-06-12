import { useMemo } from 'react';
import { lessonSectionsByNo } from '@/constants/lessons/lessonContent';
import { useProgressStore } from '@/stores/progressStore';

/**
 * Shared game sub-part logic (spec_game_subsection_split). A game is split into
 * the same sub-sections as its lesson (1a / 1b / 1c …); each game item carries a
 * `section` key that ties it to one. Parts unlock sequentially, mirroring the
 * lesson sub-part chooser.
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
  doneKeys: ReadonlySet<string>,
): GamePartState[] {
  let activeAssigned = false;
  return sections.map((s, i, arr) => {
    const done = doneKeys.has(s.key);
    const unlocked = i === 0 || doneKeys.has(arr[i - 1].key);
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
  const completed = useProgressStore((s) => s.completedGameParts);

  const sections = useMemo(
    () => availableSections(lessonNo, (items ?? []).map((i) => i.section)),
    [lessonNo, items],
  );

  const parts = useMemo(() => {
    const prefix = `${gameKey}:`;
    const doneKeys = new Set(
      completed.filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length)),
    );
    return computePartStates(sections, doneKeys);
  }, [sections, completed, gameKey]);

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
