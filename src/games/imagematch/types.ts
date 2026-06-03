export type GamePhase = 'playing' | 'result';

/** Visual state of a single board tile (word or image). */
export type TileState = 'default' | 'selected' | 'matched' | 'mismatch';

export type VocabItem = {
  id:    string;
  kn:    string;
  ph:    string;
  en:    string;
  emoji: string;
  imageUrl?: string | null;
};
