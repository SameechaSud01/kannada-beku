import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState } from 'react-native';
import { buildQuiz } from '../utils/roundBuilder';
import { useStreak } from '../../shared/useStreak';
import type { AnswerState, GamePhase, OptionState, QuizQuestion, QuizVocab } from '../types';

export const PER_QUESTION_SECONDS = 10;

type AttemptCallback = (args: { itemId: string; isCorrect: boolean }) => void;

type UseQuickQuizReturn = {
  currentQuestion: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  bestStreak: number;
  phase: GamePhase;
  answerState: AnswerState;
  selectedId: string | null;
  secondsLeft: number;
  optionState: (optionId: string) => OptionState;
  handleOptionTap: (optionId: string) => void;
  handleNext: () => void;
  restart: () => void;
};

export function useQuickQuiz(
  targetBank: QuizVocab[],
  distractorBank?: QuizVocab[],
  onAttempt?: AttemptCallback,
): UseQuickQuizReturn {
  const targetBankRef = useRef(targetBank);
  targetBankRef.current = targetBank;
  const distractorBankRef = useRef(distractorBank);
  distractorBankRef.current = distractorBank;
  const onAttemptRef = useRef(onAttempt);
  onAttemptRef.current = onAttempt;

  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    buildQuiz(targetBank, distractorBank),
  );
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(PER_QUESTION_SECONDS);
  const [isActive, setIsActive] = useState(true);
  const { streak, bestStreak, record: recordStreak, reset: resetStreak } = useStreak();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerStateRef = useRef(answerState);
  answerStateRef.current = answerState;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commitAnswer = useCallback(
    (optionId: string | null) => {
      if (answerStateRef.current !== 'unanswered') return;
      clearTimer();
      const q = questionsRef.current[currentIndex];
      const isCorrect = optionId !== null && optionId === q.answerId;
      setSelectedId(optionId);
      setAnswerState(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) setScore((s) => s + 1);
      recordStreak(isCorrect);
      onAttemptRef.current?.({ itemId: q.itemId, isCorrect });
    },
    [currentIndex, clearTimer, recordStreak],
  );

  // Pause the countdown while the app is backgrounded, so a quiz left mid-question
  // isn't auto-failed on return (audit Phase 5).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setIsActive(s === 'active'));
    return () => sub.remove();
  }, []);

  // Reset the countdown whenever a new question begins.
  useEffect(() => {
    if (phase !== 'playing') return;
    setSecondsLeft(PER_QUESTION_SECONDS);
  }, [currentIndex, phase]);

  // Tick only while playing AND foregrounded; backgrounding clears the interval
  // (freezing secondsLeft), and returning resumes from the frozen value.
  useEffect(() => {
    if (phase !== 'playing' || !isActive) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return clearTimer;
  }, [currentIndex, phase, isActive, clearTimer]);

  // Timeout = wrong answer + auto-reveal.
  useEffect(() => {
    if (phase === 'playing' && answerState === 'unanswered' && secondsLeft === 0) {
      commitAnswer(null);
    }
  }, [secondsLeft, phase, answerState, commitAnswer]);

  // Cleanup on unmount.
  useEffect(() => clearTimer, [clearTimer]);

  const handleOptionTap = useCallback((optionId: string) => commitAnswer(optionId), [commitAnswer]);

  const handleNext = useCallback(() => {
    if (answerStateRef.current === 'unanswered') return;
    clearTimer();
    if (currentIndex + 1 >= questionsRef.current.length) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswerState('unanswered');
      setSelectedId(null);
    }
  }, [currentIndex, clearTimer]);

  const restart = useCallback(() => {
    clearTimer();
    setQuestions(buildQuiz(targetBankRef.current, distractorBankRef.current));
    setCurrentIndex(0);
    setScore(0);
    resetStreak();
    setPhase('playing');
    setAnswerState('unanswered');
    setSelectedId(null);
    setSecondsLeft(PER_QUESTION_SECONDS);
  }, [clearTimer, resetStreak]);

  const optionState = useCallback(
    (optionId: string): OptionState => {
      const q = questionsRef.current[currentIndex];
      if (answerState === 'unanswered') return 'default';
      if (optionId === selectedId && optionId === q.answerId) return 'correct';
      if (optionId === selectedId && optionId !== q.answerId) return 'wrong';
      if (optionId !== selectedId && optionId === q.answerId) return 'reveal';
      return 'disabled';
    },
    [answerState, selectedId, currentIndex],
  );

  return {
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    score,
    streak,
    bestStreak,
    phase,
    answerState,
    selectedId,
    secondsLeft,
    optionState,
    handleOptionTap,
    handleNext,
    restart,
  };
}
