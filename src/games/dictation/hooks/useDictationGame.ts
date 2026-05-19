import { useState, useCallback } from 'react';
import { WORD_BANK } from '../data/wordBank';
import { scoreAnswer, classifyScore } from '../utils/fuzzyScore';
import { playWord, stopPlayback } from '../utils/audioPlayer';
import type { DictationWord, AnswerState, GamePhase } from '../types';

type UseDictationGameReturn = {
  currentWord: DictationWord;
  currentIndex: number;
  totalWords: number;
  phase: GamePhase;
  answerState: AnswerState;
  lastScore: number | null;
  sessionAvg: number;
  answeredCount: number;
  isPlaying: boolean;
  playCurrentWord: () => Promise<void>;
  submitAnswer: (text: string) => void;
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

export function useDictationGame(): UseDictationGameReturn {
  const [words, setWords] = useState<DictationWord[]>(() => shuffle(WORD_BANK));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [sessionAvg, setSessionAvg] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentWord = words[currentIndex];
  const totalWords = words.length;

  const playCurrentWord = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await playWord(currentWord);
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying, currentWord]);

  const submitAnswer = useCallback(
    (text: string) => {
      if (answerState !== 'unanswered') return;
      if (text.trim().length === 0) return;
      const score = scoreAnswer(text, currentWord.accepted);
      const state = classifyScore(score);
      setAnswerState(state);
      setLastScore(score);
      setSessionAvg((avg) => Math.round((avg * answeredCount + score) / (answeredCount + 1)));
      setAnsweredCount((c) => c + 1);
    },
    [answerState, currentWord, answeredCount]
  );

  const nextWord = useCallback(() => {
    if (answerState === 'unanswered') return;
    stopPlayback();
    if (currentIndex + 1 >= totalWords) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswerState('unanswered');
      setLastScore(null);
    }
  }, [answerState, currentIndex, totalWords]);

  const skipWord = useCallback(() => {
    if (answerState !== 'unanswered') return;
    stopPlayback();
    if (currentIndex + 1 >= totalWords) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswerState('unanswered');
      setLastScore(null);
    }
  }, [answerState, currentIndex, totalWords]);

  const restart = useCallback(() => {
    stopPlayback();
    setWords(shuffle(WORD_BANK));
    setCurrentIndex(0);
    setPhase('playing');
    setAnswerState('unanswered');
    setLastScore(null);
    setSessionAvg(0);
    setAnsweredCount(0);
    setIsPlaying(false);
  }, []);

  return {
    currentWord,
    currentIndex,
    totalWords,
    phase,
    answerState,
    lastScore,
    sessionAvg,
    answeredCount,
    isPlaying,
    playCurrentWord,
    submitAnswer,
    nextWord,
    skipWord,
    restart,
  };
}
