export type DictationWord = {
  kn: string;
  audioFile?: number;
  accepted: string[];
  phonetic: string;
};

export type AnswerState = 'unanswered' | 'correct' | 'partial' | 'wrong';

export type GamePhase = 'playing' | 'result';
