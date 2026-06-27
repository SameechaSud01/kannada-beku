import { renderHook, act } from '@testing-library/react-native';
import { useConversation } from '../../src/games/conversations/hooks/useConversation';
import type { ConversationTurn } from '../../src/games/conversations/types';

const TURNS: ConversationTurn[] = [
  {
    id: 't-1',
    scenarioId: 's-1',
    turnIndex: 1,
    speakerLineKn: 'ನಮಸ್ಕಾರ',
    speakerLineEn: 'Hello',
    options: [
      { id: 'a', kn: 'ನಮಸ್ಕಾರ', tr: 'namaskāra', en: 'Hello' },
      { id: 'b', kn: 'ಮನೆ', tr: 'mane', en: 'house' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 't-2',
    scenarioId: 's-1',
    turnIndex: 2,
    speakerLineKn: 'ಹೇಗಿದ್ದೀರ?',
    speakerLineEn: 'How are you?',
    options: [
      { id: 'a', kn: 'ಚೆನ್ನಾಗಿದ್ದೇನೆ', tr: 'chennāgiddēne', en: 'I am fine' },
      { id: 'b', kn: 'ನೀವು', tr: 'nīvu', en: 'you' },
    ],
    correctOptionId: 'a',
  },
];

describe('useConversation', () => {
  it('starts on the first turn, unanswered', () => {
    const { result } = renderHook(() => useConversation(TURNS));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalTurns).toBe(2);
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.currentTurn.id).toBe('t-1');
  });

  it('correct pick scores, reveals, and records against the turn id', () => {
    const attempts: { itemId: string; isCorrect: boolean }[] = [];
    const { result } = renderHook(() => useConversation(TURNS, (a) => attempts.push(a)));
    act(() => result.current.handleOptionTap('a'));
    expect(result.current.answerState).toBe('correct');
    expect(result.current.score).toBe(1);
    expect(attempts).toEqual([{ itemId: 't-1', isCorrect: true }]);
    expect(result.current.optionState('a')).toBe('correct');
  });

  it('wrong pick reveals the correct option', () => {
    const { result } = renderHook(() => useConversation(TURNS));
    act(() => result.current.handleOptionTap('b'));
    expect(result.current.answerState).toBe('wrong');
    expect(result.current.optionState('b')).toBe('wrong');
    expect(result.current.optionState('a')).toBe('reveal');
  });

  it('advances through turns to the result', () => {
    const { result } = renderHook(() => useConversation(TURNS));
    act(() => result.current.handleOptionTap('a'));
    act(() => result.current.handleNext());
    expect(result.current.currentIndex).toBe(1);
    act(() => result.current.handleOptionTap('a'));
    act(() => result.current.handleNext());
    expect(result.current.phase).toBe('result');
    expect(result.current.score).toBe(2);
  });

  it('ignores a second tap on the same turn', () => {
    const { result } = renderHook(() => useConversation(TURNS));
    act(() => result.current.handleOptionTap('a'));
    act(() => result.current.handleOptionTap('b'));
    expect(result.current.score).toBe(1);
    expect(result.current.optionState('a')).toBe('correct');
  });
});
