import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { playWord, stopPlayback } from '../utils/audioPlayer';
import { splitAksharas, isTileable } from '../utils/kannadaAkshara';
import { useStreak } from '../../shared/useStreak';
import { useProgressStore } from '../../../../stores/progressStore';
import type { DictationWord, AnswerState, GamePhase } from '../types';

type AttemptCallback = (args: { itemId: string; isCorrect: boolean }) => void;

export type Tile = { id: string; char: string };

type UseDictationGameReturn = {
  currentWord: DictationWord;
  currentIndex: number;
  totalWords: number;
  phase: GamePhase;
  answerState: AnswerState;
  score: number;
  streak: number;
  bestStreak: number;
  isPlaying: boolean;
  /** Whether the current word is presented as tiles (false → typed fallback). */
  tileable: boolean;
  tray: Tile[];
  /** Tile ids placed in the answer row, in order. */
  placed: string[];
  aksharaCount: number;
  canCheck: boolean;
  playCurrentWord: () => Promise<void>;
  tapTile: (id: string) => void;
  removeAt: (index: number) => void;
  check: () => void;
  submitTyped: (text: string) => void;
  nextWord: () => void;
  skipWord: () => void;
  restart: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Scrambled tiles = the word's aksharas + up to 2 distractor aksharas from
 *  other words (distinct from the target's). */
function buildTray(word: DictationWord, others: DictationWord[]): Tile[] {
  const aksharas = splitAksharas(word.kn);
  const targetSet = new Set(aksharas);
  const pool = others.flatMap((w) => splitAksharas(w.kn)).filter((a) => !targetSet.has(a));
  const distractors = shuffle(Array.from(new Set(pool))).slice(0, 2);
  return shuffle([...aksharas, ...distractors]).map((char, i) => ({ id: `t${i}`, char }));
}

export function useDictationGame(
  bank: DictationWord[],
  onAttempt?: AttemptCallback,
): UseDictationGameReturn {
  const bankRef = useRef(bank);
  bankRef.current = bank;
  const onAttemptRef = useRef(onAttempt);
  onAttemptRef.current = onAttempt;

  const [words, setWords] = useState<DictationWord[]>(() => shuffle(bank));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tray, setTray] = useState<Tile[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const { streak, bestStreak, record: recordStreak, reset: resetStreak } = useStreak();

  const currentWord = words[currentIndex];
  const totalWords = words.length;

  const tileable = useMemo(() => isTileable(currentWord.kn), [currentWord]);
  const aksharaCount = useMemo(
    () => (tileable ? splitAksharas(currentWord.kn).length : 0),
    [tileable, currentWord],
  );

  // Fresh tray whenever the word changes.
  useEffect(() => {
    if (!tileable) {
      setTray([]);
      setPlaced([]);
      return;
    }
    const others = words.filter((_, i) => i !== currentIndex);
    setTray(buildTray(currentWord, others));
    setPlaced([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, words, tileable]);

  const charById = useMemo(() => {
    const m = new Map<string, string>();
    tray.forEach((t) => m.set(t.id, t.char));
    return m;
  }, [tray]);

  const playCurrentWord = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await playWord(currentWord);
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying, currentWord]);

  const tapTile = useCallback(
    (id: string) => {
      if (answerState !== 'unanswered') return;
      setPlaced((p) => {
        if (p.includes(id)) return p.filter((x) => x !== id);
        if (p.length >= aksharaCount) return p;
        return [...p, id];
      });
    },
    [answerState, aksharaCount],
  );

  const removeAt = useCallback(
    (index: number) => {
      if (answerState !== 'unanswered') return;
      setPlaced((p) => p.filter((_, i) => i !== index));
    },
    [answerState],
  );

  const commit = useCallback(
    (isCorrect: boolean) => {
      setAnswerState(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) setScore((s) => s + 1);
      recordStreak(isCorrect);
      // Daily-goal "Practice": one rep per answered word.
      useProgressStore.getState().recordPractice();
      if (currentWord.id) {
        onAttemptRef.current?.({ itemId: currentWord.id, isCorrect });
      }
    },
    [currentWord, recordStreak],
  );

  const check = useCallback(() => {
    if (answerState !== 'unanswered' || placed.length !== aksharaCount) return;
    const assembled = placed.map((id) => charById.get(id) ?? '').join('');
    commit(assembled === currentWord.kn);
  }, [answerState, placed, aksharaCount, charById, currentWord, commit]);

  const submitTyped = useCallback(
    (text: string) => {
      if (answerState !== 'unanswered') return;
      const norm = text.trim().toLowerCase();
      if (norm.length === 0) return;
      const accepted = currentWord.accepted.map((a) => a.trim().toLowerCase());
      commit(accepted.includes(norm));
    },
    [answerState, currentWord, commit],
  );

  const advance = useCallback(() => {
    stopPlayback();
    if (currentIndex + 1 >= totalWords) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswerState('unanswered');
    }
  }, [currentIndex, totalWords]);

  const nextWord = useCallback(() => {
    if (answerState === 'unanswered') return;
    advance();
  }, [answerState, advance]);

  const skipWord = useCallback(() => {
    if (answerState !== 'unanswered') return;
    advance();
  }, [answerState, advance]);

  const restart = useCallback(() => {
    stopPlayback();
    setWords(shuffle(bankRef.current));
    setCurrentIndex(0);
    setPhase('playing');
    setAnswerState('unanswered');
    setScore(0);
    resetStreak();
    setIsPlaying(false);
  }, [resetStreak]);

  return {
    currentWord,
    currentIndex,
    totalWords,
    phase,
    answerState,
    score,
    streak,
    bestStreak,
    isPlaying,
    tileable,
    tray,
    placed,
    aksharaCount,
    canCheck: placed.length === aksharaCount && aksharaCount > 0,
    playCurrentWord,
    tapTile,
    removeAt,
    check,
    submitTyped,
    nextWord,
    skipWord,
    restart,
  };
}
