import { useState, useCallback, useRef, useEffect } from 'react';
import type { GamePhase, TileState, VocabItem } from '../types';

type AttemptCallback = (args: { itemId: string; isCorrect: boolean }) => void;

const MAX_PAIRS = 6;
const MISMATCH_MS = 550;

export type Tile = { item: VocabItem; state: TileState };

type UseImageMatchBoardReturn = {
  wordColumn: Tile[];
  imageColumn: Tile[];
  matchedCount: number;
  totalPairs: number;
  score: number;
  phase: GamePhase;
  selectedWordId: string | null;
  handleWordTap: (id: string) => void;
  handleImageTap: (id: string) => void;
  /** Clear the current word selection without recording a mismatch (e.g. a
   *  drag released over empty space). */
  deselect: () => void;
  restart: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick up to MAX_PAIRS unique pairs. The lesson's own items (targetBank) come
 * first; if there are fewer than 4, the wider distractorBank (neighbour-lesson
 * union) fills the board so it never degenerates to 1–2 pairs.
 */
export function buildBoardPairs(
  targetBank: VocabItem[],
  distractorBank?: VocabItem[],
): VocabItem[] {
  const seen = new Set<string>();
  const pairs: VocabItem[] = [];
  const push = (item: VocabItem) => {
    if (seen.has(item.id) || pairs.length >= MAX_PAIRS) return;
    seen.add(item.id);
    pairs.push(item);
  };
  shuffle(targetBank).forEach(push);
  if (distractorBank) shuffle(distractorBank).forEach(push);
  // Min-4 guarantee (spec_imagematch_board_redesign §6): targets + distractor
  // union should yield ≥4. If fewer unique pairs exist app-wide, play what we
  // have rather than ship a degenerate 1–2 tile board — but surface it.
  if (pairs.length < 4) {
    console.warn(
      `[image-match] only ${pairs.length} unique pair(s) available — board below the 4-pair minimum`,
    );
  }
  return pairs;
}

type BoardState = {
  pairs: VocabItem[];
  wordOrder: VocabItem[];
  imageOrder: VocabItem[];
};

function initBoard(targetBank: VocabItem[], distractorBank?: VocabItem[]): BoardState {
  const pairs = buildBoardPairs(targetBank, distractorBank);
  return { pairs, wordOrder: shuffle(pairs), imageOrder: shuffle(pairs) };
}

export function useImageMatchBoard(
  targetBank: VocabItem[],
  distractorBank?: VocabItem[],
  onAttempt?: AttemptCallback,
): UseImageMatchBoardReturn {
  const targetBankRef = useRef(targetBank);
  targetBankRef.current = targetBank;
  const distractorBankRef = useRef(distractorBank);
  distractorBankRef.current = distractorBank;
  const onAttemptRef = useRef(onAttempt);
  onAttemptRef.current = onAttempt;

  const [board, setBoard] = useState<BoardState>(() => initBoard(targetBank, distractorBank));
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(() => new Set());
  const [mismatch, setMismatch] = useState<{ wordId: string; imageId: string } | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');

  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (mismatchTimer.current) clearTimeout(mismatchTimer.current);
    },
    [],
  );

  const handleWordTap = useCallback(
    (id: string) => {
      if (mismatch || matchedIds.has(id)) return;
      setSelectedWordId(id);
    },
    [mismatch, matchedIds],
  );

  const handleImageTap = useCallback(
    (id: string) => {
      if (mismatch || matchedIds.has(id) || !selectedWordId) return;

      const isCorrect = id === selectedWordId;
      onAttemptRef.current?.({ itemId: selectedWordId, isCorrect });

      if (isCorrect) {
        const next = new Set(matchedIds);
        next.add(id);
        setMatchedIds(next);
        setScore((s) => s + 1);
        setSelectedWordId(null);
        if (next.size >= board.pairs.length) setPhase('result');
        return;
      }

      setMismatch({ wordId: selectedWordId, imageId: id });
      mismatchTimer.current = setTimeout(() => {
        setMismatch(null);
        setSelectedWordId(null);
      }, MISMATCH_MS);
    },
    [mismatch, matchedIds, selectedWordId, board.pairs.length],
  );

  const deselect = useCallback(() => {
    if (mismatch) return;
    setSelectedWordId(null);
  }, [mismatch]);

  const restart = useCallback(() => {
    if (mismatchTimer.current) clearTimeout(mismatchTimer.current);
    setBoard(initBoard(targetBankRef.current, distractorBankRef.current));
    setSelectedWordId(null);
    setMatchedIds(new Set());
    setMismatch(null);
    setScore(0);
    setPhase('playing');
  }, []);

  const wordState = (id: string): TileState => {
    if (matchedIds.has(id)) return 'matched';
    if (mismatch?.wordId === id) return 'mismatch';
    if (selectedWordId === id) return 'selected';
    return 'default';
  };
  const imageState = (id: string): TileState => {
    if (matchedIds.has(id)) return 'matched';
    if (mismatch?.imageId === id) return 'mismatch';
    return 'default';
  };

  return {
    wordColumn: board.wordOrder.map((item) => ({ item, state: wordState(item.id) })),
    imageColumn: board.imageOrder.map((item) => ({ item, state: imageState(item.id) })),
    matchedCount: matchedIds.size,
    totalPairs: board.pairs.length,
    score,
    phase,
    selectedWordId,
    handleWordTap,
    handleImageTap,
    deselect,
    restart,
  };
}
