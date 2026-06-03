export type GamePhase = 'playing' | 'result';

export type QuizDirection = 'kn-to-en' | 'en-to-kn';

export type AnswerState = 'unanswered' | 'correct' | 'wrong';

export type OptionState = 'default' | 'correct' | 'wrong' | 'reveal' | 'disabled';

/** A vocab unit the quiz draws prompts and options from. */
export type QuizVocab = {
  id: string;
  kannada: string;
  transliteration: string;
  meaning: string;
};

export type QuizOption = {
  /** Source vocab id — stable key + correctness check (== question.answerId). */
  id: string;
  /** Primary line (English meaning, or transliteration for en→kn). */
  primary: string;
  /** Secondary line (Kannada script for en→kn; empty for kn→en). */
  secondary: string;
};

export type QuizQuestion = {
  itemId: string;
  direction: QuizDirection;
  /** The prompt word shown to the user. */
  prompt: string;
  /** Sub-line under the prompt (transliteration for kn→en; empty otherwise). */
  promptSub: string;
  /** id of the correct option (equals itemId). */
  answerId: string;
  options: QuizOption[];
};
