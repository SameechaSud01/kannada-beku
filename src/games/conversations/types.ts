export type GamePhase = 'playing' | 'result';

export type AnswerState = 'unanswered' | 'correct' | 'wrong';

export type OptionState = 'default' | 'correct' | 'wrong' | 'reveal' | 'disabled';

export type {
  ConversationOption,
  ConversationTurn,
  ConversationScenario,
} from '../../../services/api/games/conversations';
