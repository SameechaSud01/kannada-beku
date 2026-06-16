import type { QuizOption, QuizQuestion, QuizVocab } from '../types';

const ROUND_SIZE = 10;

export function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toOption(v: QuizVocab, direction: QuizQuestion['direction']): QuizOption {
  if (direction === 'kn-to-en') {
    return { id: v.id, primary: v.meaning, secondary: '' };
  }
  // en→kn: show transliteration (primary) + Kannada script (secondary).
  return { id: v.id, primary: v.transliteration || v.kannada, secondary: v.kannada };
}

/**
 * Build a round of up to 10 questions. Direction alternates kn→en / en→kn.
 * Each question = the target + 3 distractors sampled from `distractorBank`
 * (falls back to `targetBank`). Distractors render from the same vocab fields
 * as the answer, so the option language always matches the direction.
 *
 * Returns fewer questions if the bank is small; options may have < 4 entries
 * only when the pool has fewer than 4 unique items total.
 */
export function buildQuiz(
  targetBank: QuizVocab[],
  distractorBank?: QuizVocab[],
): QuizQuestion[] {
  if (targetBank.length === 0) return [];

  const pool = distractorBank && distractorBank.length >= targetBank.length
    ? distractorBank
    : targetBank;
  const roundSize = Math.min(targetBank.length, ROUND_SIZE);
  const targets = fisherYates(targetBank).slice(0, roundSize);

  return targets.map((target, i) => {
    const direction: QuizQuestion['direction'] = i % 2 === 0 ? 'kn-to-en' : 'en-to-kn';
    const distractors = fisherYates(pool.filter((v) => v.id !== target.id)).slice(0, 3);
    const options = fisherYates(
      [target, ...distractors].map((v) => toOption(v, direction)),
    );
    return {
      itemId: target.id,
      direction,
      // kn→en leads with the English transliteration (Kannada script can clip at
      // the large prompt size); the Kannada word rides along as a small subtitle.
      prompt: direction === 'kn-to-en' ? (target.transliteration || target.kannada) : target.meaning,
      promptSub: direction === 'kn-to-en' && target.transliteration ? target.kannada : '',
      answerId: target.id,
      options,
    };
  });
}
