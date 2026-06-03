import { useState, useCallback, useRef } from 'react';
import { useStreak } from '../../shared/useStreak';
import type { AnswerState, GamePhase, OptionState, ConversationTurn } from '../types';

type AttemptCallback = (args: { itemId: string; isCorrect: boolean }) => void;

type UseConversationReturn = {
  currentTurn:     ConversationTurn;
  currentIndex:    number;
  totalTurns:      number;
  score:           number;
  streak:          number;
  bestStreak:      number;
  phase:           GamePhase;
  answerState:     AnswerState;
  selectedOptionId: string | null;
  /** Chosen option id per already-answered turn index — drives the chat log. */
  answers:         Record<number, string>;
  optionState:     (optionId: string) => OptionState;
  handleOptionTap: (optionId: string) => void;
  handleNext:      () => void;
  restart:         () => void;
};

export function useConversation(
  turns: ConversationTurn[],
  onAttempt?: AttemptCallback,
): UseConversationReturn {
  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const onAttemptRef = useRef(onAttempt);
  onAttemptRef.current = onAttempt;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const { streak, bestStreak, record: recordStreak, reset: resetStreak } = useStreak();

  const handleOptionTap = useCallback(
    (optionId: string) => {
      if (answerState !== 'unanswered') return;
      const turn = turnsRef.current[currentIndex];
      const isCorrect = optionId === turn.correctOptionId;
      setSelectedOptionId(optionId);
      setAnswers((a) => ({ ...a, [currentIndex]: optionId }));
      setAnswerState(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) setScore((s) => s + 1);
      recordStreak(isCorrect);
      onAttemptRef.current?.({ itemId: turn.id, isCorrect });
    },
    [answerState, currentIndex, recordStreak],
  );

  const handleNext = useCallback(() => {
    if (answerState === 'unanswered') return;
    if (currentIndex + 1 >= turnsRef.current.length) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswerState('unanswered');
      setSelectedOptionId(null);
    }
  }, [answerState, currentIndex]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    resetStreak();
    setPhase('playing');
    setAnswerState('unanswered');
    setSelectedOptionId(null);
    setAnswers({});
  }, [resetStreak]);

  const optionState = useCallback(
    (optionId: string): OptionState => {
      const turn = turnsRef.current[currentIndex];
      if (answerState === 'unanswered') return 'default';
      if (optionId === selectedOptionId && optionId === turn.correctOptionId) return 'correct';
      if (optionId === selectedOptionId && optionId !== turn.correctOptionId) return 'wrong';
      if (optionId !== selectedOptionId && optionId === turn.correctOptionId) return 'reveal';
      return 'disabled';
    },
    [answerState, selectedOptionId, currentIndex],
  );

  return {
    currentTurn: turns[currentIndex],
    currentIndex,
    totalTurns: turns.length,
    score,
    streak,
    bestStreak,
    phase,
    answerState,
    selectedOptionId,
    answers,
    optionState,
    handleOptionTap,
    handleNext,
    restart,
  };
}
